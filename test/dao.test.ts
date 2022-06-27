import { DataAccessObject, QueryBuilder } from '..';
import { sqlExpression } from '../QueryBuilder';

const dao = new DataAccessObject({
	host: 'localhost',
	port: 3307,
	user: 'root',
	password: '',
});

const main = async () => {
	await dao.select({ from: 'cliente' }, { database: 'ambisis01' });
	try {
		await dao.select({ from: 'cliente' }, { database: 'ambisis183' });
	} catch (error) {}
	await dao.select({ from: 'cliente' }, { database: 'ambisis01' });
	await dao.dispose();
};
main();
