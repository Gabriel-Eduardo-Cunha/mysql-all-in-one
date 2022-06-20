import { QueryBuilder } from '..';

const select = QueryBuilder.select({
	from: 'table',
	where: [{ name: null }, ['__or', { respId: 3 }, { respId: null }]],
});

console.log(select);
