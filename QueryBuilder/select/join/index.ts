import { isJoinObject, JoinReturnObject } from './types';
import create_columns from '../columns';
import { SelectJoin } from './types';
import create_conditions from '../conditionals/create_conditions';
import { tableObject } from '..';
import { emptyPrepStatement, PreparedStatement, SqlValues } from '../../types';
import { isNotEmptyString } from '../../utils';

const join = (join: SelectJoin, alias?: string): JoinReturnObject => {
	const sJoins: Array<string> = [];
	const joinColumns: Array<string | undefined> = [];
	const joinPrepStamentValues: Array<SqlValues> = [];
	const jColumnsValues: SqlValues[] = [];
	if (join === undefined)
		return {
			joinPreparedStatement: { ...emptyPrepStatement },
			columnsPreparedStatement: { ...emptyPrepStatement },
		};
	if (!Array.isArray(join)) join = [join];
	join.filter((j) => isJoinObject(j)).forEach((j) => {
		const { columns, table, type, on } = j;

		const {
			table: joinExpression,
			alias: joinAlias,
			values: tableValues,
		} = tableObject(table);
		joinPrepStamentValues.push(...tableValues);
		if (columns !== undefined) {
			const joinColumnsPrepStatement = create_columns(columns, joinAlias);
			jColumnsValues.push(...joinColumnsPrepStatement.values);
			joinColumns.push(joinColumnsPrepStatement.statement);
		}
		let onStatement = '';
		if (on !== undefined) {
			const onPrepStatement = create_conditions(
				on,
				alias && joinAlias,
				alias
			);
			if (isNotEmptyString(onPrepStatement.statement)) {
				onStatement = ` ON ${onPrepStatement.statement}`;
				joinPrepStamentValues.push(...onPrepStatement.values);
			}
		}
		sJoins.push(
			`${type ? `${type.toUpperCase()} ` : ''}JOIN ${joinExpression}${
				joinAlias && joinAlias !== joinExpression ? ` ${joinAlias}` : ''
			}${onStatement}`
		);
	});
	const jColumns = joinColumns.filter((j) => !!j).join(',');
	const joinPrepStatement: PreparedStatement = {
		statement: sJoins.length !== 0 ? ` ${sJoins.join(' ')}` : '',
		values: joinPrepStamentValues,
	};

	return {
		joinPreparedStatement: joinPrepStatement,
		columnsPreparedStatement: {
			statement: jColumns,
			values: jColumnsValues,
		},
	};
};

export default join;
