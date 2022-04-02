import { isArrayOfStrings } from '../types';
import { escVal, putBackticks } from '../utils';
import {
	InsertOptions,
	InsertRows,
	defaultInsertOptions,
	isInsertRows,
	InsertRow,
} from './types';

const buildRow = (row: InsertRow, keys: Array<string>): string => {
	return `(${keys
		.map((key) => row[key])
		.map((v) => escVal(v))
		.join(',')})`;
};

const buildInsertRows = (rows: InsertRows, columns?: Array<string>): string => {
	if (isInsertRows(rows)) {
		const keys = isArrayOfStrings(columns)
			? columns
			: Array.isArray(rows)
			? Object.keys(rows[0])
			: Object.keys(rows);
		return Array.isArray(rows)
			? rows.map((row) => buildRow(row, keys)).join(',')
			: buildRow(rows, keys);
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

const insert = (table: string, rows: InsertRows, opts?: InsertOptions) => {
	const { ignore, columns } = { ...defaultInsertOptions, ...opts };

	return `INSERT ${ignore === true ? 'IGNORE ' : ''}INTO ${putBackticks(
		table
	)} ${buildColumns(rows, columns)} VALUES ${buildInsertRows(
		rows,
		columns
	)};`;
};

export default insert;
