import { escapeNames, safeApplyAlias } from '../../utils';
import { SelectGroup } from './type';

const groupBy = (value: SelectGroup, alias?: string): string | undefined => {
	if (Array.isArray(value) && value !== null && value !== undefined)
		return value
			.map((v) => groupBy(v, alias))
			.filter((v) => !!v)
			.join(',');

	if (typeof value === 'string')
		return safeApplyAlias(escapeNames(value), alias);
	if (typeof value === 'object' && value.__no_alias) {
		return groupBy(value.__no_alias);
	}
	if (typeof value === 'object' && value.__expression) {
		if (typeof value.__expression === 'string') return value.__expression;
		if (Array.isArray(value.__expression))
			return value.__expression.join(',');
	}
	return undefined;
};

export const group = (value: SelectGroup, defaultAlias?: string): string => {
	const groupResult = groupBy(value, defaultAlias);
	return groupResult ? ` GROUP BY ${groupResult}` : '';
};
