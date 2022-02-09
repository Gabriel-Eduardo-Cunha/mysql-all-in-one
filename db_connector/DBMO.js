// DBMO = Database Manipulator Object

const mysql = require('mysql2');
const mysqldump = require('mysqldump')
const { splitQuery, mysqlSplitterOptions } = require('dbgate-query-splitter')
const path = require('path')
const { v4: uniqid } = require('uuid')
const fs = require("fs");
const _ = require('lodash')
const { exec } = require("child_process");

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

		})
	}

	this.execSqlAsync = (sql, connection, database) => {
		if (!connection) {
			connection = mysql.createConnection({ ...this.connectionData, database })
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

	this.execSqlFromFile = async (filePath, database) => {
		const { host, user, password } = this.connectionData
		return new Promise((res, rej) => {
			const callback = err => {
				if(err) {
					rej(err);
				} else {
					res()
				}
			}
			if (password) {
				exec(`mysql -h ${host} -u ${user} -p${password} ${database} <"${filePath}"`, callback)
			} else {
				exec(`mysql -h ${host} -u ${user} ${database} <"${filePath}"`, callback)
			}
		})
	}

	this.execSqlNoDbAsync = (sql) => {
		const connection = mysql.createConnection({ ...this.connectionData })

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
		const pool = mysql.createPool({ ...this.connectionData, database })
		return new Promise((resolve, reject) => {
			pool.getConnection(async (err, conn) => {
				if (err) reject(err);
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
		await this.execSqlNoDbAsync(`DROP DATABASE IF EXISTS ${database}`)
		await this.execSqlNoDbAsync(`CREATE DATABASE IF NOT EXISTS ${database}`)
	}

	this.rollBack = async (database, backupPath) => {
		await this.emptyDatabase(database)
		await this.execSqlFromFile(backupPath, database)
	}

	/**
	 * 
	 * @param {String} sql 
	 * @param {String} database 
	 * @returns {boolean||Error} true if success, object error otherwise
	 */
	this.runQueryTransaction = async (sql, database) => {
		const backupPath = path.join(__dirname, '..', `backup-${uniqid()}.sql`)
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

	this.runQueryTransactionFromFile = async (filePath, database) => {
		const backupPath = path.join(__dirname, '..', `backup-${uniqid()}.sql`)
		await this.createBackup(database, backupPath)
		try {
			await this.execSqlFromFile(filePath, database)
			fs.unlinkSync(backupPath)
			return true
		} catch (err) {
			await this.rollBack(database, backupPath)
			fs.unlinkSync(backupPath)
			throw err
		}
	}

}