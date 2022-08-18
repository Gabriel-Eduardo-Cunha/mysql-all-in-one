import { emptyPrepStatement, PreparedStatement } from '../../types';
import { isNotEmptyString } from '../../utils';
import create_conditions from './create_conditions';
import { ConditionOptions } from './types';

const having = (opts?: ConditionOptions): PreparedStatement => {
	if (opts === undefined) return { ...emptyPrepStatement };
	const { statement, values } = create_conditions(opts);
	return {
		statement: isNotEmptyString(statement) ? ` HAVING ${statement}` : "",
		values,
		__is_prep_statement: true,
	};
};

export default having;
