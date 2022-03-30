import { SelectColumns } from './columns/types';
import { ConditionOptions } from './conditionals/types';
import { SelectGroupOrder } from './group_ordering/type';
import { SelectJoin } from './join/types';

export interface ExpressionObject {
	expression: string;
}
export const isExpressionObject = (val: any): val is ExpressionObject => {
	return typeof val?.expression === 'string';
};

export interface SelectOptions {
	/**
	 * Default true. Defines if alias should be prepended.
	 */
	prependAlias?: boolean;
	/**
	 * Columns to select, if undefined will do ${from}
	 */
	columns?: SelectColumns;
	join?: SelectJoin;
	where?: ConditionOptions;
	group?: SelectGroupOrder;
	having?: ConditionOptions;
	order?: SelectGroupOrder;
	limit?: number;
	offset?: number;
}
