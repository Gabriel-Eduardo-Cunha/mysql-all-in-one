import select from './select';
import insert from './insert';
import deleteFrom from './delete';
import { escStr } from './utils';

const query_builder = {
	select,
	insert,
	deleteFrom,
};

export default query_builder;

export { escStr };
