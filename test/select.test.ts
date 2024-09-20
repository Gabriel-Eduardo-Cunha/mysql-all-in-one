import { DataAccessObject } from '../index';

const dao = new DataAccessObject({
	host: 'localhost',
	user: 'root',
	port: 3306,
	password: '',
	database: 'ambisis',
});

const list_first_user = async () => {
	const r = await dao.select(
		{
			from: 'user',
		},
		{ returnMode: 'firstRow' }
	);
	console.log(r);
};

const list_clients = async () => {
	const r = await dao.select(
		{ from: 'cliente', columns: ['id', 'razaoSocial', 'cnpj'] },
		{
			database: 'ambisistest',
			returnMode: 'specific',
			specificColumn: 'cnpj',
		}
	);
	console.log(r);
};

const user_exists = async (email: string) => {
	const r = await dao.select(
		{
			from: 'user',
			columns: ['email'],
			where: {
				email: { like: email },
			},
		},
		{
			returnMode: 'firstValue',
		}
	);
	console.log(r !== null);
};

user_exists('testeambisis@gmail.com');

// list_first_user();

// list_clients();
