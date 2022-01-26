const mysql = require('mysql2');
const QueryBuilder = require('./queries/builder');
const MysqlDAO = require('./db_connector/DAO')
const MysqlDBMO = require('./db_connector/DBMO')

module.exports = {
    connection: null,
    connectionData: null,
    schema: null,
    setSchema(schema) {
        this.schema = schema ? schema : null
        return this;
    },
    createConnection(connection) {
        this.connectionData = connection
        this.connection = mysql.createConnection(connection)
        return this;
    },
    get QueryBuilder() {
        return new QueryBuilder(this.schema);
    },
    get MysqlDAO() {
        return new MysqlDAO(this.connection, this.schema);
    },
    get MysqlDBMO() {
        return new MysqlDBMO(this.connection, this.connectionData)
    }
}

