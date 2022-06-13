import { DataAccessObject } from '../index';

import * as QueryBuilder from '../QueryBuilder';

const dao = new DataAccessObject({
	host: 'localhost',
	user: 'root',
	port: 3307,
	password: '',
	database: 'ambisis',
});

const main = async () => {
	const result = await dao.select({ from: 'cliente' });
	console.log('finished');
	await dao.dispose();
};
main();
