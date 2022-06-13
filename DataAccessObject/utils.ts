import { isArrayOfStrings, SqlValues } from '../QueryBuilder/types';
import _ from 'lodash';
import {
	ColumnGroups,
	DataPacket,
	isColumnGroups,
	RowDataPacket,
} from './types';

export const group = (
	data: DataPacket,
	by: string,
	columnGroups: ColumnGroups
) => {
	return data.reduce((acc, cur): DataPacket => {
		if (!isColumnGroups(columnGroups))
			throw 'Invalid Column Groups, must be an Array of strings or Object with only string values.';
		let index = acc.findIndex((v) => v[by] === cur[by]);
		if (index === -1) {
			const newRow = { ...cur };
			Object.entries(columnGroups).forEach(
				([groupName, groupColumns]) => {
					const newColumnNames = isArrayOfStrings(groupColumns)
						? groupColumns
						: Object.values(groupColumns);
					newRow[groupName] = [];
					newColumnNames.forEach((col) => delete newRow[col]);
				}
			);
			acc.push(newRow);
			index = acc.length - 1;
		}
		Object.entries(columnGroups).forEach(([groupName, groupColumns]) => {
			const groupObject: RowDataPacket = {};
			if (isArrayOfStrings(groupColumns)) {
				groupColumns.forEach((col) => {
					groupObject[col] = cur[col];
				});
			} else {
				Object.entries(groupColumns).forEach(
					([newColumn, oldColumn]) => {
						groupObject[newColumn] = cur[oldColumn];
					}
				);
			}
			if (
				!Object.values(groupObject).every((v) => _.isNil(v)) &&
				(acc[index][groupName] as DataPacket).findIndex((v) =>
					_.isEqual(v, groupObject)
				) === -1
			) {
				(acc[index][groupName] as DataPacket).push(groupObject);
			}
		});

		return acc;
	}, [] as DataPacket);
};

export const arrayUnflat = (array: Array<any>, size: number) => {
	if (!size || size <= 0 || !Array.isArray(array)) return array;
	const newArray = [];
	while (array.length > 0) newArray.push(array.splice(0, size));
	return newArray;
};

export const statementsMerge = (
	stringArray: Array<string>,
	maxStringSize: number
) => {
	return stringArray.reduce((acc: Array<string>, cur) => {
		cur = `${cur};`;
		if (
			acc[acc.length - 1] !== undefined &&
			acc[acc.length - 1].length + cur.length <= maxStringSize
		) {
			acc[acc.length - 1] = `${acc[acc.length - 1]}${cur}`;
			return acc;
		}
		acc.push(cur);
		return acc;
	}, []);
};
