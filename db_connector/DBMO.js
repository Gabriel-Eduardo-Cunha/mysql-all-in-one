const mysql = require('mysql2');
const mysqldump = require('mysqldump')
const {splitQuery, mysqlSplitterOptions} = require('dbgate-query-splitter')
const read = require('read-file');
const {v4: uniqid} = require('uuid')
const fs = require("fs");

const normalizeFileExtesion = filepath => {
	if (typeof filepath !== "string") return filepath;
	const pathSplitted = filepath.split('.')
	if (pathSplitted[pathSplitted.length - 1] !== "sql") {
		return `${filepath}.sql`
	}
	return filepath
}

module.exports = function (connectionData) {

	this.connectionData = connectionData

	this.setConnectionData = (connectionData) => this.connectionData = connectionData

	this.createBackup = async (database, filePath) => {
		await mysqldump({
			connection: {
				...this.connectionData,
				database
			},
			dump: {
				trigger: {
					delimiter: '$$'
				},
				data: {
					format: false,
					maxRowsPerInsertStatement: 1000
				},
				schema: {
					format: false
				}
			},
			dumpToFile: filePath,

		}).catch(err => console.log(err));
	}

	this.execSqlAsync = (sql, connection, database) => {
		if(!connection) {
			connection = mysql.createConnection({...this.connectionData, database})
		}
		return new Promise((resolve, reject) => {
			connection.query(sql, (err, results) => {
				if (err) {
					reject(err)
				} else {
					resolve(results)
				}
			})
		})
	}

	this.runMultipleStatements = (sql, database) => {
		const statements = splitQuery(sql, mysqlSplitterOptions)
		const pool = mysql.createPool({...this.connectionData, database})
		return new Promise((resolve, reject) => {
			pool.getConnection(async (err, conn) => {
				if(err) reject(err);
				try {
					for (const statement of statements) {
						await this.execSqlAsync(statement, conn)
					}
					conn.release()
					resolve()
				} catch (err) {
					conn.release()
					reject(err)
				}
			})

		})
	}

	this.emptyDatabase = async database => {
		await this.runMultipleStatements(`DROP DATABASE IF EXISTS ${database};CREATE DATABASE IF NOT EXISTS ${database};`, database)
	}

	this.rollBack = async (database, backupPath) => {
		const dumpSql = read.sync(normalizeFileExtesion(backupPath), {normalize:true})
		await this.emptyDatabase(database)
		await this.runMultipleStatements(dumpSql, database)
	}

	this.runQueryTransaction = async (sql, database) => {
		const backupPath = `${__dirname}\\..\\temp_backups\\backup-${uniqid()}.sql`
		await this.createBackup(database, backupPath)
		try {
			await this.runMultipleStatements(sql, database)
			fs.unlinkSync(backupPath)
			return true
		} catch (err) {
			await this.rollBack(database, backupPath)
			fs.unlinkSync(backupPath)
			throw err
		}
	}

}