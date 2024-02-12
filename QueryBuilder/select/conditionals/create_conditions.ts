import { escVal } from '../../esc_val';
import {
	emptyPrepStatement,
	isPreparedStatement,
	isSqlExpressionPreparedStatement,
	PreparedStatement,
	SqlColumn,
	SqlValues,
} from '../../types';
import {
	escapeNames,
	putBrackets,
	safeApplyAlias,
} from '../../utils';
import {
	ConditionOptions,
	ConditionOptionsArray,
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
					statement: `(${acc.statement} ${
						isAnd === true ? 'AND' : 'OR'
					} ${cur.statement})`,
					values: [...acc.values, ...cur.values],
					__is_prep_statement: true,
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
		value = [...value];
		if (value.length > 0 && value[0] === '__or') {
			value.shift();
			isAnd = false;
		}
		if (value.length === 0) return { ...emptyPrepStatement };
		const conditions = value.map((v: ConditionOptions) =>
			create_conditions(v, alias, secondaryAlias)
		);
		return mergePrepStatements(conditions, isAnd);
	}
	if (typeof value === 'string')
		throw `strings are not valid as condition, use the sqlExpression function to create custom expressions: sqlExpression\`${value}\``;
	if (typeof value !== 'object')
		throw `Value must be String or Object type, received type ${typeof value}\n${value}`;

	if (isSqlExpressionPreparedStatement(value)) {
		value.statement = value.statement
			.split('__SQL__EXPRESSION__ALIAS__.')
			.join(
				typeof alias === 'string' && alias.length !== 0
					? `${alias}.`
					: ''
			);
		return { values: value.values, statement: value.statement, __is_prep_statement: true, };
	}

	const operation = (
		val: OperatorOptionsObject | SqlValues | SqlValues[] | SqlColumn,
		column: string
	) => {
		const colOrVal = (val: SqlValues | SqlColumn): string => {
			if (val instanceof SqlColumn)
				return safeApplyAlias(escapeNames(val.column), alias);
			prepStatementValues.push(val);
			return '?';
		};
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
				return `${column} LIKE ${colOrVal(like)}`;
			}
			if (notlike !== undefined) {
				return `${column} NOT LIKE ${colOrVal(notlike)}`;
			}
			if (rlike !== undefined) {
				return `${column} RLIKE ${colOrVal(rlike)}`;
			}
			if (notrlike !== undefined) {
				return `${column} NOT RLIKE ${colOrVal(notrlike)}`;
			}
			if (regexp !== undefined) {
				return `${column} REGEXP ${colOrVal(regexp)}`;
			}
			if (notregexp !== undefined) {
				return `${column} NOT REGEXP ${colOrVal(notregexp)}`;
			}
			if (
				between !== undefined &&
				Array.isArray(between) &&
				between.length === 2
			) {
				return `(${column} BETWEEN ${colOrVal(
					between[0]
				)} AND ${colOrVal(between[1])})`;
			}
			if (
				notbetween !== undefined &&
				Array.isArray(notbetween) &&
				notbetween.length === 2
			) {
				return `(${column} NOT BETWEEN ${colOrVal(
					notbetween[0]
				)} AND ${colOrVal(notbetween[1])})`;
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
				return `${column} IS ${escVal(is)}`;
			}
			if (isnot !== undefined) {
				return `${column} IS NOT ${escVal(isnot)}`;
			}

			if (safeNullEqual !== undefined) {
				prepStatementValues.push(safeNullEqual);
				return `${column} <=> ?`;
			}

			if (greaterThan !== undefined) {
				return `${column} > ${colOrVal(greaterThan)}`;
			}

			if (smallerThan !== undefined) {
				return `${column} < ${colOrVal(smallerThan)}`;
			}
			if (different !== undefined) {
				return `${column} <> ${colOrVal(different)}`;
			}
			if (notEqual !== undefined) {
				return `${column} != ${colOrVal(notEqual)}`;
			}
			if (greatherOrEqual !== undefined) {
				return `${column} >= ${colOrVal(greatherOrEqual)}`;
			}
			if (smallerOrEqual !== undefined) {
				return `${column} <= ${colOrVal(smallerOrEqual)}`;
			}
			if (equal !== undefined) {
				return `${column} = ${colOrVal(equal)}`;
			}
			return;
		}
		if (val === null || val === true || val === false) {
			return `${column} IS ${escVal(val)}`;
		}
		if (isSqlExpressionPreparedStatement(val)) {
			val.statement = val.statement
				.split('__SQL__EXPRESSION__ALIAS__.')
				.join(
					typeof alias === 'string' && alias.length !== 0
						? `${alias}.`
						: ''
				);
			prepStatementValues.push(...val.values);
			return `${column} = ${putBrackets(val.statement)}`;
		}
		return `${column} = ${colOrVal(val)}`;
	};

	if ('__or' in value) {
		value = { ...value };
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
	return { statement: prepStatementQuery, values: prepStatementValues, __is_prep_statement: true, };
};

export default create_conditions;
