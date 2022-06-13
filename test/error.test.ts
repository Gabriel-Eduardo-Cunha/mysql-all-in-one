import { DataAccessObject } from '../';

const dao = new DataAccessObject({
	host: 'localhost',
	user: 'root',
	port: 3307,
	password: '',
	database: 'ambisis',
});

(async () => {
	try {
		const result = await dao.select({ from: 'cliente', columns: 'joker' });
		console.log(result);
	} catch (error) {
		console.log(error);
	}
})();
