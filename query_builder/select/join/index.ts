import { isJoinObject, JoinReturnObject } from './types';
import create_columns from '../columns';
import { SelectJoin } from './types';
import create_conditions from '../conditionals/create_conditions';
import { tableObject } from '..';
import { emptyPrepStatement, PreparedStatement, SqlValues } from '../../types';

const join = (join: SelectJoin, alias?: string): JoinReturnObject => {
	const sJoins: Array<string> = [];
	const joinColumns: Array<string | undefined> = [];
	const joinPrepStamentValues: Array<SqlValues> = [];
	if (join === undefined)
		return {
			joinPreparedStatement: { ...emptyPrepStatement },
			columnsPreparedStatement: '',
		};
	if (!Array.isArray(join)) join = [join];
	join.filter((j) => isJoinObject(j)).forEach((j) => {
		const { columns, table, type, on } = j;

		const {
			table: joinExpression,
			alias: joinAlias,
			values: tableValues,
		} = tableObject(table);
		if (columns !== undefined) {
			joinColumns.push(create_columns(columns, joinAlias));
		}
		const onPrepStatement = create_conditions(
			on,
			alias && joinAlias,
			alias
		);
		joinPrepStamentValues.push(...onPrepStatement.values);
		sJoins.push(
			`${type ? `${type.toUpperCase()} ` : ''}JOIN ${joinExpression}${
				joinAlias && joinAlias !== joinExpression ? ` ${joinAlias}` : ''
			}${on ? ` ON ${onPrepStatement.statement}` : ''}`
		);
	});
	const jColumns = joinColumns.filter((j) => !!j).join(',');
	const joinPrepStatement: PreparedStatement = {
		statement: sJoins.length !== 0 ? ` ${sJoins.join(' ')}` : '',
		values: joinPrepStamentValues,
	};

	return {
		joinPreparedStatement: joinPrepStatement,
		columnsPreparedStatement: jColumns,
	};
};

export default join;
