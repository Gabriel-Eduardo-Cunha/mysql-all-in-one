import { SelectColumns } from "../columns/types";
import { ConditionOptions } from "../conditionals/types";
import { JoinTable, JoinType } from "./types";

export interface JoinObject {
	/**
	 * Table or derived table
	 */
	table: JoinTable;
	on?: JoinOnOptions;
	type?: JoinType;
	columns?: SelectColumns;
}

export type JoinOnOptions = string|Array<string|JoinOnOptions> |JoinOnOptions

export interface ConditionOperatorInterface {
	[key: string]: OnColumnsType;
}
export interface ConditionAndOrInterface {
	/**
	 * If TRUE will use OR between conditions, will use AND otherwise. Default FALSE
	 */
	__or?: Boolean;
}

/**
 * If first value is equal to "__or" will use OR between conditions.
 */
 export interface ConditionOptionsArray {
	[index: number]: ConditionObject | String | Array<ConditionOptionsArray>;
}

