import create_conditions from './create_conditions';
import { ConditionOptions } from './types';

const having = (opts?: ConditionOptions): string => {
	if (opts === undefined) return '';
	const conditions = create_conditions(opts);
	return conditions ? ` HAVING ${conditions}` : '';
};

export default having;
