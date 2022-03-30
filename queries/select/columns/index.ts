import { isExpressionObject } from '../types';
import { escapeNames, putBackticks, safeApplyAlias } from '../../utils';
import { isColumnAliasObject, SelectColumns } from './types';

const create_columns = (
	columns?: SelectColumns,
	alias?: string
): string | undefined => {
	if (typeof columns === 'string') return safeApplyAlias(
		escapeNames(columns as string),
		alias
	);
	if (Array.isArray(columns)) {
		return columns
			.map((c) => create_columns(c, alias))
			.filter((v) => !!v)
			.join(',');
	}
	if (
		typeof columns === 'object' &&
		columns !== null &&
		columns !== undefined
	) {
		return Object.entries(columns)
			.filter(([_, val]) => val !== undefined)
			.map(([key, val]) => {
				const columnAlias = putBackticks(key);
				if (isColumnAliasObject(val))
					return `${val.__expression} AS ${columnAlias}`;
				const columnRef = safeApplyAlias(
					escapeNames(val as string),
					alias
				);
				if (val === key) return columnRef;
				return `${columnRef} AS ${columnAlias}`;
			})
			.join(',');
	}
};

export default create_columns;
