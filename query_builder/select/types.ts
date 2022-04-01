import { SelectColumns } from './columns/types';
import { ConditionOptions } from './conditionals/types';
import { SelectGroup } from './group/type';
import { SelectOrder } from './order/type';
import { SelectJoin } from './join/types';

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

export interface SelectOptions {
	from?: SelectTable;
	/**
	 * Default true. Defines if alias should be automaticaly prepended.
	 */
	prependAlias?: boolean;
	/**
	 * Columns to select, if undefined will do ${from}
	 */
	columns?: SelectColumns;
	join?: SelectJoin;
	where?: ConditionOptions;
	group?: SelectGroup;
	having?: ConditionOptions;
	order?: SelectOrder;
	limit?: number;
	offset?: number;
}
