import { QueryBuilder } from '../';
import { sqlExpression } from '../QueryBuilder/sql_expression';
import { sqlCol } from '../QueryBuilder/utils';

const query = QueryBuilder.update(
	'table',
	{
		id: 'test',
		clienteId: sqlExpression`(SELECT * FROM myTable WHERE ${sqlCol(
			'id'
		)} = ${1})`,
	},
	{ id: 1 }
);
console.log(query);
