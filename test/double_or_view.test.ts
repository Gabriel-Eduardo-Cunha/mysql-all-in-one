import { QueryBuilder } from '..';
import { SelectOptions } from '../QueryBuilder/select/types';

const view: SelectOptions = {
	from: 'table',
	where: ['__or', { a: null }, { a: '' }, { __or: true, a: 1, b: 2 }],
};

console.log(QueryBuilder.select(view));
console.log(QueryBuilder.select(view));
