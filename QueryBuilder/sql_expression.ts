import { SqlColumn, SqlExp, SqlValues, isSqlExpressionPreparedStatement } from "./types";
import { escapeNames, safeApplyAlias } from "./utils";


/**
 *
 * @description Tagged template literal function to create sql expressions, will automatically escape interpolated variables to valid sql values or if will escape column names if combined with `sqlCol` function, or to complete ignore a string use `sqlExp` function;
 * @example sqlExpression`STR_TO_DATE(${sqlCol('date')}, "%d/%m/%Y") = ${new Date(2020, 8, 30)} AND ${sqlCol('date') > ${sqlCol('another_table.date')`
 * >> 'STR_TO_DATE(date, "%d/%m/%Y") = "2020-8-30" AND date > '
 */
export const sqlExpression = (
	[firstStr, ...rest]: TemplateStringsArray,
	...values: Array<SqlValues | SqlColumn | Record<string, any>>
): Record<string, any> => {
	const prepValues: SqlValues[] = [];
	const statement = rest.reduce((acc, cur, i) => {
		const curVal: SqlColumn | Record<string, any> | SqlValues = values[i];
		if (curVal instanceof SqlExp) {
			return `${acc}${curVal.expression}${cur}`;
		}
		if (curVal instanceof SqlColumn) {
			return `${acc}${safeApplyAlias(
				escapeNames((curVal as SqlColumn).column),
				"__SQL__EXPRESSION__ALIAS__"
			)}${cur}`;
		}
		if (isSqlExpressionPreparedStatement(curVal)) {
			prepValues.push(...curVal.values);
			return `${acc}${curVal.statement}${cur}`;
		}
		prepValues.push(curVal as SqlValues);
		return `${acc}?${cur}`;
	}, firstStr);
	return {
		statement,
		values: prepValues,
		__is_prep_statement: true,
	};
};