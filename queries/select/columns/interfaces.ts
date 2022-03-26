import { ExpressionObject } from "../interfaces";

export interface SelectObject {
	/**
	 * Key is the alias. If value type is String will escape the names with \`\`. Name escaping will be ignored if passing an object with expression key containing the query expression.
	 */
	[key: string]: string | ExpressionObject | undefined;
}
