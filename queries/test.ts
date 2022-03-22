import { where } from './query_builder';

const r = where({
	name: 'John',
	id: 4,
	clientId: [1, 2, 3],
	age: { '>': 10 },
});
console.log(r);
