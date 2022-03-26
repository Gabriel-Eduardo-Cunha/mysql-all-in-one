import { ConditionAndOrInterface, ConditionOperatorInterface, ConditionOptionsArray } from "./interfaces";
import { OperatorOptionsObject } from "./interfaces";
export type ConditionObject = ConditionOperatorInterface & ConditionAndOrInterface;

export type OperatorOptionsType =
	| OperatorOptionsObject
	| String
	| number
	| Date
	| null
	| undefined
	| boolean
	| Array<String | number | Date>;

export type ConditionOptions = ConditionOptionsArray | ConditionObject;