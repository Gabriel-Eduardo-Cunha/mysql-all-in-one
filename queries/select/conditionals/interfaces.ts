import { OperatorOptionsType } from "./types";
import { ConditionObject } from "./types";

export interface ConditionOperatorInterface {
	[key: string]: OperatorOptionsType;
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

export interface OperatorOptionsObject {
	like?: string;
	notlike?: string;
	rlike?: string;
	notrlike?: string;
	between?: Array<any>;
	notbetween?: Array<any>;
	in?: Array<any>;
	notin?: Array<any>;
	'>'?: any;
	'<'?: any;
	'>='?: any;
	'<='?: any;
	'<>'?: any;
	'!='?: any;
	'='?: any;
}

export interface AliasObject {
	alias: string;
}

