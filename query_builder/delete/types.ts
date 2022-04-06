export const defaultDeleteOptions: DeleteOptions = {
	ignore: false,
	quick: false,
	returnPreparedStatement: false,
};
export interface DeleteOptions {
	/**
	 * @description Will add IGNORE modifier.
	 * @default false
	 */
	ignore?: boolean;
	/**
	 * @description Will add QUICK modifier.
	 * @default false
	 */
	quick?: boolean;
	/**
	 * @description If true will return a PreparedStament object
	 * @default false
	 */
	returnPreparedStatement?: boolean;
}
