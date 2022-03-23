import { where, escStr } from './query_builder';
const today = new Date();
const futureDate = new Date(2030, 5, 25);
const r = where([
	{
		name: 'cunha',
		'table.id': 12,
		dadName: { like: 'Robert' },
		status: false,
		clientId: null,
		momName: { notlike: 'sara' },
		dogName: { rlike: 'pup' },
		catName: { notrlike: 'kit' },
		payment: { notbetween: [100.35, 789.3] },
		birthDay: { between: [today, futureDate] },
		salary: { '>': 10000.5 },
		earnings: { '>=': 11000.53 },
		age: { '<': 18 },
		bornYear: { '<=': 2000 },
		partyStatus: { '!=': 1 },
		wifiStatus: { '<>': 1 },
		lunch: { '=': true },
		testId: undefined,
		__or: true,
	},
	[
		escStr`STR_TO_DATE(${today}, '%d/%m/%Y') BETWEEN curdate() AND now()`,
		escStr`STR_TO_DATE(${today}, '%d/%m/%Y') BETWEEN curdate() AND now()`,
		[
			'__or',
			escStr`STR_TO_DATE(${today}, '%d/%m/%Y') BETWEEN '2022-1-1' AND now()`,
			escStr`STR_TO_DATE(${today}, '%d/%m/%Y') BETWEEN '2024-3-1' AND '2025-3-1'`,
			escStr`STR_TO_DATE(${today}, '%d/%m/%Y') BETWEEN '2028-4-1' AND '2040-4-1'`,
		],
	],
	{
		name: ['cunha', 'bianca', 'joão'],
	},
	[
		'__or',
		escStr`name = ${'cunha'}`,
		escStr`name = ${'bianca'}`,
		escStr`name = ${'joão'}`,
	],
]);
console.log(r);
/*
Stable return:

> WHERE ((`name` = 'cunha' OR `table`.`id` = 12 OR `dadName` LIKE 'Robert' OR `status` IS false OR `clientId` IS NULL OR `momName` NOT LIKE 'sara' OR `dogName` RLIKE 'pup' OR `catName` NOT RLIKE 'kit' OR (`payment` NOT BETWEEN 100.35 AND 789.3) OR (`birthDay` BETWEEN '2022-03-22 20:58:54.781' AND '2030-06-25 00:00:00.000') OR `salary` > 10000.5 OR `earnings` >= 11000.53 OR `age` < 18 OR `bornYear` <= 2000 OR `partyStatus` <> 1 OR `wifiStatus` <> 1 OR `lunch` = true) AND ((STR_TO_DATE('2022-03-22 20:58:54.781', '%d/%m/%Y') BETWEEN curdate() AND now()) AND (STR_TO_DATE('2022-03-22 20:58:54.781', '%d/%m/%Y') BETWEEN curdate() AND now()) AND ((STR_TO_DATE('2022-03-22 20:58:54.781', '%d/%m/%Y') BETWEEN '2022-1-1' AND now()) OR (STR_TO_DATE('2022-03-22 20:58:54.781', '%d/%m/%Y') BETWEEN '2024-3-1' AND '2025-3-1') OR (STR_TO_DATE('2022-03-22 20:58:54.781', '%d/%m/%Y') BETWEEN '2028-4-1' AND '2040-4-1'))) AND (`name` IN ('cunha','bianca','joão')) AND ((name = 'cunha') OR (name = 'bianca') OR (name = 'joão')))

*/
