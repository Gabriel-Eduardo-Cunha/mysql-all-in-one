import mysql, { PoolOptions, Pool, RowDataPacket } from 'mysql2';
import { SelectOptions } from '../query_builder/select/types';
import { PreparedStatement } from '../query_builder/types';
import { putBackticks } from '../query_builder/utils';
import query_builder from '../query_builder';
import {
	DataPacket,
	DataSelectOptions,
	defaultDataSelectOptions,
} from './types';

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

	public async select(selectOpts: SelectOptions, opts?: DataSelectOptions) {
		const { returnMode, specificColumn, specificRow } = {
			...defaultDataSelectOptions,
			...opts,
		};
		const prepStatement: PreparedStatement = query_builder.select({
			...selectOpts,
			returnPreparedStatement: true,
		}) as PreparedStatement;
		const resultSet = (await this.execute(prepStatement)) as DataPacket;
		if (!Array.isArray(resultSet)) return resultSet;
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
					resultSet.length !== 0
				) {
					return resultSet.map((row) => row[specificColumn]);
				}
			default:
				return null;
		}
	}

	private execute(preparedStatement: PreparedStatement): Promise<any> {
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

const dao = new DataAccessObject({
	user: 'root',
	password: '',
	database: 'ambisistest',
	host: 'localhost',
	port: 3307,
});

const main = async () => {
	const result = await dao.select({
		from: 'cliente',
		columns: ['id', 'razaoSocial'],
	});
	console.log(result);
	throw 'finish';
};
main();
