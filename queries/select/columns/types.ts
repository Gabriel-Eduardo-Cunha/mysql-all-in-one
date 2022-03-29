import { ExpressionObject } from '../types';

export type SelectColumns =
	| string
	| Array<string | SelectObject>
	| SelectObject;

interface SelectObject {
	/**
	 * Key is the alias. If value type is String will escape the names with \`\`. Name escaping will be ignored if passing an object with expression key containing the query expression.
	 */
	[key: string]: string | ExpressionObject | undefined;
}
export const isExpressionObject = (val: any): val is ExpressionObject => {
	return typeof val?.expression === 'string';
};
