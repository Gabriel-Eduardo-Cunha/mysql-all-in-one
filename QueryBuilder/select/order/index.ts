import {
	generateQueryFromPreparedStatement,
	isSqlExpressionPreparedStatement,
} from '../../types';
import { escapeNames, safeApplyAlias } from '../../utils';
import { isSelectOrder, SelectOrder } from './type';

const orderBy = (value: SelectOrder, alias?: string): string | undefined => {
	if (typeof value === 'object') {
		return Object.entries(value)
			.map(([key, val]) => {
				if (key === '__no_alias' && isSelectOrder(val)) {
					return orderBy(val);
				}
				if (key === '__expression') {
					return orderExpression(val, alias);
				}
				if (val !== 'asc' && val !== 'desc') return undefined;
				return `${safeApplyAlias(escapeNames(key), alias)} ${val}`;
			})
			.filter((v) => v !== undefined)
			.join(',');
	}
};

const orderExpression = (val: any, alias?:string): string | undefined => {
	if (Array.isArray(val)) return val.map(v => orderExpression(v, alias)).join(',');
	if (isSqlExpressionPreparedStatement(val)) {
		return generateQueryFromPreparedStatement(val)
			.split('__SQL__EXPRESSION__ALIAS__.')
			.join(typeof alias === 'string' && alias.length !== 0 ? `${alias}.` : '');
	}
	if (typeof val === 'string') {
		return val;
	}
};

export const order = (value: SelectOrder, alias?: string): string => {
	const orderResult = orderBy(value, alias);
	return orderResult ? ` ORDER BY ${orderResult}` : '';
};
