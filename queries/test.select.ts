import { select } from './query_builder';

const today = new Date();

const r = select('usuario u', {
	columns: {
		userId: '`p`.`id`',
		userName: 'name',
		userPass: 'password',
		catName: 'catName',
		bornDate: { expression: 'STR_DATE(bornDate, "d/m/y")' },
	},
	join: [
		{
			table: 'permission p',
			on: {
				__cols_relation: true,
				date: 'lll',
				link: { like: 'hello' },
			}, // (p.userId = u.userId)
			// on: { userId: 'id', password: '1234'}, p.userId = u.userId AND p.password = '1234'
			// on: { userId: 'id', module: {expression: 'licenca'}}, p.userId = u.userId AND p.password = '1234'
		},
	],
	where: 'id = 1',
});

console.log(r);
