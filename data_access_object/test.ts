import DataAccessObject from '.';
import { DataPacket } from './types';
import query_builder from '../query_builder';

const dao = new DataAccessObject({
	user: 'root',
	password: '',
	database: 'ambisistest',
	host: 'localhost',
	port: 3307,
});

const main = async () => {};
main();
