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
	 * @description If true will return a PreparedStament object
	 * @default false
	 */
	returnPreparedStatement?: boolean;
}

export interface TableObjectReturn {
	table: string;
	alias: string;
	values: Array<SqlValues>;
}
