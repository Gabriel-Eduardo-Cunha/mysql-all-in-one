import DataAccessObject from '../data_access_object';

const dao = new DataAccessObject({
	database: 'ambisissuprassumo',
	port: 3307,
	host: 'localhost',
	user: 'root',
});

const main = async () => {
	const databases = await dao.select(
		{
			from: 'client_login_base',
			columns: 'database',
			where: { database: { isnot: null } },
		},
		{ returnMode: 'firstColumn' }
	);
	console.log(databases);

	if (!Array.isArray(databases))
		return console.log(
			`Error: mailSender not called, no databases found: ${databases}`
		);

	for (const database of databases) {
		// console.log(database);
	}
};

main();
