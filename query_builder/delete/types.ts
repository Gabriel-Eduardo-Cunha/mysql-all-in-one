export const defaultDeleteOptions = {
	ignore: false,
	quick: false,
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
}
