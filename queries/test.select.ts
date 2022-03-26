
import {select} from "./query_builder";

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
			on: { userId: 'id'}, // p.userId = u.userId
			// on: { userId: 'id', password: '1234'}, p.userId = u.userId AND p.password = '1234'
		},
	],
	where: {
		isFinished: true,
	},
});

console.log(r);
