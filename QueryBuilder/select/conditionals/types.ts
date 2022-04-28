import { SqlValues } from '../../types';

export type ConditionOptions =
	| ConditionOptionsArray
	| ConditionObject
	| undefined;

type ConditionOptionsArray = ['__or' | ConditionOptions, ...ConditionOptions[]];

interface ConditionObject {
	__or?: boolean;
	__col_relation?: ColumnRelationObject;
	[k: string]:
		| SqlValues
		| Array<SqlValues>
		| OperatorOptionsObject
		| ColumnRelationObject
		| undefined;
	[y: number]: never;
}

interface ColumnRelationObject {
	[k: string]: string;
}
export const isColumnRelationObject = (
	value: any
): value is ColumnRelationObject =>
	value !== undefined &&
	value !== null &&
	!Array.isArray(value) &&
	typeof value === 'object' &&
	Object.entries(value).reduce(
		(acc: boolean, [key, val]) =>
			acc && typeof key === 'string' && typeof val === 'string',
		true
	);

export interface OperatorOptionsObject {
	like?: string;
	notlike?: string;
	rlike?: string;
	notrlike?: string;
	regexp?: string;
	notregexp?: string;
	between?: Array<string | number | Date>;
	notbetween?: Array<string | number | Date>;
	in?: Array<string | number | Date>;
	is?: SqlValues;
	isnot?: SqlValues;
	notin?: Array<string | number | Date>;
	'<=>'?: SqlValues;
	'>'?: string | number | Date;
	'<'?: string | number | Date;
	'>='?: string | number | Date;
	'<='?: string | number | Date;
	'<>'?: string | number | Date;
	'!='?: string | number | Date;
	'='?: string | number | Date;
}
const OperatorOptionsObjectKeys: Array<String> = [
	'like',
	'notlike',
	'rlike',
	'notrlike',
	'regexp',
	'notregexp',
	'between',
	'notbetween',
	'in',
	'notin',
	'is',
	'isnot',
	'<=>',
	'>',
	'<',
	'>=',
	'<=',
	'<>',
	'!=',
	'=',
];
export const isOperatorOptionsObject = (
	val: any
): val is OperatorOptionsObject => {
	return (
		typeof val === 'object' &&
		val !== null &&
		val !== undefined &&
		Object.keys(val).reduce(
			(prev: boolean, cur: String) =>
				prev || OperatorOptionsObjectKeys.includes(cur),
			false
		)
	);
};