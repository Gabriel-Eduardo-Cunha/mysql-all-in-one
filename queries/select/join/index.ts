import { isJoinObject } from './types';
import { isExpressionObject } from '../types';
import { putBrackets, escapeNames, extractTableAlias } from '../../utils';
import create_columns from '../columns';
import { SelectJoin } from './types';
import create_conditions from '../conditionals/create_conditions';

const join = (join: SelectJoin, alias: string): Array<any> => {
	const sJoins: Array<string> = [];
	const joinColumns: Array<string | undefined> = [];
	if (join === undefined) return [sJoins, ''];
	if (!Array.isArray(join)) join = [join];
	join.filter((j) => isJoinObject(j)).forEach((j) => {
		const { columns, table, type, on } = j;
		const tableRef = isExpressionObject(table)
			? `${putBrackets(table.expression)} ${table.alias}`
			: escapeNames(table);
		const [_, joinAlias] = isExpressionObject(table)
			? [table.expression, table.alias]
			: extractTableAlias(tableRef);
		if (columns !== undefined)
			joinColumns.push(create_columns(columns, joinAlias));
		sJoins.push(
			`${type ? `${type.toUpperCase()} ` : ''}JOIN ${tableRef}${
				on ? ` ON ${create_conditions(on, joinAlias, alias)}` : ''
			}`
		);
	});
	const jColumns = joinColumns.filter((j) => !!j).join(',');
	return [
		sJoins.length !== 0 ? ` ${sJoins.join(' ')}` : '',
		jColumns ? `,${jColumns}` : '',
	];
};

export default join;
