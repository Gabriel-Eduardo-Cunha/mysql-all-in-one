const mysql = require('mysql');
const QueryBuilder = require('./queries/builder');
const MysqlDAO = require('./DAO/DAO')

module.exports = {
    connection: null,
    schema: null,
    setSchema(schema) {
        this.schema = schema ? schema : null
        return this;
    },
    createConnection(...params) {
        this.connection = mysql.createConnection(...params)
        return this;
    },
    get QueryBuilder() {
        return new QueryBuilder(this.schema);
    },
    get MysqlDAO() {
        return new MysqlDAO(this.connection, this.schema);
    }
}

