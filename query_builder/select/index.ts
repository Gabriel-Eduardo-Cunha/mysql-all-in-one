import { escapeNames, extractTableAlias, putBrackets } from '../utils';
import join from './join';
import columns from './columns';
import where from './conditionals/where';
import having from './conditionals/having';
import {
	defaultSelectOptions,
	SelectOptions,
	SelectTable,
	TableObjectReturn,
} from './types';
import { group } from './group';
import { order } from './order';
import {
	generateQueryFromPreparedStatement,
	PreparedStatement,
	SqlValues,
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
			const [key, val] = Object.entries(table)[0];
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
	} = { ...defaultSelectOptions, ...opts };

	const prepStatementValues = [];

	const { table, alias, values } = tableObject(from);
	prepStatementValues.push(...values);
	const aliasToPrepend = prependAlias === true ? alias : undefined;
	//Columns
	const sColumns =
		columns(columnsOpts, aliasToPrepend) ||
		(alias && prependAlias === true ? `${alias}.*` : '*');
	//From
	const sFrom = table
		? ` FROM ${table}${alias && alias !== table ? ` ${alias}` : ''}`
		: '';
	//Join
	const {
		joinPreparedStatement: { statement: sJoin, values: sJoinValues },
		columnsPreparedStatement: jColumns,
	} = join(joinOpts, aliasToPrepend);
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
	const prepStatement: PreparedStatement = {
		statement: `SELECT ${sColumns}${jColumns}${sFrom}${sJoin}${sWhere}${sGroup}${sHaving}${sOrder}${sLimit}${sOffset}`,
		values: prepStatementValues,
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

console.log(
	selectStatement({
		from: 'client',
		join: {
			table: 'gay',
			on: { id: 2 },
		},
		where: { id: 5 },
		returnPreparedStatement: true,
	})
);
