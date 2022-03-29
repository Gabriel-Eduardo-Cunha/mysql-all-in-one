export interface ConditionObject {
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

/**
 * If first value is equal to "__or" will use OR between conditions.
 */
export interface ConditionOptionsArray extends Array<any> {
	[0]?: '__or' | ConditionObject | String | ConditionOptionsArray;
	[index: number]:
		| ConditionObject
		| String
		| ConditionOptionsArray
		| undefined;
}

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

export type ConditionOptions = ConditionOptionsArray | ConditionObject | string;
