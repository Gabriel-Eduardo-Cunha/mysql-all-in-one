import { escVal } from './utils';

export type SqlValues = string | Date | null | boolean | number | undefined;

export interface PreparedStatement {
	statement: string;
	values: Array<SqlValues>;
}

export const isSqlValues = (val: any): val is SqlValues =>
	val === null ||
	val === undefined ||
	(['string', 'boolean', 'number', 'object'].includes(typeof val) &&
		!Array.isArray(val) &&
		(typeof val !== 'object' || val instanceof Date));

export const isArrayOfStrings = (val: any): val is Array<string> =>
	val !== undefined &&
	val !== null &&
	Array.isArray(val) &&
	val.every((v) => typeof v === 'string');

export const emptyPrepStatement: PreparedStatement = {
	statement: '',
	values: [],
};
export const isPreparedStatement = (val: any): val is PreparedStatement =>
	val !== undefined &&
	val !== null &&
	!Array.isArray(val) &&
	typeof val === 'object' &&
	Object.keys(val).length === 2 &&
	typeof val.statement === 'string' &&
	val.statement !== '' &&
	Array.isArray(val.values) &&
	(val.values.length === 0 || val.values.every((v: any) => isSqlValues(v)));

export const generateQueryFromPreparedStatement = (
	preparedStatement: PreparedStatement
): string => {
	const { statement, values } = preparedStatement;
	if (typeof statement !== 'string') return '';
	if (isPreparedStatement(statement)) return statement || '';

	const pieces = statement.split('?');
	const firstPiece = pieces.shift();
	return (
		pieces.reduce(
			(acc, cur, i) => `${acc}${escVal(values[i])}${cur}`,
			firstPiece
		) || ''
	);
};

export class SqlColumn {
	constructor(public column: string) {}
}

interface SqlExpressionPreparedStatement {
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
