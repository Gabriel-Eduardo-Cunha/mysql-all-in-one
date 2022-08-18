import { ConditionOptions } from '../select/conditionals/types';
import where from '../select/conditionals/where';
import { order } from '../select/order';
import {
	generateQueryFromPreparedStatement,
	PreparedStatement,
} from '../types';
import { escapeNames, extractTableAlias } from '../utils';
import { defaultDeleteOptions, DeleteOptions } from './types';

/**
 * @description Delete from query.
 * @param table Table of delete from.
 * @param whereOpts Optional where object to filter deleted data.
 * @param opts Extra delete options like `ignore`, `quick`
 * @returns Delete from SQL query.
 * @example deleteFrom('table', {id: 5}, {ignore: true});
 * >>> "DELETE IGNORE FROM `table` WHERE (`table`.`id` = 5);"
 */
const deleteFrom = (
	table: string,
	whereOpts?: ConditionOptions,
	opts?: DeleteOptions
): string | PreparedStatement => {
	const {
		ignore,
		quick,
		returnPreparedStatement,
		limit,
		order: orderOpts,
	} = {
		...defaultDeleteOptions,
		...opts,
	};
	const tableRef = escapeNames(table);
	const [_, alias] = extractTableAlias(tableRef);
	const { statement: whereStatement, values: whereValues } = where(
		whereOpts,
		alias
	);
	const prepStatement: PreparedStatement = {
		statement: `DELETE ${quick === true ? "QUICK " : ""}${
			ignore === true ? "IGNORE " : ""
		}FROM ${tableRef}${whereStatement}${order(orderOpts, alias)}${
			limit ? ` LIMIT ${limit}` : ""
		};`,
		values: whereValues,
		__is_prep_statement: true,
	};
	return returnPreparedStatement === true
		? prepStatement
		: generateQueryFromPreparedStatement(prepStatement);
};

export default deleteFrom;
