import { generateQueryFromPreparedStatement } from '../generate_query_from_prepared_statement';
import {
	isArrayOfStrings,
	isSqlExpressionPreparedStatement,
	PreparedStatement,
	SqlValues,
} from '../types';
import { placeAliasInSqlExpression, putBackticks, putBrackets } from '../utils';
import {
	InsertOptions,
	InsertRows,
	defaultInsertOptions,
	isInsertRows,
	InsertRow,
} from './types';

const buildRow = (
	keys: Array<string>,
	insertRow: InsertRow
): PreparedStatement => {
	const sqlValues: SqlValues[] = [];
	const insertValues = keys.reduce((acc, cur): InsertRow => {
		acc[cur] = insertRow[cur];
		return acc;
	}, {} as InsertRow);

	return {
		statement: `(${Object.values(insertValues)
			.map((v) => {
				if (isSqlExpressionPreparedStatement(v)) {
					v = placeAliasInSqlExpression(v, null);
					sqlValues.push(...v.values);
					return putBrackets(v.statement);
				}
				sqlValues.push(v as SqlValues);
				return "?";
			})
			.join(",")})`,
		values: sqlValues,
		__is_prep_statement: true,
	};
};

const buildInsertRows = (
	rows: InsertRows,
	columns?: Array<string>
): PreparedStatement => {
	if (isInsertRows(rows)) {
		const keys = isArrayOfStrings(columns)
			? columns
			: Array.isArray(rows)
			? Object.keys(rows[0])
			: Object.keys(rows);

		const prepStatement = Array.isArray(rows)
			? rows
					.map((insertRow) => buildRow(keys, insertRow))
					.reduce(
						(acc, cur) => {
							acc.statement.push(cur.statement);
							acc.values.push(...cur.values);
							return acc;
						},
						{ statement: [] as any, values: [] as SqlValues[] }
					)
			: buildRow(keys, rows);
		if (Array.isArray(prepStatement.statement))
			prepStatement.statement = prepStatement.statement.join(",");
		return {
			statement: prepStatement.statement as string,
			values: prepStatement.values,
			__is_prep_statement: true,
		};
	}
	throw `Invalid rows format for insert object, insert rows must be one or many objects with valid SQL values String | Date | null | boolean | number (undefined is also accepted, but ignored); Insert row object received: ${rows}`;
};

const buildColumns = (rows: InsertRows, columns?: Array<string>): string => {
	if (!isInsertRows(rows)) return "";
	return `(${(isArrayOfStrings(columns)
		? columns
		: Array.isArray(rows)
		? Object.keys(rows[0])
		: Object.keys(rows)
	)
		.map(putBackticks)
		.join(",")})`;
};

/**
 *
 * @param table Table to insert
 * @param rows An array of Objects or a single object (keys are the column names)
 * @param opts Extra insert options like `ignore`
 * @returns INSERT INTO SQL Query
 * @example insert('table', [{id:1, name: "John"}, {id:2, name: "Anne"}], {ignore:true});
 * >>> "INSERT IGNORE INTO `table` (`id`,`name`) VALUES (1,'John'),(2,'Anne');"
 */
const insert = (
	table: string,
	rows: InsertRows,
	opts?: InsertOptions
): PreparedStatement | string => {
	const { ignore, columns, returnPreparedStatement } = {
		...defaultInsertOptions,
		...opts,
	};
	const insertRowsPrepStatement = buildInsertRows(rows, columns);
	const values = insertRowsPrepStatement.values;
	const statement = `INSERT ${
		ignore === true ? "IGNORE " : ""
	}INTO ${putBackticks(table)} ${buildColumns(rows, columns)} VALUES ${
		insertRowsPrepStatement.statement
	};`;
	const prepStatement: PreparedStatement = {
		statement,
		values,
		__is_prep_statement: true,
	};
	return returnPreparedStatement === true
		? prepStatement
		: generateQueryFromPreparedStatement(prepStatement);
};

export default insert;
