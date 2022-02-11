const { MysqlDBMO: dbmo } = require('../index')
const path = require('path')
const fs = require('fs')

dbmo.setConnectionData({
    host: "localhost",
    user: "root",
    password: "",
});

const query = `
CREATE TABLE table1 (
	id varchar(100) NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;
CREATE TABLE table2 (
	id varchar(100) NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;
`

console.time('transaction1')
const asyncFunc = async () => {
    await dbmo.execStatement('show processlist', 'ambisistest')
    await dbmo.emptyDatabase('ambisistest')
    console.timeEnd('transaction1');
}
asyncFunc()
