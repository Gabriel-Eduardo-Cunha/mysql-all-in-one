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
					if (typeof val === 'string') return val;
					if (Array.isArray(val)) return val.join(',');
					return undefined;
				}
				if (val !== 'asc' && val !== 'desc') return undefined;
				return `${safeApplyAlias(escapeNames(key), alias)} ${val}`;
			})
			.filter((v) => v !== undefined)
			.join(',');
	}
};

export const order = (value: SelectOrder, alias?: string): string => {
	const orderResult = orderBy(value, alias);
	return orderResult ? ` ORDER BY ${orderResult}` : '';
};
