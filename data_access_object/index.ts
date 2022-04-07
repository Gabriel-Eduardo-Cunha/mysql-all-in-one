import mysql, {
	PoolOptions,
	Pool,
	OkPacket,
	PoolConnection,
	Connection,
	ConnectionOptions,
	RowDataPacket,
} from 'mysql2';
import fs from 'fs';
import { mysqlSplitterOptions, splitQuery } from 'dbgate-query-splitter';
import { SelectOptions } from '../query_builder/select/types';
import {
	generateQueryFromPreparedStatement,
	isPreparedStatement,
	isSqlValues,
	PreparedStatement,
	SqlValues,
} from '../query_builder/types';
import { isNotEmptyString, putBackticks } from '../query_builder/utils';
import query_builder, { escStr } from '../query_builder';
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
} from './types';
import { arrayUnflat, group, statementsMerge } from './utils';
import { ConditionOptions } from '../query_builder/select/conditionals/types';
import { DeleteOptions } from '../query_builder/delete/types';
import { UpdateOptions, UpdateValues } from '../query_builder/update/types';
import {
	InsertOptions,
	InsertRows,
	isInsertRows,
} from '../query_builder/insert/types';
import { exec } from 'child_process';

/**
 * @description With a DataAccessObject instance is possible to execute commands, dump databases and load dumps (or any .sql file)
 * @param {PoolOptions} connectionData
 */
class DataAccessObject {
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

		this.getPoolConnection(() => {
			//Connection is OK
		}).catch((err) => {
			console.log(
				'Could not start connection, check your connection credencials.'
			);
			throw err;
		});
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
				`mysqldump -h ${host}${port ? ` -P ${port}` : ''} -u ${user}${
					password ? ` -p${password}` : ''
				} ${database} > "${filePath}"`,
				(err) => {
					if (err) return reject(err);
					resolve();
				}
			);
		});
	}

	/**
	 * @description Will drop and recreate a database.
	 * @param database Database to empty
	 * @example emptyDatabase('mydatabase');
	 */
	public async emptyDatabase(database: string) {
		await this.query(`DROP DATABASE IF EXISTS ${putBackticks(database)};`);
		await this.query(`CREATE DATABASE ${putBackticks(database)};`);
	}

	/**
	 * @description Creates a new database from dump file (WARNING: if the database alredy exists it will be emptied).
	 * @param database Database to be created or emptied
	 * @param dumpFilePath Path to the dump file
	 * @example loadDump('mydatabase', './folder/mydatabase.sql');
	 */
	public async loadDump(database: string, dumpFilePath: string) {
		await this.emptyDatabase(database);
		await this.loadSqlFile(database, dumpFilePath);
	}

	/**
	 * @description Runs statements inside sql file on a specific database.
	 * @param database Database selected during statements execution.
	 * @param sqlFilePath Path to the sql file
	 * @example loadSqlFile('mydatabase', './folder/mysqlstatements.sql');
	 */
	public async loadSqlFile(database: string, sqlFilePath: string) {
		const sql = fs.readFileSync(sqlFilePath, 'utf8');

		const sqlStatements = splitQuery(
			sql,
			mysqlSplitterOptions
		) as Array<string>;
		const maxAllowedPacket = parseInt(
			await this.getServerVariable('max_allowed_packet')
		);

		if (maxAllowedPacket && typeof maxAllowedPacket === 'number') {
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
		const { returnMode, specificColumn, specificRow, groupData, database } =
			{
				...defaultDataSelectOptions,
				...opts,
			};
		const prepStatement: PreparedStatement = query_builder.select({
			...selectOpts,
			returnPreparedStatement: true,
		}) as PreparedStatement;
		let resultSet = (await this.executionMethod(
			prepStatement,
			database
		)) as DataPacket;
		if (!Array.isArray(resultSet)) return resultSet;
		if (isGroupDataOptions(groupData)) {
			resultSet = group(resultSet, groupData.by, groupData.columnGroups);
		}
		switch (returnMode) {
			case 'normal':
				return resultSet as DataPacket;
			case 'firstRow':
				return resultSet[0] as RowDataPacket;
			case 'firstColumn':
				return resultSet.map(
					(row) => Object.values(row)[0]
				) as Array<SqlValues>;
			case 'firstValue':
				const firstRowValues = Object.values(resultSet[0]);
				return firstRowValues.length !== 0
					? (firstRowValues[0] as SqlValues)
					: null;
			case 'specific':
				if (specificRow === undefined && specificColumn === undefined)
					return resultSet as DataPacket;
				if (
					specificRow !== undefined &&
					typeof specificRow === 'number' &&
					resultSet.length > specificRow
				) {
					return resultSet[specificRow] as RowDataPacket;
				} else if (
					!!specificColumn &&
					typeof specificColumn === 'string' &&
					resultSet.length !== 0 &&
					resultSet[0][specificColumn] !== undefined
				) {
					return resultSet.map(
						(row) => row[specificColumn]
					) as Array<SqlValues>;
				}
			default:
				return null;
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
		opts?: DeleteOptions
	) {
		const preparedStatement = query_builder.deleteFrom(table, whereOpts, {
			...opts,
			returnPreparedStatement: true,
		}) as PreparedStatement;
		const result = (await this.executionMethod(
			preparedStatement
		)) as OkPacket;
		return result.affectedRows;
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
		opts?: UpdateOptions
	) {
		const preparedStatement = query_builder.update(
			table,
			values,
			whereOpts,
			{ ...opts, returnPreparedStatement: true }
		) as PreparedStatement;
		const result = (await this.executionMethod(
			preparedStatement
		)) as OkPacket;
		return result.affectedRows;
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
		opts?: InsertOptionsDAO & InsertOptions
	) {
		opts = { ...opts, returnPreparedStatement: true };
		const { rowsPerStatement } = {
			...opts,
		} as InsertOptionsDAO & InsertOptions;
		delete opts?.rowsPerStatement;
		if (isInsertRows(rows)) {
			if (!Array.isArray(rows)) rows = [rows];
			if (
				rowsPerStatement !== undefined &&
				rowsPerStatement !== null &&
				typeof rowsPerStatement === 'number' &&
				rowsPerStatement > 0
			) {
				const rowsGroups = arrayUnflat(rows, rowsPerStatement);
				for (const rowsGroup of rowsGroups) {
					const preparedStatement = query_builder.insert(
						table,
						rowsGroup,
						opts
					) as PreparedStatement;

					await this.executionMethod(preparedStatement);
				}
				return null;
			}
			const insertedIds = [];
			for (const row of rows) {
				const preparedStatement = query_builder.insert(
					table,
					row,
					opts
				) as PreparedStatement;

				const result = (await this.executionMethod(
					preparedStatement
				)) as OkPacket;
				insertedIds.push(result.insertId);
			}
			return insertedIds.length === 0
				? null
				: insertedIds.length === 1
				? insertedIds[0]
				: insertedIds;
		}
		return null;
	}

	public async upsert(table: string, rows: UpsertRow, opts: UpsertOptions) {
		opts = { ...defaultUpsertOptions, ...opts };
		if (!isInsertRows(rows) || typeof opts.primaryKey !== 'string')
			return null;
		if (!Array.isArray(rows)) rows = [rows];
		const affectedIds = [];
		for (const row of rows) {
			if (row[opts.primaryKey] !== undefined) {
			}
		}
	}

	/**
	 * @description Runs a query and return it's results, this command don't prepare and execute the statement.
	 * @param sql Query to execute.
	 * @param database Database selected during the query execution. If null will use default connection database passed on connectionData from DAO object.
	 * @returns Query response.
	 * @example query('SELECT * FROM `table`, 'mydatabase');
	 */
	public async query(sql: string | PreparedStatement, database?: string) {
		return await this.getPoolConnection(
			async (conn) => {
				return await this.connQuery(conn, sql);
			},
			{ database }
		);
	}

	private async execute(
		preparedStatement: PreparedStatement,
		database?: string
	) {
		return await this.getPoolConnection(
			async (conn) => {
				return await this.connExecute(conn, preparedStatement);
			},
			{ database }
		);
	}

	private getPoolConnection(
		callback: GetPoolConnectionCallback,
		opts?: GetPoolConnectionOptions
	) {
		const { multipleStatements, database } = {
			...defaultGetPoolConnectionOptions,
			...opts,
		};
		return new Promise((resolve, reject) => {
			(multipleStatements === true
				? this.multipleStatementsPool
				: this.pool
			).getConnection(async (err, conn) => {
				if (err) {
					conn?.release();
					reject(err);
					return;
				}
				const shouldChangeDatabase =
					isNotEmptyString(database) &&
					database !== this.connectionData.database;

				// Change to the desired database
				if (shouldChangeDatabase) {
					await this.connChangeUser(conn, {
						database: database as string,
					});
				}
				resolve(await callback(conn));
				// Change back to the original connection database
				if (
					shouldChangeDatabase &&
					isNotEmptyString(this.connectionData.database)
				) {
					await this.connChangeUser(conn, {
						database: this.connectionData.database,
					});
				}
				conn.release();
			});
		});
	}

	private connExecute(
		conn: PoolConnection,
		preparedStatement: PreparedStatement
	) {
		return new Promise((resolve, reject) => {
			conn.execute(
				preparedStatement.statement,
				preparedStatement.values,
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
		const result = (await this.query(
			escStr`SHOW VARIABLES LIKE ${variableName};`
		)) as DataPacket;
		return result[0]?.Value as string;
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

export default DataAccessObject;
