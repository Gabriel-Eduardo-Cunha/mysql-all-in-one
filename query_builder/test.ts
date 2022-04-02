import query_builder from '.';
import { escStr } from './utils';

console.log(
	query_builder.select({
		from: 'table',
		columns: {
			id: 'hello',
			__expression: {
				birthday: `DATE_FORMAT(birthday, "%d/%m/%Y")`,
			},
		},
		join: {
			table: 'table2',
			on: { __col_relation: { id: 'table2Id' } },
			type: 'left',
		},
		where: [
			escStr`birthday = STR_TO_DATE(${new Date(2020, 8, 30)})`,
			{
				id: 5,
				name: { like: 'john' },
			},
		],
		group: {
			__expression: 'group',
			__no_alias: ['id', 'hello'],
		},
		limit: 5,
		offset: 10,
		having: escStr`try out`,
	})
);

/*
SELECT `table`.`hello` AS `id`,(DATE_FORMAT(birthday, "%d/%m/%Y")) AS `birthday` FROM `table` LEFT JOIN `table2` ON (`table2`.`id` = `table`.`table2Id`) WHERE ((birthday = STR_TO_DATE('2020-09-30 00:00:00.000')) AND (`table`.`id` = 5 AND `table`.`name` LIKE 'john')) GROUP BY `id`,`hello` HAVING (try out) LIMIT 5 OFFSET 10;

SELECT `table`.`hello` AS `id`,(DATE_FORMAT(birthday, "%d/%m/%Y")) AS `birthday` FROM `table` LEFT JOIN `table2` ON (`table2`.`id` = `table`.`table2Id`) WHERE ((birthday = STR_TO_DATE('2020-09-30 00:00:00.000')) AND (`table`.`id` = 5 AND `table`.`name` LIKE 'john')) GROUP BY `id`,`hello` HAVING (try out) LIMIT 5 OFFSET 10;
*/
