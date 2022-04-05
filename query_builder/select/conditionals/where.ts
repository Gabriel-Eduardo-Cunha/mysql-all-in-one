import { emptyPrepStatement, PreparedStatement } from '../../types';
import { isNotEmptyString } from '../../utils';
import create_conditions from './create_conditions';
import { ConditionOptions } from './types';

const where = (opts?: ConditionOptions, alias?: string): PreparedStatement => {
	if (opts === undefined) return { ...emptyPrepStatement };
	const { statement, values } = create_conditions(opts, alias);
	return {
		statement: isNotEmptyString(statement) ? ` WHERE ${statement}` : '',
		values,
	};
};

export default where;
