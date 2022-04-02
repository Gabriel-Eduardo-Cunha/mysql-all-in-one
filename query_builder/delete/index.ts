import { ConditionOptions } from '../select/conditionals/types';
import where from '../select/conditionals/where';
import { escapeNames, extractTableAlias } from '../utils';
import { defaultDeleteOptions, DeleteOptions } from './types';

const deleteFrom = (
	table: string,
	whereOpts?: ConditionOptions,
	opts?: DeleteOptions
): string => {
	const { ignore, quick } = { ...defaultDeleteOptions, ...opts };
	const tableRef = escapeNames(table);
	const [_, alias] = extractTableAlias(tableRef);
	return `DELETE ${quick === true ? 'QUICK ' : ''}${
		ignore === true ? 'IGNORE ' : ''
	}FROM ${tableRef}${where(whereOpts, alias)};`;
};

export default deleteFrom;
