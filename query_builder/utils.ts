import mysql from 'mysql2';
import { ConditionOptions } from './select/conditionals/types';
import { PreparedStatement, SqlValues } from './types';

/**
 * Escapes a value into a valid mysql String representation
 */
export const escVal = mysql.escape;

/**
 *
 * @description Tagged template literal function to create sql expressions, will automatically escape interpolated variables to valid sql values;
 * @example sqlExpression`STR_TO_DATE(date, "%d/%m/%Y") = ${new Date(2020, 8, 30)}`
 * >> 'STR_TO_DATE(date, "%d/%m/%Y") = "2020-8-30"'
 */
export const sqlExpression = (
	[firstStr, ...rest]: TemplateStringsArray,
	...values: Array<SqlValues>
): ConditionOptions => {
	const statement = rest.reduce((acc, cur) => `${acc}?${cur}`, firstStr);
	return {
		statement,
		values,
		__is_prep_statement: true,
	};
};

/**
 * @description Tagged template literal function to escape all passed values
 * @example const name = 'Foo'; escStr`name=${name}`;
 * @output "name = 'Foo'"
 */
export const escStr = (
	[firstStr, ...rest]: TemplateStringsArray,
	...values: Array<any>
): String =>
	rest.reduce((acc, cur, i) => `${acc}${escVal(values[i])}${cur}`, firstStr);

export const escapeNames = (key: string): string =>
	key
		.trim()
		.replace(/ +/g, ' ') // removes double spaces
		.replace(/ as /i, ' ') // remove " as " not case sensitive
		.split(' ')
		.map((val) =>
			val
				.split('.')
				.map((v) => putBackticks(v))
				.join('.')
		)
		.join(' ');

export const putBackticks = (value: string): string =>
	value.charAt(0) === '`' && value.charAt(value.length - 1) === '`'
		? value
		: `\`${value}\``;

export const putBrackets = (value: string): string =>
	value.charAt(0) === '(' && value.charAt(value.length - 1) === ')'
		? value
		: `(${value})`;

/**
 *
 * @param tableRef
 * @returns [table, alias]
 */
export const extractTableAlias = (tableRef: string): Array<string> => {
	const split = tableRef.split(' ');
	if (split.length !== 2) return [tableRef, tableRef];
	return [split[0], split[1]];
};

export const safeApplyAlias = (subject: string, alias?: string): string =>
	subject.indexOf('.') === -1 && alias && typeof alias === 'string'
		? `${alias}.${subject}`
		: subject;
