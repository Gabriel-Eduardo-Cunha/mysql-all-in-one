
import {
	SqlColumn,
	SqlExp,
	SqlExpressionPreparedStatement,
} from "./types";



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
