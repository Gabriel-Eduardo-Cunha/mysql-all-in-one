import { DataAccessObject, QueryBuilder } from '..';
import { sqlExpression } from '../QueryBuilder';

const dao = new DataAccessObject({
	host: 'localhost',
	port: 3307,
	user: 'root',
	password: '',
});

const main = async () => {
	console.log(await dao.databaseExists('ambisis01'));
	console.log(await dao.databaseExists('ambisis143'));
	console.log(await dao.databaseExists('ambisis156'));
	console.log(await dao.databaseExists('ambisis116'));
	console.log(await dao.databaseExists('ambisis176'));
	console.log(await dao.databaseExists('ambisis136'));
	console.log(await dao.databaseExists('ambisis01'));
	await dao.dispose();
};
main();
