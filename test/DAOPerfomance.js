const { MysqlDAO: dao } = require('../index')




dao.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'ambisistest'
})



console.time('test')
Promise.all(
    [...Array(100000)].map(() => dao.insert('crhistorico', {crId: 44}))
    ).then(() => {
    console.timeEnd('test')
})

