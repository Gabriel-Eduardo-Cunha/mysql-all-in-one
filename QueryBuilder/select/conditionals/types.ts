import { SqlValues, SqlColumn } from '../../types';

export type ConditionOptions =
	| ConditionOptionsArray
	| ConditionObject
	| Record<string, any>
	| undefined;

export type ConditionOptionsArray = [
	'__or' | ConditionOptions,
	...ConditionOptions[]
];

export interface ConditionObject {
	__or?: boolean;
	__col_relation?: ColumnRelationObject;
	[k: string]:
		| SqlValues
		| Array<SqlValues>
		| OperatorOptionsObject
		| ColumnRelationObject
		| SqlColumn
		| undefined;
	[y: number]: never;
}

export interface ColumnRelationObject {
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
	like?: string | SqlColumn;
	notlike?: string | SqlColumn;
	rlike?: string | SqlColumn;
	notrlike?: string | SqlColumn;
	regexp?: string | SqlColumn;
	notregexp?: string | SqlColumn;
	between?: Array<string | number | Date | SqlColumn>;
	notbetween?: Array<string | number | Date | SqlColumn>;
	in?: Array<string | number | Date>;
	is?: SqlValues;
	isnot?: SqlValues;
	notin?: Array<string | number | Date>;
	'<=>'?: SqlValues;
	'>'?: string | number | Date | SqlColumn;
	'<'?: string | number | Date | SqlColumn;
	'>='?: string | number | Date | SqlColumn;
	'<='?: string | number | Date | SqlColumn;
	'<>'?: string | number | Date | SqlColumn;
	'!='?: string | number | Date | SqlColumn;
	'='?: string | number | Date | SqlColumn;
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
