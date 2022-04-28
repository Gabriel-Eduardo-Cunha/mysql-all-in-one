import { QueryBuilder } from '..';

const query = QueryBuilder.select({
	from: 'table',
	columns: 't.*',
});
console.log(query);
