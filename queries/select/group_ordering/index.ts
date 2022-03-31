import { escapeNames, safeApplyAlias } from '../../utils';
import { isExpressionObject } from '../types';
import { SelectGroupOrder } from './type';

const groupOrdering = (
	value: SelectGroupOrder,
	defaultAlias?: string
): string | undefined => {
	if (Array.isArray(value) && value !== null && value !== undefined)
		return value
			.map((val) => groupOrdering(val, defaultAlias))
			.filter((v) => !!v)
			.join(',');
	if (typeof value === 'string')
		return safeApplyAlias(escapeNames(value), defaultAlias);
	if (isExpressionObject(value)) return value.__expression;
	return undefined;
};

export const group = (
	value: SelectGroupOrder,
	defaultAlias?: string
): string => {
	const groupResult = groupOrdering(value, defaultAlias);
	return groupResult ? ` GROUP BY ${groupResult}` : '';
};
export const order = (
	value: SelectGroupOrder,
	defaultAlias?: string
): string => {
	const orderResult = groupOrdering(value, defaultAlias);
	return orderResult ? ` ORDER BY ${orderResult}` : '';
};
