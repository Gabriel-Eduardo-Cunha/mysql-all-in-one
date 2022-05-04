import { ConditionOptions } from '../select/conditionals/types';
import where from '../select/conditionals/where';
import { order } from '../select/order';
import {
	generateQueryFromPreparedStatement,
	isSqlExpressionPreparedStatement,
	PreparedStatement,
	SqlValues,
} from '../types';
import {
	escapeNames,
	extractTableAlias,
	placeAliasInSqlExpression,
	putBackticks,
	putBrackets,
} from '../utils';
import {
	defaultUpdateOptions,
	isUpdateValues,
	UpdateOptions,
	UpdateValues,
} from './types';

/**
 *
 * @param table Table to update
 * @param values New values, Object where keys are the columns to be updated
 * @param whereOpts Where object
 * @param opts Extra update options like `ignore`, `order`, `limit`
 * @returns UPDATE SQL Query
 * @example update('table', {name: "John", bornData: new Date(2020,8,30)}, {id: 1})
 * >>> "UPDATE `table` SET `name` = 'John',`bornData` = '2020-09-30 00:00:00.000' WHERE (`table`.`id` = 1);"
 */
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
			if (isSqlExpressionPreparedStatement(val)) {
				val = placeAliasInSqlExpression(val, null);
				prepStatementValues.push(...val.values);
				return `${putBackticks(key)} = ${putBrackets(val.statement)}`;
			}
			prepStatementValues.push(val as SqlValues);
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
