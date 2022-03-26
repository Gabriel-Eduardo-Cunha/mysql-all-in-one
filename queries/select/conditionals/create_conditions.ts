import {putBrackets, escVal, escapeNames, safeApplyAlias} from '../../utils'
import { ConditionOptions  } from './types';
import { OperatorOptionsObject } from './interfaces';

const create_conditions = (value: ConditionOptions, alias?: string): String => {
	let isAnd = true;
	if (Array.isArray(value)) {
		if (value.length > 0 && value[0] === '__or') {
			value.shift();
			isAnd = false;
		}
		return `(${value
			.map((v) => create_conditions(v, alias))
			.join(isAnd ? ' AND ' : ' OR ')})`;
	}
	if (typeof value === 'string') return putBrackets(value);
	if (typeof value !== 'object')
		throw `Value must be String or Object type, received type ${typeof value}\n${value}`;
	const operation = (val: OperatorOptionsObject | any) => {
		if (val === undefined) return;
		if (Array.isArray(val)) return `IN (${val.map(escVal).join(',')})`;
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
	return `(${Object.entries(value)
		.map(([key, val]) => {
			const column = safeApplyAlias(escapeNames(key), alias);
			const operationResult = operation(val);
			return val === undefined && operationResult === undefined
				? undefined
				: val !== null && // Condition bellow checks if is between and put brackets
				  !Array.isArray(val) &&
				  typeof val === 'object' &&
				  (val.between !== undefined || val.notbetween !== undefined)
				? `(${column} ${operationResult})`
				: `${column} ${operationResult}`;
		})
		.filter((v) => v !== undefined)
		.join(isAnd ? ' AND ' : ' OR ')})`;
};

export default create_conditions;
