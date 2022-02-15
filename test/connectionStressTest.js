const {MysqlDBMO: dbmo} = require('../index')
const path = require('path')
const fs = require('fs')

dbmo.setConnectionData({
    host: "localhost",
    user: "root",
    password: "",
})

const asyncFunc = async () => {
    for (let i = 0; i < 100; i++) {
        console.time(`try ${i+1}`);
        const backup = path.join(__dirname, 'backuptest.sql')
        const update = path.join(__dirname, 'inserts.sql')

        // await dbmo.createBackup('ambisis05', backup)
        // await dbmo.rollBack('ambisis05', backup)
        // await dbmo.rollBack('ambisis05', backup)
        // await dbmo.runQueryTransaction(fs.readFileSync(update, {encoding: 'utf8'}), 'ambisis05', backup)
        await dbmo.runQueryTransaction(fs.readFileSync(update, {encoding: 'utf8'}), 'ambisis05', {backupPath: backup})
        await dbmo.runQueryTransaction(fs.readFileSync(update, {encoding: 'utf8'}), 'ambisis05', {backupPath: backup})
        await dbmo.runQueryTransaction(fs.readFileSync(update, {encoding: 'utf8'}), 'ambisis05', {backupPath: backup})
        await dbmo.rollBack('ambisis05', backup)
        await dbmo.rollBack('ambisis05', backup)
        await dbmo.rollBack('ambisis05', backup)

        console.timeEnd(`try ${i+1}`);
    }
}

asyncFunc()