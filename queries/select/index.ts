import { escapeNames, extractTableAlias } from '../utils';
import join from './join';
import columns from './columns';
import where from './conditionals/where';
import having from './conditionals/having';
import { SelectOptions } from './types';
import { group, order } from './group_ordering';

const defaultSelectOptions: SelectOptions = {
	prependAlias: true,
};

const select = (from: string, opts?: SelectOptions): string => {
	const tableRef = escapeNames(from);
	const [table, alias] = extractTableAlias(tableRef);
	const {
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

	//Columns
	const sColumns =
		columns(columnsOpts, prependAlias === true ? alias : undefined) ||
		`${alias}.*`;
	//From
	const sFrom = from ? ` FROM ${tableRef}` : '';
	//Join
	const [sJoin, jColumns] = join(joinOpts, alias);
	//Where
	const sWhere = where(whereOpts, prependAlias ? alias : undefined);
	//Group
	const sGroup = group(groupOpts, alias);
	//Having
	const sHaving = having(havingOpts);
	//Order
	const sOrder = order(orderOpts, alias);
	//Limit
	const sLimit = limit ? ` LIMIT ${limit}` : '';
	//Offset
	const sOffset = offset ? ` OFFSET ${offset}` : '';

	return `SELECT ${sColumns}${jColumns}${sFrom}${sJoin}${sWhere}${sGroup}${sHaving}${sOrder}${sLimit}${sOffset};`;
};

export default select;
