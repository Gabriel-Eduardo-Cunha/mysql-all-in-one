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

	/**
	 * 
	 * @param {String} database 
	 * @param {String} filePath 
	 * @param {Object} opts 
	 * @param {Number} opts.maxRowsPerInsertStatement max rows inserted at once per insert statement (default 10), small numbers are slower to execute but are more safe to memory leaks on the MySQL Server.
	 */
	this.createBackup = async (database, filePath, opts={}) => {
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
					maxRowsPerInsertStatement: opts.maxRowsPerInsertStatement || 10
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

	this.runMultipleStatementsInsideTransaction = async (sql, database) => {
		const statements = splitQuery(sql, mysqlSplitterOptions)
		return new Promise((res, rej) => {
			this.pool.getConnection((err, conn) => {
				if(err) rej(err);
				conn.beginTransaction(async beginErr => {
					if(beginErr) rej(beginErr);
					try {
						await this.selectDatabase(conn, database)
						for (const statement of statements) {
							await this.connQuery(conn, statement)
						}
						
						conn.commit(commitErr => {
							if(commitErr) {
								rej(commitErr);
							} else {
								res(true);
							}
						})
					} catch (queryErr) {
						conn.rollback()
						rej(queryErr)
					}
				})
			})
		})
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
	 * @description Will create a backup before executing the sql, in case of any error, the backup is restored and the error is thrown
	 * @param {String} filePath Path to the .sql file containing the query to be executed
	 * @param {String} database Database selected during the execution
	 * @param {Object} opts 
	 * @param {String} opts.backupPath If defined, the backup will be saved on the specified path and won't be deleted once the operation is completed
	 * @returns {boolean||Error} true if success, object error otherwise
	 */
	this.runQueryTransaction = async (sql, database, opts={}) => {
		const backupPath = opts.backupPath !== undefined && typeof opts.backupPath === 'string' ? opts.backupPath : path.join(__dirname, '..', `backup-${uniqid()}.sql`)
		await this.createBackup(database, backupPath)
		try {
			await this.runMultipleStatements(sql, database)
			if(!(opts.backupPath !== undefined && typeof opts.backupPath === 'string')) {
				fs.unlink(backupPath, err => {if(err) throw err})
			}
			return true
		} catch (err) {
			await this.rollBack(database, backupPath)
			if(!(opts.backupPath !== undefined && typeof opts.backupPath === 'string')) {
				fs.unlink(backupPath, err => {if(err) throw err})
			}
			throw err
		}
	}

	/**
	 * @description Will create a backup before executing the sql, in case of any error, the backup is restored and the error is thrown
	 * @param {String} filePath Path to the .sql file containing the query to be executed
	 * @param {String} database Database selected during the execution
	 * @param {Object} opts 
	 * @param {String} opts.backupPath If defined, the backup will be saved on the specified path and won't be deleted once the operation is completed
	 * @param {String} opts.backupOpts Opts to pass to createBackup function
	 * @returns {boolean||Error} true if success, object error otherwise
	 */
	this.runQueryTransactionFromFile = async (filePath, database, opts={}) => {
		const backupPath = opts.backupPath !== undefined && typeof opts.backupPath === 'string' ? opts.backupPath : path.join(__dirname, '..', `backup-${uniqid()}.sql`)
		await this.createBackup(database, backupPath, opts.backupOpts || {})
		try {
			await this.execSqlFromFile(filePath, database)
			if(!(opts.backupPath !== undefined && typeof opts.backupPath === 'string')) {
				fs.unlink(backupPath, err => {if(err) throw err})
			}
			return true
		} catch (err) {
			await this.rollBack(database, backupPath)
			if(!(opts.backupPath !== undefined && typeof opts.backupPath === 'string')) {
				fs.unlink(backupPath, err => {if(err) throw err})
			}
			throw err
		}
	}

}