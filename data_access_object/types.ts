import { PoolConnection } from 'mysql2';
import { InsertRows } from '../query_builder/insert/types';
import { isArrayOfStrings, SqlValues } from '../query_builder/types';

interface RenamedColumns {
	[new_name: string]: string;
}
export const isRenamedColumns = (val: any): val is RenamedColumns =>
	val !== undefined &&
	val !== null &&
	typeof val === 'object' &&
	!Array.isArray(val) &&
	isArrayOfStrings(Object.values(val));

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
	 * @description Groups repeated rows caused by multiple joins (That is totaly different from SQL GROUP BY, it will group data after the rows are returned from server). When dealing with multiple joins, sometimes your rows may be repeated, forcing you to group the data (if you group using SQL GROUP BY, some information may be lost. To avoid losing data you need to group rows after they are returned). That option will create arrays groups of your joined data.
	 *
	 * @example
	 * ({ groupData: {
	 * by: 'id',
	 * columnGroups: {
	 * foos: ['fooId', 'fooName'] // Arrays don't allow column renaming
	 * bars: {id: 'barId', name: 'barName'} // Objects keys is the new column name. Value is the old column name, returned from the query.
	 * }
	 * }
	 * })
	 * // Repeated data pattern caused by multiple joins (in this case on table foo and table bar)
	 * const inputExample = [
	 * {id: 1, fooId: 3, fooName: "John", barId: 1, barName: "Anne"},
	 * {id: 1, fooId: 4, fooName: "Robert", barId: 1, barName: "Anne"},
	 * {id: 1, fooId: 3, fooName: "John", barId: 2, barName: "Clair"},
	 * {id: 1, fooId: 4, fooName: "Robert", barId: 2, barName: "Clair"},
	 * {id: 2, fooId: 1, fooName: "Honey", barId: 3, barName: "Bee"},
	 * {id: 2, fooId: 2, fooName: "Comb", barId: 3, barName: "Bee"},
	 * ]
	 * const outputExample = [
	 * {
	 * 	id: 1,
	 * 	foos: [{fooId: 3, fooName: "John"}, {fooId: 4, fooName: "Robert"}],
	 * 	bars: [{id: 1, name: "Anne"}, {id:2, name: "Clair"}],
	 * },
	 * {
	 * id:2,
	 * foos: [{fooId: 1, fooName: "Honey"}, {fooId: 2, fooName: "Comb"}],
	 * bars: [id: 3, name: "Bee"]
	 * }
	 * ]
	 */
	groupData?: GroupDataOptions;
}

interface GroupDataOptions {
	/**
	 * @description Column that will be used to confirm row indentity (usually the primary key like an `id`)
	 * @example by: 'id'
	 */
	by: string;
	/**
	 * @description Column groups that will be formed on each result row.
	 * @example columnGroups: {
	 * foos: ['fooId', 'fooName'] // Arrays don't allow column renaming
	 * bars: {id: 'barId', name: 'barName'} // Objects keys is the new column name and the value is the column name returned from the query.
	 * }
	 */
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
	 * @description Inserts multiple rows at once if set to a number greater than 0. Increases performance, but disables inserted ids return.
	 * @default null
	 */
	rowsPerStatement?: number;
}

export const defaultDataAccessObjectOptions: DataAccessObjectOptions = {
	usePreparedStatements: true,
};
export interface DataAccessObjectOptions {
	/**
	 * @description Prepare and execute commands like `select`, `insert`, `delete` and `update` for a better performance and security (Do not apply to queries executed using `query` function). If, for some reason, you will need to execute a lot of different queries, causing it to reach server `max_prepared_stmt_count`, just set this option to false.
	 * @info npm `mysql2` does the prepared statements management, it will not prepare the same statement twice for the same connection. See: https://www.npmjs.com/package/mysql2#using-prepared-statements
	 * @default true
	 */
	usePreparedStatements?: boolean;
}

export type GetPoolConnectionCallback = (
	conn: PoolConnection
) => void | Promise<any>;
export const defaultGetPoolConnectionOptions: GetPoolConnectionOptions = {
	multipleStatements: false,
};
export interface GetPoolConnectionOptions {
	database?: string;
	multipleStatements?: boolean;
}

export interface DatabaseSelected {
	/**
	 * @description Database selected during the execution of this command
	 */
	database?: string;
}

export const defaultUpsertOptions: UpsertOptions = {
	primaryKey: 'id',
};
export interface UpsertOptions {
	/**
	 * @description Primary Key. If PK is defined (PK !== undefined) in the UpsertRow object an Update is executed, an Insert otherwise.
	 * @default "id"
	 */
	primaryKey?: string;
}

export type UpsertRow = InsertRows;
