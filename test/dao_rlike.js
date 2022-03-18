const { MysqlDAO: dao } = require('../index');

dao.createConnection({
	host: 'localhost',
	user: 'root',
	password: '1234',
	database: 'money_manager',
});

dao.select('category', {
	where: {
		name: '__RLIKE__of',
	},
}).then((r) => console.log(r));
