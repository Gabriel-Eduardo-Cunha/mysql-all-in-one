import { ConditionOptions } from '../select/conditionals/types';
import where from '../select/conditionals/where';
import { order } from '../select/order';
import { PreparedStatement, SqlValues } from '../types';
import { escapeNames, extractTableAlias, putBackticks } from '../utils';
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
): PreparedStatement | string => {
	if (!isUpdateValues(values))
		throw 'Invalid argument values, expects object of SQL values.';
	const {
		ignore,
		limit,
		order: orderOpts,
	} = { ...defaultUpdateOptions, ...opts };
	const preparedStatementValues: Array<SqlValues> = [];
	const tableRef = escapeNames(table);
	const [_, alias] = extractTableAlias(tableRef);
	const preparedStatement: PreparedStatement = {
		statement: `UPDATE ${
			ignore === true ? 'IGNORE ' : ''
		}${tableRef} SET ${Object.entries(values)
			.filter(([_, val]) => val !== undefined)
			.map(([key, val]) => {
				preparedStatementValues.push(val);
				return `${putBackticks(key)} = ?`;
			})
			.join(',')}${where(whereOpts, alias)}${order(orderOpts, alias)}${
			limit ? ` LIMIT ${limit}` : ''
		};`,
		values: preparedStatementValues,
	};
	return preparedStatement;
};

export default update;
