import { DataAccessObject } from '../index';

import * as QueryBuilder from '../QueryBuilder';

const dao = new DataAccessObject({
	host: 'localhost',
	user: 'root',
	port: 3306,
	password: '1234',
});

const main = async () => {
	dao.select({ from: 'my_table' });
};
main();
