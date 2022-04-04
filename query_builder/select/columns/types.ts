export type SelectColumns =
	| String
	| Array<string | SelectObject>
	| SelectObject;

interface SelectObject {
	[index: number]: never;
	/**
	 * Key is the alias. If value type is String will escape the names with \`\`. Name escaping will be ignored if passing an object with expression key containing the query expression.
	 */
	[key: string]: string | undefined | ColumnAliasObject;
	/**
	 * @description Objects with string values, be careful with possible SQL Injections (text here are not escaped in any way)
	 * @example __expression: {
	 *		birthday: `DATE_FORMAT(birthday, "%d/%m/%Y")`,
	 * }
	 * >>> (DATE_FORMAT(birthday, "%d/%m/%Y")) AS `birthday`
	 */
	__expression?: ColumnAliasObject;
}

interface ColumnAliasObject {
	[key: string]: string;
}

export const isColumnAliasObject = (val: any): val is ColumnAliasObject =>
	val !== undefined &&
	val !== null &&
	!Array.isArray(val) &&
	typeof val === 'object' &&
	Object.values(val).reduce(
		(acc: boolean, cur) =>
			acc && (typeof cur === 'string' || cur === undefined),
		true
	);
