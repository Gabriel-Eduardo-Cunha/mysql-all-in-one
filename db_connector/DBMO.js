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

	/**
	 * @description Creates dump from database, it will use "mysqldump" shell command, make sure that "mysql.exe" is on the enviroment variables of your OS. This method will open a independent connection and close it after execution, use it wisely (running this in parallel will create an unlimited number of connections simultaneously, that may reach your server limit)
	 * @param {String} filePath path to the .sql file
	 * @param {String} database database selected during execution
	 */
	this.createBackupShellCommand = (database, filePath) => {
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
				exec(`mysqldump -h ${host} -u ${user} -p${password} ${database} > "${filePath}"`, callback)
			} else {
				exec(`mysqldump -h ${host} -u ${user} ${database} > "${filePath}"`, callback)
			}
		})
	}

	this.connQuery = (conn, query) => new Promise((res, rej) => {
		conn.query(query, (err, results) => {
			err ? rej(err) : res(results)
		})
	})

	this.selectDatabase = async (conn, database) => {
		if(database && typeof database === 'string') {
			await this.connQuery(conn, `USE ${database}`)
		} else {
			const tempDb = `mysql_all_in_one${uniqid()}`.split('-').join('')
			await this.connQuery(conn, `CREATE DATABASE ${tempDb}`)
			await this.connQuery(conn, `USE ${tempDb}`)
			await this.connQuery(conn, `DROP DATABASE ${tempDb}`)
		}
	}

	this.execStatement = (statement, database) => {
		return new Promise((resolve, reject) => {
			this.pool.getConnection(async (connErr, conn) => {
				if (connErr) {
					conn.release()
					reject(connErr)
				} else {
					await this.selectDatabase(conn, database)
					conn.query(statement, (queryErr, results) => {
						if (queryErr) {
							conn.release()
							reject(queryErr)
						} else {
							conn.release()
							resolve(results)
						}
					})
				}
			})
		})
	}

	/**
	 * @description Executes sql from .sql file, it will use "mysql" shell command, make sure that "mysql.exe" is on the enviroment variables of your OS. This method will open a independent connection and close it after execution, use it wisely (running this in parallel will create an unlimited number of connections simultaneously, that may reach your server limit)
	 * @param {String} filePath path to the .sql file
	 * @param {String} database database selected during execution
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
	this.runMultipleStatements = async (sql, database, options={}) => {
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
		await this.execStatement(`CREATE DATABASE ${database};`)
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
		const backupPromise = this.createBackup(database, backupPath)
		try {
			await this.runMultipleStatements(sql, database)
			backupPromise.then(() => {
				fs.unlinkSync(backupPath)
			})
			return true
		} catch (err) {
			await backupPromise
			await this.rollBack(database, backupPath)
			fs.unlinkSync(backupPath)
			throw err
		}
	}

	this.runQueryTransactionFromFile = async (filePath, database) => {
		const backupPath = path.join(__dirname, '..', `backup-${uniqid()}.sql`)
		const backupPromise = this.createBackup(database, backupPath)
		try {
			await this.execSqlFromFile(filePath, database)
			backupPromise.then(() => {
				fs.unlinkSync(backupPath)
			})
			return true
		} catch (err) {
			await backupPromise
			await this.rollBack(database, backupPath)
			fs.unlinkSync(backupPath)
			throw err
		}
	}

}