const { MysqlDBMO: dbmo } = require('../index');
const path = require('path');
const fs = require('fs');

dbmo.setConnectionData({
	host: 'localhost',
	user: 'root',
	password: '',
	port: 3307,
});

dbmo.createBackup('ambisistest', path.join(__dirname, 'ambisistest.sql'));
