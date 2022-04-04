import mysql, { PoolOptions, Pool, RowDataPacket } from 'mysql2';
import { SelectOptions } from '../query_builder/select/types';
import { PreparedStatement } from '../query_builder/types';
import { putBackticks } from '../query_builder/utils';
import query_builder from '../query_builder';
import {
	DataPacket,
	DataSelectOptions,
	defaultDataSelectOptions,
	isGroupDataOptions,
} from './types';
import { group } from './utils';

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
	password: '1234',
	database: 'ambisistest',
	host: 'localhost',
	port: 3306,
});

const main = async () => {
	const result = await dao.select(
		{
			from: 'empreendimento e',
			columns: ['id', 'razaoSocial'],
			join: [
				{
					table: 'licenca l',
					on: { __col_relation: { empreendimentoId: 'id' } },
					type: 'left',
					columns: { licencaId: 'id', numeroLicenca: 'numero' },
				},
				{
					table: 'historico',
					on: {
						__col_relation: { moduleId: 'id' },
						module: 'licenca',
					},
					columns: { historicoId: 'id', historicoTexto: 'texto' },
					type: 'left',
				},
			],
		},
		{
			groupData: {
				by: 'id',
				columnGroups: {
					licencas: {
						id: 'licencaId',
						numero: 'numeroLicenca',
					},
					historicos: {
						id: 'historicoId',
						texto: 'historicoTexto',
						licencaId: 'licencaId',
					},
				},
			},
		}
	);
	// console.log(result);

	(result as DataPacket).forEach((v) => console.log(v));

	// throw 'finish';
};
main();
