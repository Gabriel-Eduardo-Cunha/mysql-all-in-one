import { isSqlValues, SqlValues } from '../types';

export const defaultInsertOptions: InsertOptions = {
	ignore: false,
};

export interface InsertOptions {
	/**
	 * @description Will add IGNORE modifier.
	 * @default false
	 */
	ignore?: boolean;
	/**
	 * @description Will intert only the columns specified on this array. If no value is informed will use the keys of first InsertRow object as columns to insert.
	 */
	columns?: Array<string>;
}

export type InsertRows = Array<InsertRow> | InsertRow;

export const isInsertRows = (val: any): val is InsertRows =>
	val !== undefined &&
	val !== null &&
	typeof val === 'object' &&
	((!Array.isArray(val) &&
		Object.values(val).length !== 0 &&
		Object.values(val)
			.map((v) => v === undefined || isSqlValues(v))
			.every((v: boolean) => v === true)) ||
		(Array.isArray(val) &&
			val.length !== 0 &&
			val.map(isInsertRows).every((v: boolean) => v === true)));

export interface InsertRow {
	[key: string]: SqlValues | undefined;
}
