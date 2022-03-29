import { escVal, escapeNames, putBrackets, extractTableAlias } from '../utils';
import join from './join';
import columns from './columns';
import where from './conditionals/where';
import having from './conditionals/having';
import { SelectOptions } from './types';

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
		order,
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
	const [sJoin, jColumns] = join(joinOpts);
	//Where
	const sWhere = where(whereOpts, prependAlias ? alias : undefined);
	//Group
	const sGroup = '';
	//Having
	const sHaving = having(havingOpts);
	//Order
	const sOrder = '';
	//Limit
	const sLimit = limit ? ` LIMIT ${limit}` : '';
	//Offset
	const sOffset = offset ? ` OFFSET ${offset}` : '';

	return `SELECT ${sColumns}${jColumns}${sFrom}${sJoin}${sWhere}${sGroup}${sHaving}${sOrder}${sLimit}${sOffset};`;
};

export default select;
