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
	console.log(await dao.databaseExists('ambisis03'));
	console.log(await dao.databaseExists('ambisis182'));
	console.log(await dao.databaseExists('ambisis183'));
};
main();
