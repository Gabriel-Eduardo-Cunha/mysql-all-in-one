import DataAccessObject from '.';
import { DataPacket } from './types';
import query_builder from '../query_builder';
import fs from 'fs';
import { mysqlSplitterOptions, splitQuery } from 'dbgate-query-splitter';
import { statementsMerge } from './utils';

const dao = new DataAccessObject({
	user: 'root',
	password: '1234',
	database: 'ambisistest',
	host: 'localhost',
	port: 3306,
	// multipleStatements: true,
});

const main = async () => {
	// console.time('dump');
	// await dao.dumpDatabase('ambisistest', './ambisistest.sql');
	// console.timeEnd('dump');
	console.time('loadDump');
	await dao.loadDump('ambisis13', './ambisistest.sql');
	console.timeEnd('loadDump');
};
main();
