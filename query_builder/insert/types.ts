const obj: InsertOptions = {
	ignore: true,
};

export interface InsertOptions {
	/**
	 * @description Will be INSERT IGNORE INTO if set to true
	 * @default false
	 */
	ignore?: boolean;
}

type sqlValues = String | Date | null | boolean | number;

export type InsertRows = Array<InsertRow> | InsertRow;

interface InsertRow {
	[key: string]: sqlValues | undefined;
}
