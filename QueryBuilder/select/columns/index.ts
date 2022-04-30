import {
	isSqlExpressionPreparedStatement,
	PreparedStatement,
	SqlValues,
} from '../../types';
import {
	escapeNames,
	putBackticks,
	putBrackets,
	safeApplyAlias,
} from '../../utils';
import { isColumnAliasObject, SelectColumns } from './types';

const create_columns = (
	columns?: SelectColumns,
	alias?: string
): PreparedStatement => {
	if (typeof columns === 'string') {
		if (columns === '*') {
			return { statement: '*', values: [] };
		}
		if (columns.endsWith('.*')) {
			return {
				statement: `${escapeNames(
					columns.substring(0, columns.length - 2)
				)}.*`,
				values: [],
			};
		}
		return {
			statement: safeApplyAlias(escapeNames(columns), alias),
			values: [],
		};
	}
	if (Array.isArray(columns)) {
		return columns
			.map((c) => create_columns(c, alias))
			.filter((v) => !!v)
			.reduce(
				(acc, cur) => {
					acc.statement += `,${cur.statement}`;
					acc.values.push(...cur.values);
					return acc;
				},
				{ statement: '', values: [] }
			);
	}
	if (
		typeof columns === 'object' &&
		columns !== null &&
		columns !== undefined
	) {
		const values: SqlValues[] = [];
		return {
			statement: Object.entries(columns)
				.filter(([_, val]) => val !== undefined)
				.map(([key, val]) => {
					const columnAlias = putBackticks(key);
					if (isSqlExpressionPreparedStatement(val)) {
						values.push(...val.values);
						val.statement = val.statement
							.split('__SQL__EXPRESSION__ALIAS__')
							.join(alias);
						return `${val.statement} AS ${columnAlias}`;
					}
					if (typeof val !== 'string') {
						throw `Incorrect columns object. Type error: expected string received "${typeof val}" value: ${val}`;
					}

					const columnRef = safeApplyAlias(
						escapeNames(val as string),
						alias
					);
					if (val === key) return columnRef;
					return `${columnRef} AS ${columnAlias}`;
				})
				.join(','),
			values,
		};
	}
	return {
		statement: typeof alias === 'string' ? `${alias}.*` : '*',
		values: [],
	};
};

export default create_columns;
