import { escapeNames, extractTableAlias, putBrackets } from '../utils';
import join from './join';
import columns from './columns';
import where from './conditionals/where';
import having from './conditionals/having';
import {
	defaultSelectOptions,
	isSelectOptions,
	SelectOptions,
	SelectTable,
	TableObjectReturn,
} from './types';
import { group } from './group';
import { order } from './order';
import {
	generateQueryFromPreparedStatement,
	PreparedStatement,
} from '../types';

export const tableObject = (
	table: SelectTable | undefined
): TableObjectReturn => {
	if (typeof table === 'string') {
		const [extractedTable, alias] = extractTableAlias(escapeNames(table));
		return {
			table: extractedTable,
			alias,
			values: [],
		};
	}
	if (typeof table === 'object') {
		const entries = Object.entries(table);
		if (entries.length !== 0) {
			const [key, val] = entries[0];
			if (typeof val === 'string')
				return {
					table: putBrackets(val),
					alias: escapeNames(key),
					values: [],
				};
			if (typeof val === 'object') {
				const { statement, values } = select(val);
				return {
					table: putBrackets(statement),
					alias: escapeNames(key),
					values,
				};
			}
		}
	}
	return { table: '', alias: '', values: [] };
};

/**
 *
 * @param opts Select Object structure
 * @returns SELECT SQL Query
 * @example select({})
 */
const select = (opts: SelectOptions): PreparedStatement => {
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
		union,
	} = { ...defaultSelectOptions, ...opts };

	const prepStatementValues = [];

	const { table, alias, values } = tableObject(from);
	prepStatementValues.push(...values);
	const aliasToPrepend = prependAlias === true ? alias : undefined;
	//Columns
	const { statement: sColumns, values: sColumnValues } = columns(
		columnsOpts,
		aliasToPrepend
	);
	prepStatementValues.push(...sColumnValues);

	//From
	const sFrom = table
		? ` FROM ${table}${alias && alias !== table ? ` ${alias}` : ''}`
		: '';
	//Join
	const {
		joinPreparedStatement: { statement: sJoin, values: sJoinValues },
		columnsPreparedStatement: {
			statement: jColumns,
			values: jColumnsValues,
		},
	} = join(joinOpts, aliasToPrepend);
	prepStatementValues.push(...jColumnsValues);
	prepStatementValues.push(...sJoinValues);
	//Where
	const { statement: sWhere, values: sWhereValues } = where(
		whereOpts,
		aliasToPrepend
	);
	prepStatementValues.push(...sWhereValues);
	//Group
	const sGroup = group(groupOpts, aliasToPrepend);
	//Having
	const { statement: sHaving, values: sHavingValues } = having(havingOpts);
	prepStatementValues.push(...sHavingValues);
	//Order
	const sOrder = order(orderOpts, aliasToPrepend);
	//Limit
	const sLimit = limit ? ` LIMIT ${limit}` : '';
	//Offset
	const sOffset = offset ? ` OFFSET ${offset}` : '';
	let sUnion = '';
	if (isSelectOptions(union)) {
		const { statement: unionStatement, values: unionValues } =
			select(union);
		prepStatementValues.push(...unionValues);
		sUnion = ` UNION ${unionStatement}`;
	}
	const prepStatement = {
		statement: `SELECT ${sColumns}${
			jColumns ? `,${jColumns}` : ""
		}${sFrom}${sJoin}${sWhere}${sGroup}${sHaving}${sOrder}${sLimit}${sOffset}${sUnion}`,
		values: prepStatementValues,
		__is_prep_statement: true,
	};
	return prepStatement;
};

const selectStatement = (opts: SelectOptions): PreparedStatement | string => {
	const prepStatement = select(opts);
	prepStatement.statement = `${prepStatement.statement};`;
	return opts.returnPreparedStatement === true
		? prepStatement
		: generateQueryFromPreparedStatement(prepStatement);
};

export default selectStatement;
