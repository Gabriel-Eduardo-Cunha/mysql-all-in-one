import mysql from 'mysql2';

/**
 * Escapes a value into a valid mysql String representation
 */
export const escVal = mysql.escape;

/**
 * Tagged template literal function to escape all passed values
 * Example:
 * 	const name = 'Foo'
 * 	escStr\`name = ${name}\`
 * > name = 'Foo'
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
