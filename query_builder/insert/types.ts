import { isSqlValues, SqlValues } from '../types';

export const defaultInsertOptions: InsertOptions = {
	ignore: true,
};

export interface InsertOptions {
	/**
	 * @description Will be INSERT IGNORE INTO if set to true
	 * @default false
	 */
	ignore?: boolean;
}

export type InsertRows = Array<InsertRow> | InsertRow;

export const isInsertRows = (val: any): val is InsertRows =>
	val !== undefined &&
	val !== null &&
	typeof val === 'object' &&
	((!Array.isArray(val) &&
		Object.values(val).length !== 0 &&
		Object.values(val)
			.map(isSqlValues)
			.every((v: boolean) => v === true)) ||
		(Array.isArray(val) &&
			val.length !== 0 &&
			val.map(isInsertRows).every((v: boolean) => v === true)));

interface InsertRow {
	[key: string]: SqlValues | undefined;
}
