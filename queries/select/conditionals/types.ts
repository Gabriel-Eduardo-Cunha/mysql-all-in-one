export type ConditionOptions =
	| ConditionOptionsArray
	| ConditionObject
	| String
	| undefined;

type ConditionOptionsArray = ['__or' | ConditionOptions, ...ConditionOptions[]];

type sqlValues = String | Date | Array<sqlValues> | null | boolean | number;

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
	like?: String;
	notlike?: String;
	rlike?: String;
	notrlike?: String;
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
const OperatorOptionsObjectKeys: Array<String> = [
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
			(prev: boolean, cur: String) =>
				prev || OperatorOptionsObjectKeys.includes(cur),
			false
		)
	);
};
