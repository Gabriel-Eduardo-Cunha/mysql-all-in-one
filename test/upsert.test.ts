import { DataAccessObject, QueryBuilder } from '../';
import { sqlExpression } from '../QueryBuilder/sql_expression';

const dao = new DataAccessObject({
	host: "localhost",
	port: 3307,
	user: "root",
	password: "",
	database: "ambisis01",
});

// dao.select({ from: 'update' }).then((r) => console.log(r));
dao.upsert('update', {
	id: '3',
	prev_version_id: '4',
	next_version_id: '5',
}).then((r) => console.log(r));

/**
{
	id: 2,
	prev_version_id: 2,
	next_version_id: 3,
	sql_file: 'update-1124d95f-6485-4e56-b086-231aea22a253.sql',
	is_closed: 0,
	test_execution_id: null,
	scheduled_date: null,
	was_executed: 0,
}
 */
