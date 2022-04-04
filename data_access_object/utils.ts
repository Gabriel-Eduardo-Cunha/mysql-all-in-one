import { isArrayOfStrings, SqlValues } from '../query_builder/types';
import _ from 'lodash';
import {
	ColumnGroups,
	DataPacket,
	isColumnGroups,
	RowDataPacket,
} from './types';

/**
 *
 * @param data data from database
 * @param by base column to group
 * @param columnGroups groups that will form based on repeated columns
 * @example group(
	[
		{ id: 1, userId: 1, userName: 'John', carBrand: 'Tesla' },
		{ id: 1, userId: 1, userName: 'John', carBrand: 'Volkswagen' },
		{ id: 1, userId: 2, userName: 'Bryan', carBrand: 'Tesla' },
		{ id: 1, userId: 2, userName: 'Bryan', carBrand: 'Volkswagen' },
		{ id: 2, userId: 1, userName: 'Ana', carBrand: 'Volvo' },
		{ id: 2, userId: 1, userName: 'Ana', carBrand: 'Volkswagen' },
	],
	'id',
	{
		users: { id: 'userId', name: 'userName' },
		cars: { brand: 'carBrand' },
	}
)
 * 	users: {id: 'userId', name: 'userName'},
 * 	cars: {brand: 'carBrand'}
 * })
 * @returns Grouped Data
 */
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
