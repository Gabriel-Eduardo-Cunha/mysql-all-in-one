import { isJoinObject } from './types';
import { isAliasExpressionObject } from './types';
import { putBrackets, escapeNames, extractTableAlias } from '../../utils';
import create_columns from '../columns';
import { SelectJoin } from './types';
import create_conditions from '../conditionals/create_conditions';
import { tableObject } from '..';

const join = (join: SelectJoin, alias?: string): Array<any> => {
	const sJoins: Array<string> = [];
	const joinColumns: Array<string | undefined> = [];
	if (join === undefined) return [sJoins, ''];
	if (!Array.isArray(join)) join = [join];
	join.filter((j) => isJoinObject(j)).forEach((j) => {
		const { columns, table, type, on } = j;

		const [joinExpression, joinAlias] = tableObject(table);
		if (columns !== undefined)
			joinColumns.push(create_columns(columns, joinAlias));
		sJoins.push(
			`${type ? `${type.toUpperCase()} ` : ''}JOIN ${joinExpression}${
				joinAlias && joinAlias !== joinExpression ? ` ${joinAlias}` : ''
			}${
				on
					? ` ON ${create_conditions(on, alias && joinAlias, alias)}`
					: ''
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
