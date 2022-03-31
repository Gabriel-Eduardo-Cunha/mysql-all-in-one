import { escapeNames } from '../../utils';
import { SelectOrder } from './type';

const orderBy = (value: SelectOrder): string | undefined => {
	if (typeof value === 'object') {
		return Object.entries(value)
			.map(([key, val]) => {
				if (key === '__expression') {
					if (typeof val === 'string') return val;
					if (Array.isArray(val)) return val.join(',');
					return undefined;
				}
				if (val !== 'asc' && val !== 'desc') return undefined;
				return `${escapeNames(key)} ${val}`;
			})
			.filter((v) => v !== undefined)
			.join(',');
	}
};

export const order = (value: SelectOrder): string => {
	const orderResult = orderBy(value);
	return orderResult ? ` ORDER BY ${orderResult}` : '';
};
