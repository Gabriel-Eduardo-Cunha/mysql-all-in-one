const { MysqlDAO: dao } = require('../index');

dao.setConnectionData({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'ambisissuprassumo',
});

const main = async () => {
	await dao.insert('version', { name: '2.2' });

	await dao.useDatabase('ambisistest');

	const result = await dao.select('configuracaoatributousuario');

	console.log(result);

	await dao.useDatabase('ambisissuprassumo');

	const result2 = await dao.select('version');
	console.log(result2);
};

main();
