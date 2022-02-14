const { MysqlDBMO: dbmo } = require('../index')
const path = require('path')
const fs = require('fs')

dbmo.setConnectionData({
    host: "localhost",
    user: "root",
    password: "",
});

const asyncFunct = async () => {
    const backupPath = path.join(__dirname, 'backuptest.sql')
    console.time('creating backup')
    await dbmo.createBackup('ambisis20', backupPath, {maxRowsPerInsertStatement: 1000})
    console.timeEnd('creating backup')
    
    console.time('rollback')
    await dbmo.rollBack('ambisis20', backupPath)
    console.timeEnd('rollback')

}
asyncFunct()

