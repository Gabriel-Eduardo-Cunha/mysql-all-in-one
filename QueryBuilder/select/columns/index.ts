import {
	escapeNames,
	putBackticks,
	putBrackets,
	safeApplyAlias,
} from '../../utils';
import { isColumnAliasObject, SelectColumns } from './types';

const create_columns = (
	columns?: SelectColumns,
	alias?: string
): string | undefined => {
	if (typeof columns === 'string') {
		if (columns === '*') {
			return columns;
		}
		if (columns.endsWith('.*')) {
			return `${escapeNames(columns.substring(0, columns.length - 2))}.*`;
		}
		return safeApplyAlias(escapeNames(columns), alias);
	}
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
				if (key === '__expression' && isColumnAliasObject(val)) {
					return Object.entries(val)
						.map(
							([expressionAlias, expression]) =>
								`${putBrackets(expression)} AS ${putBackticks(
									expressionAlias
								)}`
						)
						.join(',');
				}
				if (typeof val !== 'string') {
					throw `Incorrect columns object. Type error: expected string received "${typeof val}" value: ${val}`;
				}
				const columnAlias = putBackticks(key);
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
