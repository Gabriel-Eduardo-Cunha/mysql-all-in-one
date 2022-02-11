const {MysqlDBMO: dbmo, QueryBuilder} = require('../index')
const path = require('path')
const {v4: uniqid} = require('uuid')

dbmo.setConnectionData({
    host: "localhost",
    user: "root",
    password: "",
})

const asyncFunc = async () => {
    for (let i = 0; i < 10; i++) {
        console.time(`test${i}`)
        dbmo.createBackup('ambisistest', `./backup2${uniqid()}.sql`).then(() => {
            console.timeEnd(`test${i}`)
        })
    }
    dbmo.runMultipleStatements(`show processlist;show processlist;show processlist;`, 'ambisis02')
}
asyncFunc()



