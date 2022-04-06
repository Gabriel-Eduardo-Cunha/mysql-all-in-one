import {
	generateQueryFromPreparedStatement,
	isArrayOfStrings,
	PreparedStatement,
} from '../types';
import { putBackticks } from '../utils';
import {
	InsertOptions,
	InsertRows,
	defaultInsertOptions,
	isInsertRows,
	InsertRow,
} from './types';

const buildRow = (row: InsertRow, keys: Array<string>): string => {
	return `(${keys.map((_) => '?').join(',')})`;
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

		return {
			statement: Array.isArray(rows)
				? rows.map((row) => buildRow(row, keys)).join(',')
				: buildRow(rows, keys),
			values: Array.isArray(rows)
				? rows.map((row) => keys.map((key) => row[key])).flat()
				: keys.map((key) => rows[key]),
		};
	}
	throw `Invalid rows format for insert object, insert rows must be one or many objects with valid SQL values String | Date | null | boolean | number (undefined is also accepted, but ignored); Insert row object received: ${rows}`;
};

const buildColumns = (rows: InsertRows, columns?: Array<string>): string => {
	if (!isInsertRows(rows)) return '';
	return `(${(isArrayOfStrings(columns)
		? columns
		: Array.isArray(rows)
		? Object.keys(rows[0])
		: Object.keys(rows)
	)
		.map(putBackticks)
		.join(',')})`;
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
		ignore === true ? 'IGNORE ' : ''
	}INTO ${putBackticks(table)} ${buildColumns(rows, columns)} VALUES ${
		insertRowsPrepStatement.statement
	};`;
	const prepStatement = { statement, values };
	return returnPreparedStatement === true
		? prepStatement
		: generateQueryFromPreparedStatement(prepStatement);
};

export default insert;
