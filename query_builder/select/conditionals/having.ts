import { emptyPrepStatement, PreparedStatement } from '../../types';
import create_conditions from './create_conditions';
import { ConditionOptions } from './types';

const having = (opts?: ConditionOptions): PreparedStatement => {
	if (opts === undefined) return { ...emptyPrepStatement };
	const { statement, values } = create_conditions(opts);
	return { statement: ` HAVING ${statement}`, values };
};

export default having;
