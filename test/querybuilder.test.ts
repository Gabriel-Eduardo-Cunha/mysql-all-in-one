import { QueryBuilder } from '..';
import { sqlExpression } from '../QueryBuilder';

const updateQuery = QueryBuilder.update(
	'table',
	{ name: 'ricardo' },
	{
		configId: sqlExpression`SELECT id FROM other_table WHERE name = ${'CUNHA'}`,
	}
);

console.log(updateQuery);
