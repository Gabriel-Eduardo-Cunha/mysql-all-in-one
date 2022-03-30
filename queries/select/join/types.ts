import { SelectColumns } from '../columns/types';
import { ConditionOptions } from '../conditionals/types';

interface JoinExpressionObject {
	expression: string;
	alias: string;
}
const isJoinExpressionObject = (val: any): val is JoinExpressionObject =>
	val !== undefined &&
	val !== null &&
	!Array.isArray(val) &&
	typeof val === 'object' &&
	val.expression !== undefined &&
	val.alias !== undefined;

type JoinTable = string | JoinExpressionObject;
type JoinType = 'inner' | 'left' | 'right';
interface JoinObject {
	/**
	 * Table or expression Object
	 */
	table: JoinTable;
	on?: ConditionOptions;
	type?: JoinType;
	columns?: SelectColumns;
}
export const isJoinObject = (val: any): val is JoinObject => {
	return typeof val?.table === 'string' || isJoinExpressionObject(val);
};

export type SelectJoin = JoinObject | Array<JoinObject> | undefined;
