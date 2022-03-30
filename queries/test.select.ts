import { select } from './query_builder';

const today = new Date();

const r = select('usuario u', {
	columns: [
		'id', 'name', {
			helloalias: 'hello',
			// __expression: {
			// 	name: '(SELECT name from blabnla)'
			// }
		}
	],
	join: {
		table: 'permission p',
		on: {
			__col_relation: {userId: 'id'},
			
		},
		columns: {
			permissionName: 'name',
			permissionId: 'id',
		},
		type: 'left',
	},
	group: ['id', 'name', ],
	order: ['name', {__expression: 'STR_TO_DATE(u.bornDate, "%d/%m/%Y")'}],
	limit: 10,
	offset: 150
});

console.log(r);
