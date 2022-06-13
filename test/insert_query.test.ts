import { QueryBuilder } from '../';
import { sqlExpression } from '../QueryBuilder';

const query = QueryBuilder.insert(
	'table t',
	{
		id: 'test',
		clienteId: sqlExpression`(SELECT * FROM myTable WHERE id = ${1})`,
		name: undefined,
	},
	{ returnPreparedStatement: true }
);
console.log(query);
