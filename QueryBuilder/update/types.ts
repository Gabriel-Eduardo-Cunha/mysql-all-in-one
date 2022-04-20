import { SelectOrder } from '../select/order/type';
import { isSqlValues, SqlValues } from '../types';

export const isUpdateValues = (val: any): val is UpdateValues =>
	val !== undefined &&
	val !== null &&
	!Array.isArray(val) &&
	typeof val === 'object' &&
	Object.values(val).every((v) => isSqlValues(v) || v === undefined);

export interface UpdateValues {
	[key: string]: SqlValues;
}

export const defaultUpdateOptions: UpdateOptions = {
	ignore: false,
	returnPreparedStatement: false,
};

export interface UpdateOptions {
	/**
	 * @description Adds IGNORE modifier if true
	 * @default false
	 */
	ignore?: boolean;
	/**
	 * @description Adds ORDER BY modifier if true
	 */
	order?: SelectOrder;
	/**
	 * @description Adds LIMIT modifier if true
	 */
	limit?: number;

	/**
	 * @description Returns a PreparedStament object if true
	 * @default false
	 * @example ({
	 * statement: UPDATE `table` SET name = ? WHERE id = ? OR name LIKE ?",
	 * values: ["Anne", 3, "John"]
	 * })
	 */
	returnPreparedStatement?: boolean;
}
