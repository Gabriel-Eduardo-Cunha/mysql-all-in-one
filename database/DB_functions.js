const { Connection } = require('mysql2');

/**
 *
 * @param {Connection} conn
 * @param {String} database will use database if passed, if NULL is passed will remove the selected database from connection
 * @returns
 */
const selectDatabase = async (conn, database) => {
	if (database && typeof database === 'string') {
		await execQuery(conn, `USE ${database}`);
	} else if (database === null) {
		const tempDb = `mysql_all_in_one${uniqid()}`.split('-').join('');
		await execQuery(conn, `CREATE DATABASE ${tempDb}`);
		await execQuery(conn, `USE ${tempDb}`);
		await execQuery(conn, `DROP DATABASE ${tempDb}`);
	}
};
/**
 *
 * @param {Connection} conn
 * @param {String} query
 * @returns
 */
const execQuery = (conn, query) =>
	new Promise((res, rej) => {
		conn.query(query, (err, results) => {
			err ? rej(err) : res(results);
		});
	});

module.exports = {
	selectDatabase,
	execQuery,
};
