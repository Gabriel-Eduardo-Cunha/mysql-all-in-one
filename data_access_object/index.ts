import mysql, { PoolOptions, Pool } from 'mysql2';
import { putBackticks } from '../query_builder/utils';

interface DataAccessObject {
	connectionData: PoolOptions;
	pool: Pool;
	/**
	 * @description Will use the database
	 * @param database
	 */
	useDatabase(database: string): Promise<void>;

	/**
	 * @description Executes a Query and return its results.
	 * @param query Query to be executed
	 */
	query(query: string): Promise<void>;
}

const DataAccessObject = function (
	this: DataAccessObject,
	connectionData: PoolOptions
): void {
	this.connectionData = connectionData;
	this.pool = mysql.createPool(connectionData);

	this.useDatabase = async (database) => {
		this.pool.query(`USE ${putBackticks(database)};`);
	};

	this.query = (query) =>
		new Promise((resolve, reject) => {
			this.pool.query(query, (err, result, fields) => {
				if (err) reject(err);
				resolve(result);
			});
		});
};

export default DataAccessObject;
