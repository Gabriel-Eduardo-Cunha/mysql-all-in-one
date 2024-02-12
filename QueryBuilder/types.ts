

export type SqlValues = string | Date | null | boolean | number | undefined;

export interface PreparedStatement {
	statement: string;
	values: Array<SqlValues>;
	__is_prep_statement: boolean;
}

export const isSqlValues = (val: any): val is SqlValues =>
	val === null ||
	val === undefined ||
	(["string", "boolean", "number", "object"].includes(typeof val) &&
		!Array.isArray(val) &&
		(typeof val !== "object" || val instanceof Date));

export const isArrayOfStrings = (val: any): val is Array<string> =>
	val !== undefined &&
	val !== null &&
	Array.isArray(val) &&
	val.every((v) => typeof v === "string");

export const emptyPrepStatement: PreparedStatement = {
	statement: "",
	values: [],
	__is_prep_statement: true,
};
export const isPreparedStatement = (val: any): val is PreparedStatement =>
	val !== undefined &&
	val !== null &&
	!Array.isArray(val) &&
	typeof val === "object" &&
	Object.keys(val).length === 3 &&
	typeof val.statement === "string" &&
	val.statement !== "" &&
	val.__is_prep_statement === true &&
	Array.isArray(val.values) &&
	(val.values.length === 0 || val.values.every((v: any) => isSqlValues(v)));


export class SqlColumn {
	constructor(public column: string) {}
}
export class SqlExp {
	constructor(public expression: string) {}
}

export interface SqlExpressionPreparedStatement {
	statement: string;
	values: Array<SqlValues>;
	__is_prep_statement: boolean;
}

export const isSqlExpressionPreparedStatement = (
	val: any
): val is SqlExpressionPreparedStatement =>
	val !== null &&
	typeof val === 'object' &&
	typeof val.statement === 'string' &&
	Array.isArray(val.values) &&
	val.values.every((v: any) => isSqlValues(v)) &&
	val.__is_prep_statement === true;
