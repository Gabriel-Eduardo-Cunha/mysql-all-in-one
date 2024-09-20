import { QueryBuilder } from '../';
import { sqlExpression } from '../QueryBuilder/sql_expression';

const query = QueryBuilder.insert(
	"table t",
	{
		id: "test",
		clienteId: sqlExpression`(SELECT * FROM myTable WHERE id = ${1})`,
		name: undefined,
	},
	{ returnPreparedStatement: false }
);
console.log(query);

const quer2 = QueryBuilder.insert(
	"table t",
	{
		id: "test",
		clienteId: QueryBuilder.select({
			from: "myTable",
			where: { id: 1 },
			returnPreparedStatement: true,
		}),
		name: undefined,
	},
	{ returnPreparedStatement: false }
);
console.log(quer2);
