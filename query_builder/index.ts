import select from './select';
import insert from './insert';
import deleteFrom from './delete';
import update from './update';
import { escStr } from './utils';

const query_builder = {
	select,
	insert,
	deleteFrom,
	update,
};

export default query_builder;

export { escStr };
