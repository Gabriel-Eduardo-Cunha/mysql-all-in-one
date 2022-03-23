import { select, escStr } from './query_builder';

const r = select('usuario', {
	columns: [{ name: 'hello' }, `jointable.*`],
});

console.log(r);
