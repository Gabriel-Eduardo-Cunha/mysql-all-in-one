const {MysqlDBMO: dbmo, QueryBuilder} = require('../index')
const path = require('path')

dbmo.setConnectionData({
    host: "localhost",
    user: "root",
    password: "",
})

console.time('test')
dbmo.execSqlFromFile(path.join(__dirname, 'inserts.sql'), 'ambisistest').then(() => {
    console.timeEnd('test')
    
})
dbmo.
dbmo.execSqlFromFile(path.join(__dirname, 'inserts.sql'), 'ambisistest')
dbmo.execSqlFromFile(path.join(__dirname, 'inserts.sql'), 'ambisistest')
dbmo.execSqlFromFile(path.join(__dirname, 'inserts.sql'), 'ambisistest')

