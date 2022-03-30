import { select } from './query_builder';

const today = new Date();

const r = select('usuario u', {
	columns: {
		userId: 'id`',
		// userName: 'name',
		// userPass: 'password',
		// catName: 'catName',
		// bornDate: { expression: 'STR_DATE(bornDate, "d/m/y")' },
	},
	group: ['hellows', 'his', {expression: 'IFNULL(number, hi)'}],
	where: [
		
		{
			id: [1, 2, 3],
		},
		'user.id is not null',
		{
			__col_relation: {
				id: 'd',
			},
			__or: true,
			name: { like: 'john' },
			year: 2022,
		},
	],
	join: [
		{
			table: 'permission p',
			on: {
				__col_relation: { id: 'userId' },
				moduleId: null,
			},
			columns: {
				name: 'user',
			},
		},
	],
});

console.log(r);
