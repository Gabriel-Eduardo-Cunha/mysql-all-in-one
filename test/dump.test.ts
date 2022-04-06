import DataAccessObject from '../data_access_object';
import query_builder, { sqlExpression } from '../query_builder';

// const dao = new DataAccessObject({
// 	host: 'localhost',
// 	user: 'root',
// 	port: 3306,
// 	password: '1234',
// });

const main = async () => {
	console.log(
		query_builder.select({
			columns: [
				'id',
				'name',
				{ __expression: { nameSize: 'LENGTH(`t`.`name`)' } },
			],
			from: 'table t',
			join: {
				table: 'foo f',
				type: 'left',
				on: { __col_relation: { tableId: 'id' } },
			},
		})
	);
};
main();
