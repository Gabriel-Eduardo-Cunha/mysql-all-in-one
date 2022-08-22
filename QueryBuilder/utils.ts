import mysql from 'mysql2';
import { ConditionOptions } from './select/conditionals/types';
import {
	isSqlExpressionPreparedStatement,
	SqlColumn,
	SqlExp,
	SqlExpressionPreparedStatement,
	SqlValues,
} from "./types";

/**
 * Escapes a value into a valid mysql String representation
 */
export const escVal = mysql.escape;

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

/**
 * @description Tagged template literal function to escape all passed values
 * @example const name = 'Foo'; escStr`name=${name}`;
 * >> "name = 'Foo'"
 */
export const escStr = (
	[firstStr, ...rest]: TemplateStringsArray,
	...values: Array<SqlValues | SqlColumn>
): string =>
	rest.reduce((acc, cur, i) => `${acc}${escVal(values[i])}${cur}`, firstStr);

export const escapeNames = (key: string): string =>
	key
		.trim()
		.replace(/ +/g, " ") // removes double spaces
		.replace(/ as /i, " ") // remove " as " not case sensitive
		.split(" ")
		.map((val) =>
			val
				.split(".")
				.map((v) => putBackticks(v))
				.join(".")
		)
		.join(" ");

export const putBackticks = (value: string): string =>
	value.charAt(0) === "`" && value.charAt(value.length - 1) === "`"
		? value
		: `\`${value}\``;

export const putBrackets = (value: string): string => `(${value})`;

/**
 *
 * @param tableRef
 * @returns [table, alias]
 */
export const extractTableAlias = (tableRef: string): Array<string> => {
	const split = tableRef.split(" ");
	if (split.length !== 2) return [tableRef, tableRef];
	return [split[0], split[1]];
};

export const safeApplyAlias = (subject: string, alias?: string): string =>
	subject.indexOf(".") === -1 && alias && typeof alias === "string"
		? `${alias}.${subject}`
		: subject;

export const isNotEmptyString = (val: any): val is string =>
	val !== undefined &&
	val !== null &&
	typeof val === "string" &&
	val.length !== 0;

/**
 *
 * @description Will return SqlColumn object, that is interpretated as a column, not as a string. Can be used in WHERE, sqlExpression
 * @example
 * {where: {date: sqlCol('another_table.date')}}
 * >> WHERE `date` = `another_table`.`date`
 */
export const sqlCol = (column: string): SqlColumn => new SqlColumn(column);

export const sqlExp = (column: string): SqlExp => new SqlExp(column);

export const placeAliasInSqlExpression = (
	sqlExpression: SqlExpressionPreparedStatement,
	alias: string | null | undefined
) => {
	sqlExpression.statement = sqlExpression.statement
		.split('__SQL__EXPRESSION__ALIAS__.')
		.join(
			typeof alias === 'string' && alias.length !== 0 ? `${alias}.` : ''
		);
	return sqlExpression;
};
