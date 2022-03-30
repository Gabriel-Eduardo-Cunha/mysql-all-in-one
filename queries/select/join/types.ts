import { SelectColumns } from '../columns/types';
import { ConditionOptions } from '../conditionals/types';
import { isAliasExpressionObject, AliasExpressionObject } from '../types';

type JoinTable = string | AliasExpressionObject;
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
