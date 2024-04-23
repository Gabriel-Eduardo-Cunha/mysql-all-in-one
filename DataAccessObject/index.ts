import mysql, {
	PoolOptions,
	Pool,
	OkPacket,
	PoolConnection,
	Connection,
	ConnectionOptions,
} from "mysql2";
import fs from "fs";
import { mysqlSplitterOptions, splitQuery } from "dbgate-query-splitter";
import { SelectOptions } from "../QueryBuilder/select/types";
import {
	isPreparedStatement,
	isSqlValues,
	PreparedStatement,
} from "../QueryBuilder/types";
import { isNotEmptyString, putBackticks } from "../QueryBuilder/utils";
import {
	escStr,
	select as QuerySelect,
	insert as QueryInsert,
	update as QueryUpdate,
	deleteFrom as QueryDelete,
} from "../QueryBuilder";
import {
	DataPacket,
	DataSelectOptions,
	defaultDataSelectOptions,
	isGroupDataOptions,
	InsertOptionsDAO,
	DataAccessObjectOptions,
	defaultDataAccessObjectOptions,
	GetPoolConnectionCallback,
	GetPoolConnectionOptions,
	DatabaseSelected,
	defaultGetPoolConnectionOptions,
	UpsertRow,
	UpsertOptions,
	defaultUpsertOptions,
	isRowDataPacket,
	isDataPacket,
	isColumnValues,
	Transaction,
} from "./types";
import { arrayUnflat, group, statementsMerge } from "./utils";
import { ConditionOptions } from "../QueryBuilder/select/conditionals/types";
import { DeleteOptions } from "../QueryBuilder/delete/types";
import { UpdateOptions, UpdateValues } from "../QueryBuilder/update/types";
import {
	InsertOptions,
	InsertRows,
	isInsertRows,
} from "../QueryBuilder/insert/types";
import { exec } from "child_process";
import { generateQueryFromPreparedStatement } from "../QueryBuilder/generate_query_from_prepared_statement";

/**
 * @description With a DataAccessObject instance is possible to execute commands, dump databases and load dumps (or any .sql file)
 * @param {PoolOptions} connectionData
 */
export class DataAccessObject {
	protected connectionData: PoolOptions;
	protected pool: Pool;
	protected options: DataAccessObjectOptions;
	protected executionMethod: Function;
	protected multipleStatementsPool: Pool;

	/**
	 * @description With this instance is possible to execute commands (SELECT, INSERT, UPDATE, DELETE and any query in general), dump databases and load dumps (or any .sql file)
	 * @param connectionData Information to create a connection. DataAccessObject uses a mysql2 pool behind the scenes, see: https://www.npmjs.com/package/mysql2#using-connection-pools.
	 * @param options Extra options like `usePreparedStatements`
	 * @example const dao = new DataAccessObject({
	 * host: 'localhost',
	 * user: 'root',
	 * port: 3306,
	 * password: '',
	 * });
	 */
	constructor(
		connectionData: PoolOptions,
		options?: DataAccessObjectOptions
	) {
		this.options = { ...defaultDataAccessObjectOptions, ...options };
		this.connectionData = connectionData;
		this.pool = mysql.createPool({
			...connectionData,
			multipleStatements: false,
		});
		this.multipleStatementsPool = mysql.createPool({
			...connectionData,
			multipleStatements: true,
		});
		this.executionMethod =
			this.options.usePreparedStatements === true
				? this.execute
				: this.query;

		// this.getPoolConnection(() => {
		// 	//Connection is OK
		// }).catch((err) => {
		// 	console.error(
		// 		"Could not start connection, check your connection credencials."
		// 	);
		// 	throw err;
		// });
	}

	/**
	 * @description Creates a dump sql file.
	 * @param database Database to dump
	 * @param filePath File to output the dump (Won't create the folders if they don't exists).
	 * @example dumpDatabase('mydatabase', './folder/mydatabase.sql');
	 */
	public async dumpDatabase(
		database: string,
		filePath: string
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const { host, user, password, port } = this.connectionData;
			exec(
				`mysqldump -h ${host}${port ? ` -P ${port}` : ""} -u ${user}${
					password ? ` -p${password}` : ""
				} ${database} > "${filePath}"`,
				(err) => {
					if (err) return reject(err);
					resolve();
				}
			);
		});
	}

	/**
	 * @description Closes all connections. Node.js event loop will not be blocked by DAO anymore.
	 */
	public dispose() {
		return new Promise<void>((res, rej) => {
			this.multipleStatementsPool.end((err) => {
				if (err) return rej(err);
				this.pool.end((err) => {
					if (err) return rej(err);
					res();
				});
			});
		});
	}

	/**
	 * @description Will drop and recreate a database.
	 * @param database Database to empty
	 * @example emptyDatabase('mydatabase');
	 */
	public async emptyDatabase(database: string) {
		try {
			await this.query(
				`DROP DATABASE IF EXISTS ${putBackticks(database)};`
			);
			await this.query(`CREATE DATABASE ${putBackticks(database)};`);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Creates a new database from dump file (WARNING: if the database alredy exists it will be emptied).
	 * @param database Database to be created or emptied
	 * @param dumpFilePath Path to the dump file
	 * @example loadDump('mydatabase', './folder/mydatabase.sql');
	 */
	public async loadDump(database: string, dumpFilePath: string) {
		try {
			await this.emptyDatabase(database);
			await this.loadSqlFile(database, dumpFilePath);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Runs statements inside sql file on a specific database.
	 * @param database Database selected during statements execution.
	 * @param sqlFilePath Path to the sql file
	 * @example loadSqlFile('mydatabase', './folder/mysqlstatements.sql');
	 */
	public async loadSqlFile(database: string, sqlFilePath: string) {
		try {
			const sql = fs.readFileSync(sqlFilePath, "utf8");

			const sqlStatements = splitQuery(
				sql,
				mysqlSplitterOptions
			) as Array<string>;
			const maxAllowedPacket = parseInt(
				await this.getServerVariable("max_allowed_packet")
			);

			if (maxAllowedPacket && typeof maxAllowedPacket === "number") {
				const statementGroups = statementsMerge(
					sqlStatements,
					maxAllowedPacket / 2
				);
				await this.getPoolConnection(
					async (conn) => {
						for (const statementGroup of statementGroups) {
							await this.connQuery(conn, statementGroup);
						}
					},
					{ database, multipleStatements: true }
				);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Executes select command as a prepared statement and return its results.
	 * @param selectOpts Select object structure.
	 * @param opts Extra options about the command like `database`, `returnMode`, ...
	 * @example select({
	 * columns: ['id', 'foo', 'bar'],
	 * from: 'table',
	 * where: {id: 1},
	 * }, {
	 * database: 'foo',
	 * });
	 */
	public async select(
		selectOpts: SelectOptions,
		opts?: DataSelectOptions & DatabaseSelected
	) {
		try {
			const {
				returnMode,
				specificColumn,
				specificRow,
				groupData,
				database,
				executionMode,
			} = {
				...defaultDataSelectOptions,
				...opts,
			};
			const prepStatement: PreparedStatement = QuerySelect({
				...selectOpts,
				returnPreparedStatement: true,
			}) as PreparedStatement;

			let resultSet;
			if (executionMode === "query") {
				resultSet = (await this.query(
					prepStatement,
					database
				)) as DataPacket;
			} else if (executionMode === "prepared-statement") {
				resultSet = (await this.execute(
					prepStatement,
					database
				)) as DataPacket;
			} else {
				resultSet = (await this.executionMethod(
					prepStatement,
					database
				)) as DataPacket;
			}
			if (!Array.isArray(resultSet)) return resultSet;
			if (isGroupDataOptions(groupData)) {
				resultSet = group(
					resultSet,
					groupData.by,
					groupData.columnGroups
				);
			}
			if (!isDataPacket(resultSet)) return null;
			switch (returnMode) {
				case "normal":
					return isDataPacket(resultSet) ? resultSet : null;
				case "firstRow":
					return isRowDataPacket(resultSet?.[0])
						? resultSet[0]
						: null;
				case "firstColumn":
					const columnValues = resultSet.map((row) =>
						typeof row === "object"
							? Object.values(row)?.[0]
							: undefined
					);
					return isColumnValues(columnValues) ? columnValues : null;
				case "firstValue":
					const firstRow = resultSet[0];
					if (!isRowDataPacket(firstRow)) return null;
					const firstRowValues = Object.values(firstRow);
					return firstRowValues.length !== 0 &&
						isSqlValues(firstRowValues[0])
						? firstRowValues[0]
						: null;
				case "specific":
					if (
						specificRow === undefined &&
						specificColumn === undefined
					)
						return resultSet;
					if (
						specificRow !== undefined &&
						typeof specificRow === "number" &&
						resultSet.length > specificRow &&
						isRowDataPacket(resultSet[specificRow])
					) {
						return resultSet[specificRow];
					}
					if (
						specificColumn !== undefined &&
						typeof specificColumn === "string" &&
						resultSet.length !== 0 &&
						resultSet.every(
							(row) =>
								isRowDataPacket(row) &&
								row[specificColumn] !== undefined &&
								isSqlValues(row[specificColumn])
						)
					) {
						const columnValues = resultSet.map(
							(row) => row[specificColumn]
						);
						if (isColumnValues(columnValues)) return columnValues;
					}
			}
			return null;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Executes delete command as a prepared statement and return number of rows deleted.
	 * @param table Table to delete from.
	 * @param whereOpts Optional where object to filter delete.
	 * @param opts Extra delete options like `ignore`, `quick`
	 * @returns Number of deleted rows
	 * @example delete('table', {id: 5}, {ignore: true});
	 */
	public async delete(
		table: string,
		whereOpts?: ConditionOptions,
		opts?: DeleteOptions & DatabaseSelected,
		conn?: PoolConnection
	) {
		try {
			const { database } = { ...opts };
			delete opts?.database;
			const preparedStatement = QueryDelete(table, whereOpts, {
				...opts,
				returnPreparedStatement: true,
			}) as PreparedStatement;
			const result = (await this.executionMethod(
				preparedStatement,
				database,
				conn
			)) as OkPacket;
			return result.affectedRows;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Executes update command as a prepared statement and return the number of affected rows.
	 * @param table Target table.
	 * @param values Values to be updated (associative column: value).
	 * @param whereOpts Optional where object to filter update.
	 * @param opts Extra update options like `ignore`, `order`, `limit`
	 * @returns Number of affected rows;
	 * @example update('table', {name: 'foo', finished: 1}, {id: 3}, {ignore: true});
	 */
	public async update(
		table: string,
		values: UpdateValues,
		whereOpts?: ConditionOptions,
		opts?: UpdateOptions & DatabaseSelected,
		conn?: PoolConnection
	) {
		try {
			const { database } = { ...opts };
			delete opts?.database;
			const preparedStatement = QueryUpdate(table, values, whereOpts, {
				...opts,
				returnPreparedStatement: true,
			}) as PreparedStatement;
			const result = (await this.executionMethod(
				preparedStatement,
				database,
				conn
			)) as OkPacket;
			return result.affectedRows;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Will execute insert command as a prepared statement, by default will insert one row at a time, if you need to insert a large number of rows specify the option `rowsPerStatement` to insert more than one row per statement increassing performance.
	 * @param table Target table to insert.
	 * @param rows One or multiple rows to insert.
	 * @param opts Extra insert options like `rowsPerStatement`, `ignore`, `columns`.
	 * @returns Inserted ids (if);
	 * @example insert('table', [{foo: 'bar1'}, {foo: 'bar2'}], {ignore: true});
	 */
	public async insert(
		table: string,
		rows: InsertRows,
		opts?: InsertOptionsDAO & InsertOptions & DatabaseSelected,
		conn?: PoolConnection
	) {
		try {
			opts = { ...opts, returnPreparedStatement: true };
			const { rowsPerStatement, database } = {
				...opts,
			};
			const isArrayOfRows = Array.isArray(rows);
			delete opts?.rowsPerStatement;
			delete opts?.database;
			if (isInsertRows(rows)) {
				if (!Array.isArray(rows)) rows = [rows];
				if (
					rowsPerStatement !== undefined &&
					rowsPerStatement !== null &&
					typeof rowsPerStatement === "number" &&
					rowsPerStatement > 0
				) {
					const rowsGroups = arrayUnflat(rows, rowsPerStatement);
					for (const rowsGroup of rowsGroups) {
						const preparedStatement = QueryInsert(
							table,
							rowsGroup,
							opts
						) as PreparedStatement;

						await this.executionMethod(
							preparedStatement,
							database,
							conn
						);
					}
					return null;
				}
				const insertedIds = [];
				for (const row of rows) {
					const preparedStatement = QueryInsert(
						table,
						row,
						opts
					) as PreparedStatement;

					const result = (await this.executionMethod(
						preparedStatement,
						database,
						conn
					)) as OkPacket;
					insertedIds.push(result.insertId);
				}
				return insertedIds.length === 0
					? null
					: insertedIds.length === 1 && !isArrayOfRows
					? insertedIds[0]
					: insertedIds;
			}
			return null;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Executes an update if the primary key column is defined in the row, executes an insert otherwise. (you can define the primary key column passing the name in the option `primaryKey`)
	 * @param table Table to either update or insert
	 * @param rows Row to either update or insert
	 * @param opts Extra options like `primaryKey`
	 * @returns One or many affected ids
	 */
	public async upsert(
		table: string,
		rows: UpsertRow,
		opts?: UpsertOptions & DatabaseSelected,
		conn?: PoolConnection
	) {
		try {
			opts = { ...defaultUpsertOptions, ...opts };
			const { primaryKey, database } = opts;
			if (!isInsertRows(rows) || typeof primaryKey !== "string")
				return null;
			if (!Array.isArray(rows)) rows = [rows];
			const affectedIds: Array<number> = [];
			for (const row of rows) {
				if (row[primaryKey] !== undefined) {
					const where: ConditionOptions = {};
					where[primaryKey] = row[primaryKey];
					await this.update(table, row, where, { database }, conn);
					const primaryKeyValue = row[primaryKey];
					if (
						primaryKeyValue !== null &&
						primaryKeyValue !== undefined &&
						(typeof primaryKeyValue === "number" ||
							(typeof primaryKeyValue === "string" &&
								!isNaN(+primaryKeyValue)))
					) {
						if (typeof primaryKeyValue === "string") {
							affectedIds.push(parseInt(primaryKeyValue));
							continue;
						}
						affectedIds.push(primaryKeyValue);
					}
					continue;
				}
				const insertedId = await this.insert(
					table,
					row,
					{ database },
					conn
				);
				if (typeof insertedId === "number")
					affectedIds.push(insertedId);
			}
			return affectedIds.length === 0
				? null
				: affectedIds.length === 1
				? affectedIds[0]
				: affectedIds;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description Runs a query and return it's results, this command don't prepare and execute the statement.
	 * @param sql Query to execute.
	 * @param database Database selected during the query execution. If null will use default connection database passed on connectionData from DAO object.
	 * @returns Query response.
	 * @example query('SELECT * FROM `table`, 'mydatabase');
	 */
	public async query(
		sql: string | PreparedStatement,
		database?: string,
		conn?: PoolConnection
	) {
		try {
			const connectionCallback = async (conn: PoolConnection) => {
				return await this.connQuery(conn, sql);
			};
			if (conn !== undefined) {
				return connectionCallback(conn);
			}
			return await this.getPoolConnection(connectionCallback, {
				database,
			});
		} catch (error) {
			throw error;
		}
	}

	public async databaseExists(database: string) {
		try {
			await this.query(`USE ${database}`);
			return true;
		} catch (err) {
			return false;
		}
	}

	/**
	 * @description Creates a transaction, able to execute Insert, Update, Delete or even Upsert. When finished, the transaction can be commited, or in case of failure, it can be rollbacked.
	 * @param database Database selected during the transaction.
	 * @returns Transaction Object
	 * @example const transaction = await dao.startTransaction();
	try {
		await transaction.insert("arquivo", {
			module: "1",
			moduleId: 123,
			keyS3: "/row
			",
			name: "avc",
		});
		await transaction.insert("arquivo", {
			module: "2",
			moduleId: 123,
			keyS3: "/row",
			name: "avc",
		});
		await transaction.update(
			"arquivo",
			{ keyS3: "UPDATED_S3" },
			{ module: 2 }
		);

		await transaction.delete("arquivo", { module: 1 });
		await transaction.delete("unknow_table" , {
			module: 2,
		});

		await transaction.commit();
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
	 */
	public async startTransaction(database?: string): Promise<Transaction> {
		return new Promise((res, rej) => {
			try {
				return this.getPoolConnection(
					(conn) => {
						return new Promise<void>(
							(resolveTransaction, rejectTransaction) => {
								conn.beginTransaction((err) => {
									if (err) {
										rejectTransaction(err);
										return rej(err);
									}
									return res({
										delete: (
											table: string,
											whereOpts?: ConditionOptions,
											opts?: DeleteOptions
										) =>
											this.delete(
												table,
												whereOpts,
												opts,
												conn
											),
										insert: (
											table: string,
											rows: InsertRows,
											opts?: InsertOptionsDAO &
												InsertOptions
										) =>
											this.insert(
												table,
												rows,
												opts,
												conn
											),
										update: (
											table: string,
											values: UpdateValues,
											whereOpts?: ConditionOptions,
											opts?: UpdateOptions
										) =>
											this.update(
												table,
												values,
												whereOpts,
												opts,
												conn
											),
										upsert: (
											table: string,
											rows: UpsertRow,
											opts?: UpsertOptions
										) =>
											this.upsert(
												table,
												rows,
												opts,
												conn
											),
										commit: () =>
											new Promise<void>((res, rej) => {
												conn.commit((err) => {
													if (err) {
														return conn.rollback(
															() => {
																rej(err);
																rejectTransaction(
																	err
																);
															}
														);
													}
													resolveTransaction();
													return res();
												});
											}),
										rollback: async () =>
											new Promise<void>((res, rej) => {
												try {
													return conn.rollback(
														function () {
															resolveTransaction();
															return res();
														}
													);
												} catch (error) {
													rejectTransaction(error);
													return rej(error);
												}
											}),
									});
								});
							}
						);
					},
					{ database }
				);
			} catch (error) {
				rej(error);
			}
		});
	}

	private async execute(
		preparedStatement: PreparedStatement,
		database?: string,
		conn?: PoolConnection
	) {
		try {
			const connectionCallback = async (conn: PoolConnection) => {
				try {
					return await this.connExecute(conn, preparedStatement);
				} catch (error) {
					throw error;
				}
			};
			if (conn !== undefined) {
				return await connectionCallback(conn);
			}
			return await this.getPoolConnection(connectionCallback, {
				database,
			});
		} catch (error) {
			throw error;
		}
	}

	public getPoolConnection(
		callback: GetPoolConnectionCallback,
		opts?: GetPoolConnectionOptions
	) {
		const { multipleStatements, database } = {
			...defaultGetPoolConnectionOptions,
			...opts,
		};
		return new Promise((resolve, reject) => {
			try {
				(multipleStatements === true
					? this.multipleStatementsPool
					: this.pool
				).getConnection(async (err, conn) => {
					if (err) {						
						conn?.destroy();
						reject(err);
						return;
					}
					try {
						await this.connUseDatabase(conn, database);
	
						resolve(await callback(conn));
						
						await this.connUseDefaultDatabase(conn);
						
						conn.release();
					} catch (error) {
						try {
							await this.connUseDefaultDatabase(conn);
							conn.release();
						} catch (error) {
							conn.destroy();
						}
						return reject(error);
					}
				});
			} catch (error) {

				reject(error);
			}
		});
	}

	private async connUseDatabase(conn: PoolConnection, database?: string) {
		const shouldChangeDatabase =
			isNotEmptyString(database) &&
			database !== this.connectionData.database;

		// Change to the desired database
		if (shouldChangeDatabase) {
			await this.connChangeUser(conn, {
				database: database as string,
			});
		} else if (
			this.connectionData.database !== conn.config.database &&
			isNotEmptyString(this.connectionData.database)
		) {
			await this.connChangeUser(conn, {
				database: this.connectionData.database,
			});
		}
	}
	private async connUseDefaultDatabase(conn: PoolConnection) {
		try {
			// Change back to the original connection database
			if (isNotEmptyString(this.connectionData.database)) {
				await this.connChangeUser(conn, {
					database: this.connectionData.database,
				});
			}
		} catch (error) {
			throw error;
		}
	}

	private connExecute(
		conn: PoolConnection,
		preparedStatement: PreparedStatement
	) {
		return new Promise((resolve, reject) => {
			conn.execute(
				preparedStatement.statement,
				preparedStatement.values?.map((e) =>
					e === undefined ? null : e
				),
				(err, result) => {
					if (err) return reject(err);
					resolve(result);
				}
			);
		});
	}

	private connQuery(
		conn: Connection,
		sql: string | PreparedStatement
	): Promise<
		| mysql.RowDataPacket[]
		| mysql.RowDataPacket[][]
		| mysql.OkPacket
		| mysql.OkPacket[]
		| mysql.ResultSetHeader
	> {
		return new Promise((resolve, reject) => {
			conn.query(
				isPreparedStatement(sql)
					? generateQueryFromPreparedStatement(sql)
					: sql,
				(err, result) => {
					if (err) return reject(err);
					resolve(result);
				}
			);
		});
	}

	private async getServerVariable(variableName: string) {
		try {
			const result = (await this.query(
				escStr`SHOW VARIABLES LIKE ${variableName};`
			)) as DataPacket;
			return result[0]?.Value as string;
		} catch (error) {
			throw error;
		}
	}

	private connChangeUser(
		conn: Connection,
		opts: ConnectionOptions
	): Promise<void> {
		return new Promise((resolve, reject) => {
			conn.changeUser(opts, (err) => {
				if (err) return reject(err);
				resolve();
			});
		});
	}
}
