import { PreparedStatement } from '../../types';
import { SelectColumns } from '../columns/types';
import { ConditionOptions } from '../conditionals/types';
import { SelectTable } from '../types';

export interface AliasExpressionObject {
	[key: string]: string;
}
export const isAliasExpressionObject = (
	val: any
): val is AliasExpressionObject =>
	val !== undefined &&
	val !== null &&
	!Array.isArray(val) &&
	typeof val === 'object' &&
	Object.keys(val).length !== 0;

type JoinTable = SelectTable;
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
	return typeof val?.table === 'string' || isAliasExpressionObject(val);
};

export type SelectJoin = JoinObject | Array<JoinObject> | undefined;

export interface JoinReturnObject {
	joinPreparedStatement: PreparedStatement;
	columnsPreparedStatement: PreparedStatement;
}
