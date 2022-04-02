import { ConditionOptions } from '../select/conditionals/types';
import where from '../select/conditionals/where';
import { order } from '../select/order';
import { escapeNames, escVal, extractTableAlias, putBackticks } from '../utils';
import {
	defaultUpdateOptions,
	isUpdateValues,
	UpdateOptions,
	UpdateValues,
} from './types';

const update = (
	table: string,
	values: UpdateValues,
	whereOpts?: ConditionOptions,
	opts?: UpdateOptions
): string => {
	if (!isUpdateValues(values))
		throw 'Invalid argument values, expects object of SQL values.';
	const {
		ignore,
		limit,
		order: orderOpts,
	} = { ...defaultUpdateOptions, ...opts };
	const tableRef = escapeNames(table);
	const [_, alias] = extractTableAlias(tableRef);
	return `UPDATE ${
		ignore === true ? 'IGNORE ' : ''
	}${tableRef} SET ${Object.entries(values)
		.filter(([_, val]) => val !== undefined)
		.map(([key, val]) => `${putBackticks(key)} = ${escVal(val)}`)
		.join(',')}${where(whereOpts, alias)}${order(orderOpts, alias)}${
		limit ? ` LIMIT ${limit}` : ''
	};`;
};

console.log(
	update(
		'client c',
		{ name: 'cleber' },
		{ __or: true, id: [15, 2, 4, 56], name: null },
		{
			order: { born: 'desc' },
			limit: 10,
		}
	)
);
