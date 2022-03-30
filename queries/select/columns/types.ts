

interface ExpressionKey {
	__expression: ColumnAliasObject;
}

export type SelectColumns =
	| string
	| Array<string | SelectObject>
	| SelectObject;

type SelectObject = ColumnAliasObject

interface ColumnAliasObject {
	/**
	 * Key is the alias. If value type is String will escape the names with \`\`. Name escaping will be ignored if passing an object with expression key containing the query expression.
	 */
	[key: string]: string | undefined;
}
export const isColumnAliasObject = (val:any):val is ColumnAliasObject => val !== undefined 
	&& val !== null && !Array.isArray(val) 
	&& typeof val === 'object' 
	&& Object.values(val).reduce(
		(acc:boolean, cur) => acc && (typeof cur === 'string' || cur === undefined), true);
