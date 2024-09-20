import { QueryBuilder } from '..';
import { sqlCol } from '../QueryBuilder/utils';

const query = QueryBuilder.deleteFrom(
	'teste t',
	{ id: 1 },
	{ order: { id: 'asc' }, limit: 2 }
);
console.log(query);
