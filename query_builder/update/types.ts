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
	 * @description Will add IGNORE modifier.
	 * @default false
	 */
	ignore?: boolean;
	/**
	 * @description Will add ORDER BY modifier
	 */
	order?: SelectOrder;
	/**
	 * @description Will add LIMIT modifier
	 */
	limit?: number;

	/**
	 * @description If true will return a PreparedStament object
	 * @default false
	 */
	returnPreparedStatement?: boolean;
}
