import create_conditions from './create_conditions';
import { ConditionOptions } from './types';

const where = (opts?: ConditionOptions, alias?: string): string => {
	if (opts === undefined) return '';
	const conditions = create_conditions(opts, alias);
	return conditions ? ` WHERE ${conditions}` : '';
};

export default where;
