import { SelectOrder } from '../select/order/type';

export const defaultDeleteOptions: DeleteOptions = {
	ignore: false,
	quick: false,
	returnPreparedStatement: false,
};
export interface DeleteOptions {
	/**
	 * @description Adds IGNORE modifier if true.
	 * @default false
	 */
	ignore?: boolean;
	/**
	 * @description Adds QUICK modifier if true.
	 * @default false
	 */
	quick?: boolean;
	/**
	 * @description Adds LIMIT modifier corresponding to the number.
	 * @default null
	 */
	limit?: number;
	/**
	 * @description Adds ORDER BY modifier if true
	 */
	order?: SelectOrder;
	/**
	 * @description Returns a PreparedStament object if true
	 * @default false
	 * @example ({
	 * statement: DELETE FROM `table` WHERE id = ? OR name LIKE ?",
	 * values: [3, "John"]
	 * })
	 */
	returnPreparedStatement?: boolean;
}
