import {
	isSqlExpressionPreparedStatement,
	PreparedStatement,
	SqlValues,
} from '../../types';
import {
	escapeNames,
	placeAliasInSqlExpression,
	putBackticks,
	putBrackets,
	safeApplyAlias,
} from '../../utils';
import { isColumnAliasObject, SelectColumns } from './types';

const create_columns = (
	columns?: SelectColumns,
	alias?: string
): PreparedStatement => {
	if (typeof columns === "string") {
		if (columns === "*") {
			return { statement: "*", values: [], __is_prep_statement: true };
		}
		if (columns.endsWith(".*")) {
			return {
				statement: `${escapeNames(
					columns.substring(0, columns.length - 2)
				)}.*`,
				values: [],
				__is_prep_statement: true,
			};
		}
		return {
			statement: safeApplyAlias(escapeNames(columns), alias),
			values: [],
			__is_prep_statement: true,
		};
	}
	if (Array.isArray(columns)) {
		const prepStatemnt = columns
			.map((c) => create_columns(c, alias))
			.filter((v) => !!v)
			.reduce(
				(acc, cur) => {
					acc.statement.push(cur.statement);
					acc.values.push(...cur.values);
					return acc;
				},
				{
					statement: [] as string[],
					values: [] as SqlValues[],
					__is_prep_statement: true,
				}
			);
		const statementQuery = prepStatemnt.statement.join(",");
		prepStatemnt.__is_prep_statement = true;
		return {
			statement: statementQuery,
			values: prepStatemnt.values,
			__is_prep_statement: true,
		};
	}
	if (
		typeof columns === "object" &&
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
						val = placeAliasInSqlExpression(val, alias);
						return `${val.statement} AS ${columnAlias}`;
					}
					if (typeof val !== "string") {
						throw `Incorrect columns object. Type error: expected string received "${typeof val}" value: ${val}`;
					}

					const columnRef = safeApplyAlias(
						escapeNames(val as string),
						alias
					);
					if (val === key) return columnRef;
					return `${columnRef} AS ${columnAlias}`;
				})
				.join(","),
			values,
			__is_prep_statement: true,
		};
	}
	return {
		statement: typeof alias === "string" ? `${alias}.*` : "*",
		values: [],
		__is_prep_statement: true,
	};
};

export default create_columns;
