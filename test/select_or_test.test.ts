import { QueryBuilder } from '..';

const select = QueryBuilder.select({
	from: "table",
	where: [{ name: null }],
});

console.log(select);
