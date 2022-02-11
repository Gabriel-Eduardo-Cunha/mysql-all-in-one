// DBMO = Database Manipulator Object

const mysql = require('mysql2');
const mysqldump = require('mysqldump')
const { splitQuery, mysqlSplitterOptions } = require('dbgate-query-splitter')
const path = require('path')
const { v4: uniqid } = require('uuid')
const fs = require("fs");
const { exec } = require("child_process");

module.exports = function (connectionData) {

	this.connectionData = connectionData

	this.setConnectionData = (connectionData) => {
		this.connectionData = connectionData
		this.pool = mysql.createPool(connectionData)
	}

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

	this.execStatement = (statement, database) => {
		return new Promise((resolve, reject) => {
			this.pool.getConnection((connErr, conn) => {
				if (connErr) {
					conn.release()
					reject(connErr)
				} else {
					conn.changeUser({database}, userErr => {
						if(userErr) {
							conn.release()
							reject(userErr);
						}
						conn.query(statement, (queryErr, results) => {
							if (queryErr) {
								conn.release()
								reject(queryErr)
							} else {
								conn.release()
								resolve(results)
							}
						})
					})
				}
			})
		})
	}

	/**
	 * @description Executes sql from .sql file, it will use "mysql" cmd command, make sure that it is onde enviroment variables of your OS. This method will open a independent connection and close it after execution, use it wisely (running this in parallel will create an unlimited number of connections simultaneously, that may reach your server limit)
	 * @param {String} filePath path to the .sql file
	 * @param {String} database database selected during execution
	 * @returns 
	 */
	this.execSqlFromFile = async (filePath, database) => {
		const { host, user, password } = this.connectionData
		return new Promise((res, rej) => {
			const callback = err => {
				if (err) {
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

	/**
	 * @description Executes a multiple statements string
	 * @param {String} sql SQL String that contains one or multiple statements
	 * @param {String} database (optional) Database selected during the statements execution
	 * @param {Object} options 
	 * @param {Boolean} options.runUnordered (default false) if set to TRUE the statements will be executed in parallel, order may be compromised, but will be considerably faster.
	 */
	this.runMultipleStatements = async (sql, database, options) => {
		const statements = splitQuery(sql, mysqlSplitterOptions)
		if(options.runUnordered === true) {
			await Promise.all(statements.map(statement => this.execStatement(statement, database)))
		} else {
			for (const statement of statements) {
				await this.execStatement(statement, database)
			}
		}
	}

	/**
	 * @description Will drop and recreate the database
	 * @param {String} database database to empty
	 */
	this.emptyDatabase = async database => {
		await this.execStatement(`DROP DATABASE IF EXISTS ${database};`)
		await this.execStatement(`CREATE DATABASE IF NOT EXISTS ${database};`)
	}

	this.rollBack = async (database, dumpFile) => {
		await this.emptyDatabase(database)
		await this.execSqlFromFile(dumpFile, database)
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