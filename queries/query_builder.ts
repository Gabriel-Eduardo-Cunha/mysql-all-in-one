import mysql from 'mysql2';

const escape = mysql.escape;

/**
 * Escapes a value into a valid mysql String representation
 */
export const escVal = escape;

/**
 * Tagged template literal function to escape all passed values
 * Example:
 * 	const name = 'Foo'
 * 	escStr\`name = ${name}\`
 * > name = 'Foo'
 */
export const escStr = (
	[firstStr, ...rest]: TemplateStringsArray,
	...values: Array<any>
): String =>
	rest.reduce((acc, cur, i) => `${acc}${escape(values[i])}${cur}`, firstStr);

const escapeNames = (key: String) =>
	key
		.trim()
		.replace(/ +/g, ' ')
		.replace(' as ', ' ')
		.replace(' AS ', ' ')
		.split(' ')
		.map((val) =>
			val
				.split('.')
				.map((v) => `\`${v}\``)
				.join('.')
		)
		.join(' ');

/**
 *
 * @param tableRef
 * @returns [table, alias]
 */
const extractTableAlias = (tableRef: string): Array<string> => {
	const split = tableRef.split(' ');
	if (split.length !== 2) return [tableRef, tableRef];
	return [split[0], split[1]];
};

interface ConditionOperatorInterface {
	[key: string]: OperatorOptionsType;
}
interface ConditionAndOrInterface {
	/**
	 * If TRUE will use OR between conditions, will use AND otherwise. Default FALSE
	 */
	__or?: Boolean;
}

type ConditionObject = ConditionOperatorInterface & ConditionAndOrInterface;

/**
 * If first value is equal to "__or" will use OR between conditions.
 */
interface ConditionOptionsArray {
	[index: number]: ConditionObject | String | Array<ConditionOptionsArray>;
}

interface OperatorOptionsObject {
	like?: string;
	notlike?: string;
	rlike?: string;
	notrlike?: string;
	between?: Array<any>;
	notbetween?: Array<any>;
	in?: Array<any>;
	notin?: Array<any>;
	'>'?: any;
	'<'?: any;
	'>='?: any;
	'<='?: any;
	'<>'?: any;
	'!='?: any;
	'='?: any;
}

type OperatorOptionsType =
	| OperatorOptionsObject
	| String
	| number
	| Date
	| null
	| undefined
	| boolean
	| Array<String | number | Date>;

type ConditionOptions = ConditionOptionsArray | ConditionObject;

const create_conditions = (value: ConditionOptions): String => {
	let isAnd = true;
	if (Array.isArray(value)) {
		if (value.length > 0 && value[0] === '__or') {
			value.shift();
			isAnd = false;
		}
		return `(${value
			.map(create_conditions)
			.join(isAnd ? ' AND ' : ' OR ')})`;
	}
	if (typeof value === 'string')
		return value.charAt(0) === '(' && value.charAt(value.length - 1) === ')'
			? value
			: `(${value})`;
	if (typeof value !== 'object') throw 'value must be String or Object type';
	const operation = (val: OperatorOptionsObject | any) => {
		if (val === undefined) return;
		if (Array.isArray(val)) return `IN (${val.map(escape).join(',')})`;
		if (typeof val === 'object' && val !== null) {
			const {
				like,
				notlike,
				rlike,
				notrlike,
				between,
				notbetween,
				in: inOperator,
				notin,
				'>': greaterThan,
				'<': smallerThan,
				'<>': different,
				'!=': notEqual,
				'>=': greatherOrEqual,
				'<=': smallerOrEqual,
				'=': equal,
			} = val;
			if (like !== undefined) return `LIKE ${escape(like)}`;
			if (notlike !== undefined) return `NOT LIKE ${escape(notlike)}`;
			if (rlike !== undefined) return `RLIKE ${escape(rlike)}`;
			if (notrlike !== undefined) return `NOT RLIKE ${escape(notrlike)}`;
			if (
				between !== undefined &&
				Array.isArray(between) &&
				between.length === 2
			)
				return `BETWEEN ${escape(between[0])} AND ${escape(
					between[1]
				)}`;
			if (
				notbetween !== undefined &&
				Array.isArray(notbetween) &&
				notbetween.length === 2
			)
				return `NOT BETWEEN ${escape(notbetween[0])} AND ${escape(
					notbetween[1]
				)}`;
			if (inOperator !== undefined && Array.isArray(inOperator))
				return `IN (${escape(inOperator)})`;
			if (notin !== undefined && Array.isArray(notin))
				return `NOT IN (${escape(notin)})`;
			if (greaterThan !== undefined) return `> ${escape(greaterThan)}`;
			if (smallerThan !== undefined) return `< ${escape(smallerThan)}`;
			if (different !== undefined) return `<> ${escape(different)}`;
			if (notEqual !== undefined) return `<> ${escape(notEqual)}`;
			if (greatherOrEqual !== undefined)
				return `>= ${escape(greatherOrEqual)}`;
			if (smallerOrEqual !== undefined)
				return `<= ${escape(smallerOrEqual)}`;
			if (equal !== undefined) return `= ${escape(equal)}`;
			return;
		}
		if (val === null || val === true || val === false)
			return `IS ${escape(val)}`;
		return `= ${escape(val)}`;
	};

	if ('__or' in value) {
		delete value['__or'];
		isAnd = false;
	}
	return `(${Object.entries(value)
		.map(([key, val]) => {
			const operationResult = operation(val);
			return val === undefined && operationResult === undefined
				? undefined
				: val !== null && // Condition bellow checks if is between and put brackets
				  !Array.isArray(val) &&
				  typeof val === 'object' &&
				  (val.between !== undefined || val.notbetween !== undefined)
				? `(${escapeNames(key)} ${operationResult})`
				: `${escapeNames(key)} ${operationResult}`;
		})
		.filter((v) => v !== undefined)
		.join(isAnd ? ' AND ' : ' OR ')})`;
};

export const where = (opts: ConditionOptions): string => {
	return `WHERE ${create_conditions(opts)}`;
};
const having = (opts: ConditionOptions): string => {
	return `HAVING ${create_conditions(opts)}`;
};

interface JoinOptions {}

interface GroupObject {}

interface ExpressionObject {
	expression: string;
}

const isExpressionObject = (val: any): val is ExpressionObject => {
	return typeof val?.expression === 'string';
};

interface SelectObject {
	/**
	 * Key is the alias. If value type is String will escape the names with \`\`. Name escaping will be ignored if passing an object with expression key containing the query expression.
	 */
	[key: string]: string | ExpressionObject;
}

type SelectColumns = string | Array<string | SelectObject> | SelectObject;

interface SelectOptions {
	/**
	 * Default true. Defines if alias should be prepended.
	 */
	prependAlias?: boolean;
	/**
	 * Columns to select, if undefined will do ${from}
	 */
	columns?: SelectColumns;
	join?: JoinOptions;
	where?: ConditionOptions;
	group?: string | Array<string | GroupObject> | GroupObject;
	having?: ConditionOptions;
	order?: string | Array<string>;
	limit?: number;
	offset?: number;
}

const defaultSelectOptions: SelectOptions = {
	prependAlias: true,
};

export const select = (from: string, opts?: SelectOptions): string => {
	const tableRef = escapeNames(from);
	const [table, alias] = extractTableAlias(tableRef);
	const {
		columns,
		join,
		where,
		group,
		having,
		order,
		limit,
		offset,
		prependAlias,
	} = { ...defaultSelectOptions, ...opts };
	const create_columns = (columns: SelectColumns): string | undefined => {
		if (typeof columns === 'string') return columns;
		if (Array.isArray(columns)) {
			return columns
				.map(create_columns)
				.filter((v) => !!v)
				.join(',');
		}
		if (
			typeof columns === 'object' &&
			columns !== null &&
			columns !== undefined
		) {
			return Object.entries(columns)
				.map(
					([key, val]) =>
						`${
							isExpressionObject(val)
								? val.expression
								: `${
										prependAlias === true ? `${alias}.` : ''
								  }${escapeNames(val as string)}`
						} AS ${key}`
				)
				.join(',');
		}
	};
	const sColumns = columns ? create_columns(columns) : `${alias}.*`;
	const sFrom = from ? ` FROM ${tableRef}` : '';

	return `SELECT ${sColumns}${sFrom}`;
};

/*
function QueryBuilder(schema) {
	this.format = (...args) => mysql.format(...args);

	this.setSchema = (newSchema) => {
		if (newSchema && typeof newSchema === 'string') {
			schema = newSchema;
		} else {
			schema = null;
		}
	};
	this.setSchema(schema);

	this.where = (whereFilter, and = true, wrap = false) => {
		const whereString = buildWhere(whereFilter, and, wrap);
		if (whereString === '') return '';
		return `WHERE ${whereString}`;
	};
	this.select = (table, selectConfigs = {}) => {
		if (typeof selectConfigs !== 'object' || selectConfigs === null)
			selectConfigs = {};
		if (selectConfigs.whereAnd === undefined) selectConfigs.whereAnd = true;
		selectSchema =
			selectConfigs.schema !== undefined ? selectConfigs.schema : schema;
		const select = `SELECT ${selectColumns(
			selectConfigs.select || null,
			table
		)}`;
		const from = `FROM ${schema ? `\`${schema}\`.` : ''}\`${table}\``;
		const { join, joinColumns } = selectConfigs.join
			? this.join(selectConfigs.join)
			: { join: '', joinColumns: '' };
		const where = selectConfigs.where
			? this.where(selectConfigs.where, selectConfigs.whereAnd)
			: '';
		const having = selectConfigs.having
			? this.where(selectConfigs.having).replace('WHERE', 'HAVING')
			: '';
		const group = selectConfigs.group
			? `GROUP BY ${selectConfigs.group}`
			: '';
		const order = selectConfigs.order
			? `ORDER BY ${selectConfigs.order}`
			: '';
		const limit = selectConfigs.limit ? `LIMIT ${selectConfigs.limit}` : '';
		const offset = selectConfigs.offset
			? `OFFSET ${selectConfigs.offset}`
			: '';
		const queryParts = [
			select,
			joinColumns,
			from,
			join,
			where,
			group,
			having,
			order,
			limit,
			offset,
			';',
		];
		const query = queryParts.join(' ').replace(/\s\s+/g, ' ');
		return query;
	};
	this.insert = (table, rows, opts = {}) => {
		const type = opts?.type === 'ignore' ? ' IGNORE' : '';
		let columns, values;
		if (Array.isArray(rows)) {
			columns = rows
				.map((row) => Object.keys(row))
				.reduce((prev, curr) => {
					return prev.concat(
						curr.filter((item) => prev.indexOf(item) < 0)
					);
				}, []);
			values = rows
				.map(
					(row) =>
						`(${columns
							.map((column) => row[column])
							.map(escape)
							.join(',')})`
				)
				.join(',');
			columns = columns.join(',');
		} else if (
			!Array.isArray(rows) &&
			typeof rows === 'object' &&
			rows !== null
		) {
			columns = `${Object.keys(rows).join(',')}`;
			values = `(${Object.values(rows).map(escape).join(',')})`;
		} else {
			return null;
		}
		return `INSERT${type} INTO ${
			schema ? `\`${schema}\`.` : ''
		}\`${table}\` (${columns}) VALUES ${values};`;
	};

	this.update = (table, data, where) => {
		const set = buildSet(data);
		const whereQuery = this.where(where);
		const query = `UPDATE ${
			schema ? `\`${schema}\`.` : ''
		}\`${table}\` ${set} ${whereQuery};`;
		return query;
	};
	this.delete = (table, where) => {
		const whereQuery = this.where(where);
		const query = `DELETE FROM ${
			schema ? `\`${schema}\`.` : ''
		}\`${table}\` ${whereQuery};`;
		return query;
	};
	this.join = (join, defaultTable = null) => {
		if (typeof join === 'string') {
			return { join: join, joinColumns: null };
		} else if (
			Array.isArray(join) ||
			(typeof join === 'object' && join !== null)
		) {
			if (
				typeof join === 'object' &&
				join !== null &&
				!Array.isArray(join)
			) {
				join = [join];
			}
			const joinTypes = ['INNER', 'LEFT', 'RIGHT', 'FULL'];
			const result = join.map((joinObject) => {
				if (
					typeof joinObject.type !== 'string' ||
					!joinTypes.includes(joinObject.type.toUpperCase())
				) {
					joinObject.type = 'INNER';
				}
				if ((!joinObject.table && !defaultTable) || !joinObject.on) {
					return { join: null, joinColumns: null };
				}
				const from = `${
					joinObject.schema || schema
						? `\`${joinObject.schema || schema}\`.`
						: ''
				}\`${joinObject.table || defaultTable}\`${
					joinObject.alias !== undefined
						? ` \`${joinObject.alias}\``
						: ''
				}`;
				const joinColumns =
					joinObject.select !== undefined && joinObject.select !== {}
						? joinObject.select
						: null;
				const join = `${(
					joinObject.type || 'INNER'
				).toUpperCase()} JOIN ${from} ON (${buildWhere(
					joinObject.on
				)})`;
				return { join, joinColumns };
			});
			const joins = result.map((join) => join.join);
			const joinColumns = result
				.map((join) => join.joinColumns)
				.filter((join) => join !== null)
				.map(selectColumns);
			return {
				join: joins.join(' '),
				joinColumns:
					joinColumns.length !== 0 ? `,${joinColumns.join(',')}` : '',
			};
		} else {
			return { join: null, joinColumns: null };
		}
	};

	function selectColumns(select, table) {
		let columns;
		if (typeof select === 'string' && !isEmptyString(select)) {
			columns = select;
		} else if (Array.isArray(select)) {
			columns = select.join(',');
		} else if (typeof select === 'object' && select !== null) {
			columns = Object.entries(select)
				.map(([key, val]) => {
					return `${val} as ${key}`;
				})
				.join(',');
		} else {
			columns = `${table ? `\`${table}\`.` : ''}*`;
		}

		return columns;
	}

	function buildWhere(whereFilter, and = true, wrap = false) {
		if (typeof whereFilter === 'string' && whereFilter !== '') {
			return whereFilter;
		} else if (Array.isArray(whereFilter) && whereFilter.length > 0) {
			if (whereFilter.includes('__OR__')) {
				whereFilter = whereFilter.filter(
					(whereString) => whereString !== '__OR__'
				);
				and = false;
			}
			return `${whereFilter.join(and ? ' AND ' : ' OR ')}`;
		} else if (typeof whereFilter === 'object' && whereFilter !== null) {
			if (Object.keys(whereFilter).includes('__OR__')) {
				and = whereFilter['__OR__'] ? false : true;
				delete whereFilter['__OR__'];
			}
			if (Object.keys(whereFilter).includes('__BRACKETS__')) {
				wrap = whereFilter['__BRACKETS__'] ? true : false;
				delete whereFilter['__BRACKETS__'];
			}
			const whereFilterArray = buildWhereArrayFromObject(whereFilter);
			if (whereFilterArray.length === 0) return '';
			const whereResult = whereFilterArray.join(and ? ' AND ' : ' OR ');
			if (wrap) {
				return `(${whereResult})`;
			}
			return whereResult;
		} else {
			return '';
		}
	}

	function buildWhereArrayFromObject(object) {
		const result = Object.entries(object)
			.map(([key, value]) => {
				if (key === '__WHERE__') {
					return buildWhere(value);
				}
				if (typeof value === 'function') {
					value = value();
				}
				if (typeof value === 'number') {
					return `${key} = ${value.toString()}`;
				} else if (typeof value === 'string' && value !== '') {
					return buildCondition(key, value);
				} else if (Array.isArray(value)) {
					return `${key} IN (${value.map(escape).join(',')})`;
				} else if (value === null) {
					return `${key} IS NULL`;
				} else if (value === '') {
					return `${key} = ''`;
				} else if (typeof value === 'boolean') {
					return `${key} IS ${value ? 'TRUE' : 'FALSE'}`;
				}
				return null;
			})
			.filter((result) => result !== null);
		return result;
	}

	function buildCondition(key, value) {
		if (value.includes('__BETWEEN__')) {
			const [begin, end] = value.split('__BETWEEN__');
			return `(${key} BETWEEN ${begin} AND ${end})`;
		}
		let operator = '=';
		if (value.includes('__%__') || value.includes('__?__')) {
			value = value.replace(/__%__/g, '%').replace(/__\?__/g, '_');
			operator = 'LIKE';
		}
		const operators = [
			'=',
			'>=',
			'<=',
			'<>',
			'>',
			'<',
			'!=',
			'LIKE',
			'RLIKE',
			'NOT_LIKE',
			'NOT_RLIKE',
			'IS',
			'IS_NOT',
		];
		for (const operation of operators) {
			if (value.startsWith(`__${operation}__`)) {
				if (operation === 'IS' || operation === 'IS_NOT') {
					value = value.replace(`__${operation}__`, '__EXPRESSION__');
				} else {
					value = value.replace(`__${operation}__`, '');
				}
				operator = operation.replace(/_/g, ' ');
				break;
			}
		}
		return `${key} ${operator} ${escape(value)}`;
	}

	function buildSet(data) {
		let columnSets = '';
		if (typeof data === 'string' && !isEmptyString(data)) {
			columnSets = data;
		} else if (Array.isArray(data)) {
			columnSets = data.join(',');
		} else if (typeof data === 'object' && data !== null) {
			columnSets = Object.entries(data)
				.map(([key, value]) => `${key} = ${escape(value)}`)
				.join(',');
		} else {
			return '';
		}
		const set = `SET ${columnSets}`;
		return set;
	}
}
*/
