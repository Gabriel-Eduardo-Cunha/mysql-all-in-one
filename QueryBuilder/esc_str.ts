import { escVal } from "./esc_val";
import { SqlColumn, SqlValues } from "./types";
import { escapeNames } from "./utils";

const escapeValue = (value: SqlValues | SqlColumn): string =>
	value instanceof SqlColumn ? escapeNames(value.column) : escVal(value);

/**
 * @description Tagged template literal function to escape all passed values
 * @example const name = 'Foo'; escStr`name=${name}`;
 * >> "name = 'Foo'"
 */
export const escStr = (
	[firstStr, ...rest]: TemplateStringsArray,
	...values: Array<SqlValues | SqlColumn>
): string =>
	rest.reduce(
		(acc, cur, i) => `${acc}${escapeValue(values[i])}${cur}`,
		firstStr
	);