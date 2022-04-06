import { ConditionOptions } from '../select/conditionals/types';
import where from '../select/conditionals/where';
import {
	generateQueryFromPreparedStatement,
	PreparedStatement,
} from '../types';
import { escapeNames, extractTableAlias } from '../utils';
import { defaultDeleteOptions, DeleteOptions } from './types';

const deleteFrom = (
	table: string,
	whereOpts?: ConditionOptions,
	opts?: DeleteOptions
): string | PreparedStatement => {
	const { ignore, quick, returnPreparedStatement } = {
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
		statement: `DELETE ${quick === true ? 'QUICK ' : ''}${
			ignore === true ? 'IGNORE ' : ''
		}FROM ${tableRef}${whereStatement};`,
		values: whereValues,
	};
	return returnPreparedStatement === true
		? prepStatement
		: generateQueryFromPreparedStatement(prepStatement);
};

export default deleteFrom;
