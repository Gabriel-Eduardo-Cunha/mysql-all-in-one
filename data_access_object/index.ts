import mysql, { PoolOptions, Pool, OkPacket } from 'mysql2';
import { SelectOptions } from '../query_builder/select/types';
import { PreparedStatement } from '../query_builder/types';
import { putBackticks } from '../query_builder/utils';
import query_builder from '../query_builder';
import {
	DataPacket,
	DataSelectOptions,
	defaultDataSelectOptions,
	isGroupDataOptions,
	InsertOptionsDAO,
} from './types';
import { arrayUnflat, group } from './utils';
import { ConditionOptions } from '../query_builder/select/conditionals/types';
import { DeleteOptions } from '../query_builder/delete/types';
import { UpdateOptions, UpdateValues } from '../query_builder/update/types';
import {
	InsertOptions,
	InsertRows,
	isInsertRows,
} from '../query_builder/insert/types';

class DataAccessObject {
	protected connectionData: PoolOptions;
	protected pool: Pool;

	constructor(connectionData: PoolOptions) {
		this.connectionData = connectionData;
		this.pool = mysql.createPool(connectionData);
	}

	public async useDatabase(database: string) {
		await this.query(`USE ${putBackticks(database)};`);
	}

	public query(sql: string) {
		return new Promise((resolve, reject) => {
			this.pool.query(sql, (err, result) => {
				if (err) reject(err);
				resolve(result);
			});
		});
	}

	/**
	 * @description Will execute select command as a prepared statement.
	 */
	public async select(selectOpts: SelectOptions, opts?: DataSelectOptions) {
		const { returnMode, specificColumn, specificRow, groupData } = {
			...defaultDataSelectOptions,
			...opts,
		};
		const prepStatement: PreparedStatement = query_builder.select({
			...selectOpts,
			returnPreparedStatement: true,
		}) as PreparedStatement;
		let resultSet = (await this.execute(prepStatement)) as DataPacket;
		if (!Array.isArray(resultSet)) return resultSet;
		if (isGroupDataOptions(groupData)) {
			resultSet = group(resultSet, groupData.by, groupData.columnGroups);
		}
		switch (returnMode) {
			case 'normal':
				return resultSet;
			case 'firstRow':
				return resultSet[0];
			case 'firstColumn':
				return resultSet.map((row) => Object.values(row)[0]);
			case 'firstValue':
				const firstRowValues = Object.values(resultSet[0]);
				return firstRowValues.length !== 0 ? firstRowValues[0] : null;
			case 'specific':
				if (specificRow === undefined && specificColumn === undefined)
					return resultSet;
				if (
					specificRow !== undefined &&
					typeof specificRow === 'number' &&
					resultSet.length > specificRow
				) {
					return resultSet[specificRow];
				} else if (
					!!specificColumn &&
					typeof specificColumn === 'string' &&
					resultSet.length !== 0 &&
					resultSet[0][specificColumn] !== undefined
				) {
					return resultSet.map((row) => row[specificColumn]);
				}
			default:
				return null;
		}
	}

	/**
	 * @description Will execute delete command as a prepared statement.
	 * @returns Number of deleted rows;
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
		const result = (await this.execute(preparedStatement)) as OkPacket;
		return result.affectedRows;
	}

	/**
	 * @description Will execute update command as a prepared statement.
	 * @returns Number of updated rows;
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
		const result = (await this.execute(preparedStatement)) as OkPacket;
		return result.affectedRows;
	}

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

					await this.execute(preparedStatement);
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

				const result = (await this.execute(
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

	public execute(preparedStatement: PreparedStatement): Promise<any> {
		return new Promise((resolve, reject) => {
			const { statement, values } = preparedStatement;
			this.pool.execute(statement, values, (err, result) => {
				if (err) reject(err);
				resolve(result);
			});
		});
	}
}

export default DataAccessObject;
