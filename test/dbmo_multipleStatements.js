const { MysqlDBMO: dbmo } = require('../index')
const path = require('path')
const fs = require('fs')

dbmo.setConnectionData({
    host: "localhost",
    user: "root",
    password: "",
});

const databases = [];
for (let i = 0; i < 100; i++) {
    databases.push(`test${i}`)
}

(async () => {
    console.time('update')
    await dbmo.runQueryTransactionFromFile(path.join(__dirname, 'error_update.sql'), 'testdb')
    console.timeEnd('update')
})()
