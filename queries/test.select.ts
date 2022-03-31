import { select, escStr } from './query_builder';

const r = select({
	from: 'table',
	columns: { __expression: { homersimpson: 'if(data IS TRUE, 1, 0)' } },
	group: {
		// __no_alias: ['homersimpson']
	},
	order: {
		'table.id': 'asc',
		name: 'desc',
		__expression: [
			'STR_TO_DATE(date, "d/m/y")',
			'STR_TO_DATE(born, "d/m/y")',
		],
	},
});
// const r = select({
// 	from: 'money_manager.account a',
// 	columns: ['id', 'name', 'selected', 'order'],
// 	join: {
// 		table: 'money_manager.wallet_info w',
// 		on: { __col_relation: { account_id: 'id' } },
// 		type: 'left',
// 		columns: {
// 			__expression: {
// 				balance: 'ifnull(sum(`money_manager`.`w`.`balance`), 0)',
// 			},
// 		},
// 	},
// 	group: 'id',
// 	order: { __expression: '-(`a`.`order`) desc' },
// });

console.log(r);
