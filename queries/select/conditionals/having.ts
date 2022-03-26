import create_conditions from './create_conditions'
import { ConditionOptions } from './types';

const having = (opts: ConditionOptions): string => {
	return `HAVING ${create_conditions(opts)}`;
};

export default having