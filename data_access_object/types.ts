import { PoolConnection } from 'mysql2';
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

	/**
	 * @description Special group, will group repeated rows caused by multiple joins
	 *
	 */
	groupData?: GroupDataOptions;
}

interface GroupDataOptions {
	by: string;
	columnGroups: ColumnGroups;
}

export const isGroupDataOptions = (val: any): val is GroupDataOptions =>
	val !== undefined &&
	val !== null &&
	!Array.isArray(val) &&
	typeof val === 'object' &&
	Object.values(val).length === 2 &&
	typeof val.by === 'string' &&
	val.by.length !== 0 &&
	isColumnGroups(val.columnGroups);

export interface InsertOptionsDAO {
	/**
	 * @description If set to a number greater than 0 will insert multiple rows at once. Will increase the query execution for larger number of rows, but will disable inserted ids return.
	 * @default undefined
	 */
	rowsPerStatement?: number;
}

export const defaultDataAccessObjectOptions: DataAccessObjectOptions = {
	usePreparedStatements: true,
};
export interface DataAccessObjectOptions {
	/**
	 * @default true
	 * @description Will prepare and execute commands like `select`, `insert`, `delete` and `update` for a better performance and safety (Do not apply to `query` function). If for some reason you will execute too many different queries that may reach your `max_prepared_stmt_count` set this option to false.
	 * @info `mysql2` does the prepared statements management, it will not prepare the same statement twice on the same connection. See: https://www.npmjs.com/package/mysql2#using-prepared-statements
	 */
	usePreparedStatements?: boolean;
}

export type GetPoolConnectionCallback = (
	conn: PoolConnection
) => void | Promise<any>;
export interface GetPoolConnectionOptions {
	database?: string;
}

export interface DatabaseSelected {
	/**
	 * @description Database selected during the execution of this command
	 */
	database?: string;
}
