import {
	emptyPrepStatement,
	isPreparedStatement,
	PreparedStatement,
	SqlValues,
} from '../../types';
import { escapeNames, safeApplyAlias, sqlExpression } from '../../utils';
import {
	ConditionOptions,
	isColumnRelationObject,
	isOperatorOptionsObject,
	OperatorOptionsObject,
} from './types';

const mergePrepStatements = (
	prepStatements: Array<PreparedStatement>,
	isAnd: boolean
): PreparedStatement => {
	if (
		prepStatements === null ||
		prepStatements === undefined ||
		!Array.isArray(prepStatements)
	)
		return { ...emptyPrepStatement };
	const filteredPrepStatements = prepStatements.filter((v) =>
		isPreparedStatement(v)
	);

	return filteredPrepStatements.length === 0
		? { ...emptyPrepStatement }
		: filteredPrepStatements.reduce(
				(acc, cur): PreparedStatement => ({
					statement: `${acc.statement} ${
						isAnd === true ? 'AND' : 'OR'
					} ${cur.statement}`,
					values: [...acc.values, ...cur.values],
				})
		  );
};

const create_conditions = (
	value: ConditionOptions,
	alias?: string,
	secondaryAlias?: string
): PreparedStatement => {
	let prepStatementQuery: string = '';
	const prepStatementValues: Array<SqlValues> = [];
	let isAnd = true;
	if (Array.isArray(value)) {
		if (value.length > 0 && value[0] === '__or') {
			value.shift();
			isAnd = false;
		}
		if (value.length === 0) return { ...emptyPrepStatement };
		const conditions = value.map((v) =>
			create_conditions(v as ConditionOptions, alias, secondaryAlias)
		);
		return mergePrepStatements(conditions, isAnd);
	}
	if (typeof value === 'string')
		throw `strings are not valid as condition, use the sqlExpression function to create custom expressions: sqlExpression\`${value}\``;
	if (typeof value !== 'object')
		throw `Value must be String or Object type, received type ${typeof value}\n${value}`;

	if (value.__is_prep_statement === true) {
		delete value.__is_prep_statement;
		if (isPreparedStatement(value)) {
			return value;
		}
	}

	const operation = (val: OperatorOptionsObject | any, column: string) => {
		if (val === undefined) return;
		if (Array.isArray(val)) {
			prepStatementValues.push(...val);
			return `${column} IN (${val.map((_) => '?').join(',')})`;
		}
		if (isOperatorOptionsObject(val)) {
			const {
				like,
				notlike,
				rlike,
				notrlike,
				between,
				notbetween,
				in: inOperator,
				is,
				isnot,
				notin,
				regexp,
				notregexp,
				'<=>': safeNullEqual,
				'>': greaterThan,
				'<': smallerThan,
				'<>': different,
				'!=': notEqual,
				'>=': greatherOrEqual,
				'<=': smallerOrEqual,
				'=': equal,
			} = val;
			if (like !== undefined) {
				prepStatementValues.push(like);
				return `${column} LIKE ?`;
			}
			if (notlike !== undefined) {
				prepStatementValues.push(notlike);
				return `${column} NOT LIKE ?`;
			}
			if (rlike !== undefined) {
				prepStatementValues.push(rlike);
				return `${column} RLIKE ?`;
			}
			if (notrlike !== undefined) {
				prepStatementValues.push(notrlike);
				return `${column} NOT RLIKE ?`;
			}
			if (regexp !== undefined) {
				prepStatementValues.push(regexp);
				return `${column} REGEXP ?`;
			}
			if (notregexp !== undefined) {
				prepStatementValues.push(notregexp);
				return `${column} NOT REGEXP ?`;
			}
			if (
				between !== undefined &&
				Array.isArray(between) &&
				between.length === 2
			) {
				prepStatementValues.push(between[0], between[0]);
				return `(${column} BETWEEN ? AND ?)`;
			}
			if (
				notbetween !== undefined &&
				Array.isArray(notbetween) &&
				notbetween.length === 2
			) {
				prepStatementValues.push(notbetween[0], notbetween[0]);
				return `(${column} NOT BETWEEN ? AND ?)`;
			}
			if (
				inOperator !== undefined &&
				Array.isArray(inOperator) &&
				inOperator.length !== 0
			) {
				prepStatementValues.push(...inOperator);
				return `${column} IN (${inOperator.map((_) => '?').join(',')})`;
			}
			if (
				notin !== undefined &&
				Array.isArray(notin) &&
				notin.length !== 0
			) {
				prepStatementValues.push(...notin);
				return `${column} NOT IN (${notin.map((_) => '?').join(',')})`;
			}

			if (is !== undefined) {
				prepStatementValues.push(is);
				return `${column} IS ?`;
			}
			if (isnot !== undefined) {
				prepStatementValues.push(isnot);
				return `${column} IS NOT ?`;
			}

			if (safeNullEqual !== undefined) {
				prepStatementValues.push(safeNullEqual);
				return `${column} <=> ?`;
			}

			if (greaterThan !== undefined) {
				prepStatementValues.push(greaterThan);
				return `${column} > ?`;
			}

			if (smallerThan !== undefined) {
				prepStatementValues.push(smallerThan);
				return `${column} < ?`;
			}
			if (different !== undefined) {
				prepStatementValues.push(different);
				return `${column} <> ?`;
			}
			if (notEqual !== undefined) {
				prepStatementValues.push(notEqual);
				return `${column} != ?`;
			}
			if (greatherOrEqual !== undefined) {
				prepStatementValues.push(greatherOrEqual);
				return `${column} >= ?`;
			}
			if (smallerOrEqual !== undefined) {
				prepStatementValues.push(smallerOrEqual);
				return `${column} <= ?`;
			}
			if (equal !== undefined) {
				prepStatementValues.push(equal);
				return `${column} = ?`;
			}
			return;
		}
		prepStatementValues.push(val);
		if (val === null || val === true || val === false) {
			return `${column} IS ?`;
		}
		return `${column} = ?`;
	};

	if ('__or' in value) {
		delete value['__or'];
		isAnd = false;
	}

	const conditions = Object.entries(value)
		.map(([key, val]) => {
			if (key === '__col_relation' && isColumnRelationObject(val)) {
				return Object.entries(val)
					.map(
						([col1, col2]) =>
							`${safeApplyAlias(
								escapeNames(col1),
								alias
							)} = ${safeApplyAlias(
								escapeNames(col2),
								secondaryAlias || alias
							)}`
					)
					.join(isAnd ? ' AND ' : ' OR ');
			}
			const column = safeApplyAlias(escapeNames(key), alias);
			const operationResult = operation(val, column);
			return val === undefined && operationResult === undefined
				? undefined
				: operationResult;
		})
		.filter((v) => v !== undefined)
		.join(isAnd ? ' AND ' : ' OR ');
	prepStatementQuery = conditions ? `(${conditions})` : '';
	return { statement: prepStatementQuery, values: prepStatementValues };
};

export default create_conditions;
