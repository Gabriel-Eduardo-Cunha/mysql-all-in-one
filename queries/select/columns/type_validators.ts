import { ExpressionObject } from "../interfaces";

export const isExpressionObject = (val: any): val is ExpressionObject => {
	return typeof val?.expression === 'string';
};