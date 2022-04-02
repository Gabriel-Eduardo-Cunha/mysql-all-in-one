import { ConditionOptions } from '../select/conditionals/types';
import where from '../select/conditionals/where';
import { order } from '../select/order';
import {
	generateQueryFromPreparedStatement,
	PreparedStatement,
	SqlValues,
} from '../types';
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
		returnPreparedStatement,
		order: orderOpts,
	} = { ...defaultUpdateOptions, ...opts };
	const prepStatementValues: Array<SqlValues> = [];
	const tableRef = escapeNames(table);
	const [_, alias] = extractTableAlias(tableRef);
	const { statement: whereStatement, values: whereValues } = where(
		whereOpts,
		alias
	);
	const prepStatementQuery = `UPDATE ${
		ignore === true ? 'IGNORE ' : ''
	}${tableRef} SET ${Object.entries(values)
		.filter(([_, val]) => val !== undefined)
		.map(([key, val]) => {
			prepStatementValues.push(val);
			return `${putBackticks(key)} = ?`;
		})
		.join(',')}${whereStatement}${order(orderOpts, alias)}${
		limit ? ` LIMIT ${limit}` : ''
	};`;
	prepStatementValues.push(...whereValues);
	const prepStatement: PreparedStatement = {
		statement: prepStatementQuery,
		values: prepStatementValues,
	};
	return returnPreparedStatement === true
		? prepStatement
		: generateQueryFromPreparedStatement(prepStatement);
};

export default update;
