import { putBackticks, putBrackets } from '../utils';
import {
	InsertOptions,
	InsertRows,
	defaultInsertOptions,
	isInsertRows,
} from './types';

const buildInsertRows = (rows: InsertRows): string => {
	if (isInsertRows(rows)) {
	}
	throw `Invalid rows format for insert object, insert rows must be one or many objects with valid SQL values String | Date | null | boolean | number; Insert row object received: ${rows}`;
};

const buildColumns = (rows: InsertRows): string => {
	if (!isInsertRows(rows)) return '';
	return `(${(Array.isArray(rows) ? Object.keys(rows[0]) : Object.keys(rows))
		.map(putBackticks)
		.join(',')})`;
};

const insert = (table: string, rows: InsertRows, opts?: InsertOptions) => {
	const { ignore } = { ...defaultInsertOptions, ...opts };
	return `INSERT ${ignore && 'IGNORE '}INTO ${putBackticks(
		table
	)} ${buildColumns(rows)} VALUES ${buildInsertRows(rows)}`;
};

export default insert;
