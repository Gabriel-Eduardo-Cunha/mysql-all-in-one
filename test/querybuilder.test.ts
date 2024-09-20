import { QueryBuilder } from '..';
import { sqlExpression } from '../QueryBuilder/sql_expression';
import { sqlCol } from '../QueryBuilder/utils';

const updateQuery = QueryBuilder.update(
	'table',
	{ name: 'ricardo' },
	{
		configId: sqlExpression`SELECT id FROM other_table WHERE name = ${'CUNHA'}`,
	}
);

// console.log(updateQuery);

const selectQuery = QueryBuilder.select({
	from: 'teste',
	order: { __expression: [sqlExpression`STR_TO_DATE(${sqlCol('validade')})`] },
});

console.log(selectQuery);
