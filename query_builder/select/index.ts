import { escapeNames, extractTableAlias, putBrackets } from '../utils';
import join from './join';
import columns from './columns';
import where from './conditionals/where';
import having from './conditionals/having';
import { SelectOptions, SelectTable } from './types';
import { group } from './group';
import { order } from './order';

const defaultSelectOptions: SelectOptions = {
	prependAlias: true,
};

export const tableObject = (table: SelectTable): Array<string> => {
	if (typeof table === 'string') return extractTableAlias(escapeNames(table));
	if (typeof table === 'object') {
		const entries = Object.entries(table);
		if (entries.length !== 0) {
			const [key, val] = Object.entries(table)[0];
			if (typeof val === 'string')
				return [putBrackets(val), escapeNames(key)];
			if (typeof val === 'object')
				return [putBrackets(select(val)), escapeNames(key)];
		}
	}
	return ['', ''];
};

const select = (opts: SelectOptions): string => {
	const {
		from,
		columns: columnsOpts,
		join: joinOpts,
		where: whereOpts,
		group: groupOpts,
		having: havingOpts,
		order: orderOpts,
		limit,
		offset,
		prependAlias,
	} = { ...defaultSelectOptions, ...opts };
	const [table, alias] = from ? tableObject(from) : '';
	const aliasToPrepend = prependAlias === true ? alias : undefined;
	//Columns
	const sColumns =
		columns(columnsOpts, prependAlias === true ? alias : undefined) ||
		(alias && prependAlias === true ? `${alias}.*` : '*');
	//From
	const sFrom = table
		? ` FROM ${table}${alias && alias !== table ? ` ${alias}` : ''}`
		: '';
	//Join
	const [sJoin, jColumns] = join(joinOpts, aliasToPrepend);
	//Where
	const { statement: sWhere, values: sWhereValues } = where(
		whereOpts,
		aliasToPrepend
	);
	//Group
	const sGroup = group(groupOpts, aliasToPrepend);
	//Having
	const { statement: sHaving, values: sHavingValues } = having(havingOpts);
	//Order
	const sOrder = order(orderOpts, aliasToPrepend);
	//Limit
	const sLimit = limit ? ` LIMIT ${limit}` : '';
	//Offset
	const sOffset = offset ? ` OFFSET ${offset}` : '';

	return `SELECT ${sColumns}${jColumns}${sFrom}${sJoin}${sWhere}${sGroup}${sHaving}${sOrder}${sLimit}${sOffset}`;
};

export default (opts: SelectOptions) => `${select(opts)};`;
