import { select, escStr } from './query_builder';

const r = select({
	from: 'table',
	order: {
		// 'id': 'desc',
		__expression: 'aaa',
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
