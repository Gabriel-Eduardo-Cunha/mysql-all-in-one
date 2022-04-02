import { escVal } from './utils';

export type SqlValues = string | Date | null | boolean | number | undefined;

export interface PreparedStatement {
	statement: string;
	values: Array<SqlValues>;
}

export const generateQueryFromPreparedStatement = (
	preparedStatement: PreparedStatement
): string => {
	const { statement, values } = preparedStatement;
	if (typeof statement !== 'string') return '';
	if (
		values !== undefined &&
		values !== null &&
		Array.isArray(values) &&
		values.length !== 0 &&
		values.every((v) => isSqlValues(v) || undefined)
	)
		return statement;

	const pieces = statement.split('?');
	const firstPiece = pieces.pop();
	return (
		pieces.reduce(
			(acc, cur, i) => `${acc}${escVal(values[i])}${cur}`,
			firstPiece
		) || ''
	);
};

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
