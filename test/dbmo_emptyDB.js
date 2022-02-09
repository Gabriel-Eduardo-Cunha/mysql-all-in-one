const {MysqlDBMO: dbmo} = require('../index')

dbmo.setConnectionData({
    host: "localhost",
    user: "root",
    password: "",
})

console.time('test')
dbmo.emptyDatabase('teste1123').then(() => {
    console.timeEnd('test')
})