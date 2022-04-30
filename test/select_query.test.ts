import { QueryBuilder } from '..';
import { sqlCol, sqlExpression } from '../QueryBuilder/utils';

const query = QueryBuilder.select({
	from: 'table t',
	columns: {
		balance: sqlExpression`SUM(${sqlCol('date')})`,
		table: sqlExpression`${1}`,
		name: 'col_name',
	},
	join: [
		{
			table: 'acc a',
			on: { __col_relation: { id: 'acc_id' } },
			columns: {
				as: sqlExpression`IF(${sqlCol(
					'jCol'
				)} = ${'test'}, ${1}, ${2})`,
			},
		},
	],
	where: [
		{
			ida: 3,
			date: { between: [sqlCol('a.date'), sqlCol('b.date')] },
			id: sqlCol('o.id'),
			sex: { like: sqlCol('niiga') },
		},
		sqlExpression`MONTH(${sqlCol('date')}) = MONTH(${new Date(
			'2020-2-2'
		)}) AND ${sqlCol('date')} = ${sqlCol('a.date')}`,
	],
});
console.log(query);
