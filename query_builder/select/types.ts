import { SelectColumns } from './columns/types';
import { ConditionOptions } from './conditionals/types';
import { SelectGroup } from './group/type';
import { SelectOrder } from './order/type';
import { SelectJoin } from './join/types';
import { SqlValues } from '../types';

export type SelectTable = string | ExpressionOrSelectObject;

interface ExpressionOrSelectObject {
	[key: string]: string | SelectOptions;
}

export interface ExpressionObject {
	__expression: string;
}
export const isExpressionObject = (val: any): val is ExpressionObject => {
	return typeof val?.__expression === 'string';
};
export const isSelectOptions = (val: any): val is SelectOptions =>
	val !== undefined &&
	val !== null &&
	!Array.isArray(val) &&
	typeof val === 'object' &&
	(val.columns !== undefined || val.from !== undefined);
export const defaultSelectOptions: SelectOptions = {
	prependAlias: true,
	returnPreparedStatement: false,
};
export interface SelectOptions {
	from?: SelectTable;
	/**
	 * @description If false will not prepend default table alias automaticaly.
	 * @default true
	 */
	prependAlias?: boolean;
	/**
	 * @description Columns
	 * @example ["a", "b"]
	 * @default `${alias}.*` where alias is the default table alias
	 */
	columns?: SelectColumns;
	join?: SelectJoin;
	/**
	 * @description Where condition, will use alias
	 */
	where?: ConditionOptions;
	group?: SelectGroup;
	having?: ConditionOptions;
	order?: SelectOrder;
	limit?: number;
	offset?: number;
	/**
	 * @description Returns a PreparedStament object if true
	 * @default false
	 * @example ({
	 * statement: "SELECT * FROM `table` WHERE id = ? AND name LIKE ?",
	 * values: [3, "John"]
	 * })
	 */
	returnPreparedStatement?: boolean;
	union?: SelectOptions;
}

export interface TableObjectReturn {
	table: string;
	alias: string;
	values: Array<SqlValues>;
}
