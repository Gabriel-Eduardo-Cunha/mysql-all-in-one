import { putBrackets, escVal, escapeNames, safeApplyAlias } from '../../utils';
import {
	ConditionOptions,
	isColumnRelationObject,
	isOperatorOptionsObject,
	OperatorOptionsObject,
} from './types';

const create_conditions = (
	value: ConditionOptions,
	alias?: string,
	secondaryAlias?: string
): String | undefined => {
	let isAnd = true;
	if (Array.isArray(value)) {
		if (value.length > 0 && value[0] === '__or') {
			value.shift();
			isAnd = false;
		}
		if (value.length === 0) return undefined;
		const conditions = value
			.map((v) => create_conditions(v, alias, secondaryAlias))
			.filter((v) => v !== undefined);
		return conditions.length !== 0
			? `(${conditions.join(isAnd ? ' AND ' : ' OR ')})`
			: '';
	}
	if (typeof value === 'string') return putBrackets(value);
	if (typeof value !== 'object')
		throw `Value must be String or Object type, received type ${typeof value}\n${value}`;

	const operation = (val: OperatorOptionsObject | any) => {
		if (val === undefined) return;
		if (Array.isArray(val)) return `IN (${val.map(escVal).join(',')})`;
		if (isOperatorOptionsObject(val)) {
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
			if (like !== undefined) return `LIKE ${escVal(like)}`;
			if (notlike !== undefined) return `NOT LIKE ${escVal(notlike)}`;
			if (rlike !== undefined) return `RLIKE ${escVal(rlike)}`;
			if (notrlike !== undefined) return `NOT RLIKE ${escVal(notrlike)}`;
			if (
				between !== undefined &&
				Array.isArray(between) &&
				between.length === 2
			)
				return `BETWEEN ${escVal(between[0])} AND ${escVal(
					between[1]
				)}`;
			if (
				notbetween !== undefined &&
				Array.isArray(notbetween) &&
				notbetween.length === 2
			)
				return `NOT BETWEEN ${escVal(notbetween[0])} AND ${escVal(
					notbetween[1]
				)}`;
			if (inOperator !== undefined && Array.isArray(inOperator))
				return `IN (${escVal(inOperator)})`;
			if (notin !== undefined && Array.isArray(notin))
				return `NOT IN (${escVal(notin)})`;
			if (greaterThan !== undefined) return `> ${escVal(greaterThan)}`;
			if (smallerThan !== undefined) return `< ${escVal(smallerThan)}`;
			if (different !== undefined) return `<> ${escVal(different)}`;
			if (notEqual !== undefined) return `<> ${escVal(notEqual)}`;
			if (greatherOrEqual !== undefined)
				return `>= ${escVal(greatherOrEqual)}`;
			if (smallerOrEqual !== undefined)
				return `<= ${escVal(smallerOrEqual)}`;
			if (equal !== undefined) return `= ${escVal(equal)}`;
			return;
		}
		if (val === null || val === true || val === false)
			return `IS ${escVal(val)}`;
		return `= ${escVal(val)}`;
	};

	if ('__or' in value) {
		delete value['__or'];
		isAnd = false;
	}

	const isBetween = (val: any): boolean =>
		val !== null &&
		!Array.isArray(val) &&
		typeof val === 'object' &&
		(val.between !== undefined || val.notbetween !== undefined);
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
			const operationResult = operation(val);
			return val === undefined && operationResult === undefined
				? undefined
				: isBetween(val)
				? putBrackets(`${column} ${operationResult}`)
				: `${column} ${operationResult}`;
		})
		.filter((v) => v !== undefined)
		.join(isAnd ? ' AND ' : ' OR ');
	return conditions ? `(${conditions})` : '';
};

export default create_conditions;
