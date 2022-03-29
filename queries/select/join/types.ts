import { SelectColumns } from '../columns/types';
import { OperatorOptionsObject } from '../conditionals/types';

interface ConditionObject {
	[y: number]: never;
	[k: string]:
		| OperatorOptionsObject
		| String
		| number
		| Date
		| null
		| undefined
		| boolean
		| Array<String | number | Date>;
	__or?: boolean;
}

interface ColumnsRelation {
	__cols_relation?: Array<Array<string>>;
}
interface ColumnsRelationArray {
	// [index: number]: string | ColumnsRelationArray;
	// /**
	//  * If no alias passed will use the JOIN Alias
	//  */
	// [0]: string;
	// /**
	//  * If no alias passed will use the FROM alias
	//  */
	// [1]: string;
}

interface ConditionOptionsArray extends Array<any> {
	[0]?: '__or' | OnConditionObject | String | ConditionOptionsArray;
	[index: number]:
		| OnConditionObject
		| String
		| ConditionOptionsArray
		| undefined;
}

type OnConditionObject = ConditionObject & ColumnsRelation;

export type JoinConditionOptions =
	| ConditionOptionsArray
	| OnConditionObject
	| string;

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
	on?: JoinConditionOptions;
	type?: JoinType;
	columns?: SelectColumns;
}
export const isJoinObject = (val: any): val is JoinObject => {
	return typeof val?.table === 'string' || isJoinExpressionObject(val);
};

export type SelectJoin = JoinObject | Array<JoinObject> | undefined;
