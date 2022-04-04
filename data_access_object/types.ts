import { isArrayOfStrings, SqlValues } from '../query_builder/types';

/**
 * @description Key is the new column inside the array group and the value is the actual column name returned from query.
 * @example {id: 'userId'}
 */
interface RenamedColumns {
	[new_name: string]: string;
}
export const isRenamedColumns = (val: any): val is RenamedColumns =>
	val !== undefined &&
	val !== null &&
	typeof val === 'object' &&
	!Array.isArray(val) &&
	isArrayOfStrings(Object.values(val));

/**
 * @description Key is the group name and the value is either an Array of column names or an object renaming the columns.
 * @example {users: {id: 'userId', name: 'userName'}}
 * >>> users: [{id: 1, name: 'Foo'}, {id: 2, name: 'Bar'}]
 */
export interface ColumnGroups {
	[group_name: string]: Array<string> | RenamedColumns;
}
export const isColumnGroups = (val: any): val is ColumnGroups =>
	val !== undefined &&
	val !== null &&
	typeof val === 'object' &&
	!Array.isArray(val) &&
	Object.values(val).every((v) => isRenamedColumns(v) || isArrayOfStrings(v));

export interface RowDataPacket {
	[key: string]: SqlValues | DataPacket;
}

export type DataPacket = Array<RowDataPacket>;

export const defaultDataSelectOptions: DataSelectOptions = {
	returnMode: 'normal',
};
export interface DataSelectOptions {
	/**
	 * @description The return mode decides what is returned:
	 * @opt 'normal' will return an Array of Objects containing the columns and values;
	 * @opt 'firstRow' will return the Object of the first row;
	 * @opt 'firstValue' will return the value of the first row and first collumn;
	 * @opt 'firstColumn' will return an Array of values, each value being the first collumn value of that row;
	 * @opt 'specific' this mode needs to be used with either specificRow or specificColumn key, it will return an specific row number or specific column array of values.
	 * @default 'normal'
	 */
	returnMode?:
		| 'normal'
		| 'firstRow'
		| 'firstValue'
		| 'firstColumn'
		| 'specific';
	/**
	 * @description If used with returnMode 'specific' will return a specific row number (starting from 0)
	 * @example specificRow: 3 //Will return the fourth row of the array
	 */
	specificRow?: number;
	/**
	 * @description If used with returnMode 'specific' will return an array with specific column values.
	 * @example specificColumn: 'name' //Will return array of values of the column called 'name'
	 */
	specificColumn?: string;
}
