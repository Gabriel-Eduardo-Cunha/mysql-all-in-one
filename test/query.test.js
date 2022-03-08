const QueryBuilder = require('../queries/builder');
const builder = new QueryBuilder();

const queries = [];

queries.push(builder.insert('foo', { id: 1, bar: 'aaa' }));
queries.push(
	builder.insert('foo', [
		{ id: 1, bar: 'aaa' },
		{ id: 2, bar: 'bbb' },
	])
);
queries.push(
	builder.insert(
		'foo',
		[
			{ id: 1, bar: 'aaa' },
			{ id: 2, bar: 'bbb' },
		],
		{ type: 'ignore' }
	)
);

queries.map((q) => {
	console.log(q);
});
