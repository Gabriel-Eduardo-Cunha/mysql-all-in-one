import { DataAccessObject, QueryBuilder } from '..';
import { sqlExpression } from '../QueryBuilder';

const dao = new DataAccessObject({
	host: "localhost",
	port: 3307,
	user: "root",
	password: "",
});

const test2 = async () => {
	console.log(
		await dao.select({ from: "cliente" }, { database: "ambisis01" , executionMode: 'query'})
	);
	await dao.dispose();
	// try {
	// 	console.log(
	// 		await dao.select({ from: "cliente" }, { database: "ambisis563" })
	// 	);
	// } catch (error) {
	// 	console.log(error);
	// }
	// console.log(await dao.select({ from: "cliente", columns: "database" }));

};
test2()

const test1 = async () => {
	console.log(await dao.databaseExists("ambisis01"));
	console.log(await dao.databaseExists("ambisis143"));
	console.log(await dao.databaseExists("ambisis156"));
	console.log(await dao.databaseExists("ambisis181"));
	console.log(await dao.databaseExists("ambisis116"));
	console.log(await dao.databaseExists("ambisis176"));
	console.log(await dao.databaseExists("ambisis01"));
	await dao.dispose();
};
// test1();
