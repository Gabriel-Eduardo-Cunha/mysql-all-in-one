import { escapeNames } from '../../utils';
import { SelectGroup } from './type';

const groupBy = (value: SelectGroup): string | undefined => {
	if (Array.isArray(value) && value !== null && value !== undefined)
		return value
			.map(groupBy)
			.filter((v) => !!v)
			.join(',');
	if (typeof value === 'string') return escapeNames(value);
	if (typeof value === 'object' && value.__expression) {
		if (typeof value.__expression === 'string') return value.__expression;
		if (Array.isArray(value.__expression))
			return value.__expression.join(',');
	}
	return undefined;
};

export const group = (value: SelectGroup, defaultAlias?: string): string => {
	const groupResult = groupBy(value);
	return groupResult ? ` GROUP BY ${groupResult}` : '';
};
