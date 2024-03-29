import {
	isSqlExpressionPreparedStatement,
	isSqlValues,
	SqlValues,
} from '../types';

export const defaultInsertOptions: InsertOptions = {
	ignore: false,
	returnPreparedStatement: false,
};

export interface InsertOptions {
	/**
	 * @description Adds IGNORE modifier if true.
	 * @default false
	 */
	ignore?: boolean;
	/**
	 * @description Interts only the columns specified on this array. If no value is informed will use the keys of the first InsertRow object as columns to insert.
	 * @default null
	 */
	columns?: Array<string>;
	/**
	 * @description Returns a PreparedStament object if true
	 * @default false
	 * @example ({
	 * statement: "INSERT INTO `table` (id, name) VALUES (?,?)",
	 * values: [1, "John"]
	 * })
	 */
	returnPreparedStatement?: boolean;
}

export type InsertRows = Array<InsertRow> | InsertRow;

export const isInsertRow = (val: any): val is InsertRow =>
	val !== undefined &&
	val !== null &&
	typeof val === 'object' &&
	!Array.isArray(val) &&
	Object.values(val).length !== 0 &&
	Object.values(val).every(
		(v) =>
			v === undefined ||
			isSqlValues(v) ||
			isSqlExpressionPreparedStatement(v)
	);

export const isInsertRows = (val: any): val is InsertRows =>
	val !== undefined &&
	val !== null &&
	typeof val === 'object' &&
	(isInsertRow(val) ||
		(Array.isArray(val) && val.every((v) => isInsertRow(v))));

export interface InsertRow {
	[key: string]: SqlValues | undefined | Record<string, any>;
}
