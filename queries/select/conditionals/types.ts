export type ConditionOptions =
	| ConditionOptionsArray
	| ConditionObject
	| string
	| undefined;

type ConditionOptionsArray = ['__or' | ConditionOptions, ...ConditionOptions[]];

type sqlValues = string | Date | Array<sqlValues> | null | boolean | number;

interface ConditionObject {
	__or?: boolean;
	__col_relation?: ColumnRelationObject;
	[k: string]:
		| sqlValues
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
	between?: Array<String | number | Date>;
	notbetween?: Array<String | number | Date>;
	in?: Array<String | number | Date>;
	notin?: Array<String | number | Date>;
	'>'?: String | number | Date;
	'<'?: String | number | Date;
	'>='?: String | number | Date;
	'<='?: String | number | Date;
	'<>'?: String | number | Date;
	'!='?: String | number | Date;
	'='?: String | number | Date;
}
const OperatorOptionsObjectKeys: Array<string> = [
	'like',
	'notlike',
	'rlike',
	'notrlike',
	'between',
	'notbetween',
	'in',
	'notin',
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
			(prev: boolean, cur: string) =>
				prev || OperatorOptionsObjectKeys.includes(cur),
			false
		)
	);
};
