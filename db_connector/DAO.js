const mysql = require('mysql2');

module.exports = function(connection, schema) {
    this.QueryBuilder = new (require('../queries/builder'))(schema);

    this.connection = connection

    this.setConnection = connection => {
        this.connection = connection
    }
    this.createConnection = (...params) => {
        this.connection = mysql.createConnection(...params)
    },

    this.setSchema = schema => {
        this.QueryBuilder.setSchema(schema)
    }

    /**
     * Select data from table and return the dataset
     * @param {String} table table to select
     * @param {Object} select Object with select structure
     * @return {Promise} rows with the results
     */
    this.select = (table, select) => {
        const query = this.QueryBuilder.select(table, select);
        return this.execQuery(query)
    }

    /**
     * Select data from table and return the first row
     * @param {String} table table to select
     * @param {Object} select Object with select structure
     * @return {Promise} result row
     */
    this.selectRow = async(table, select) => {
        const result = await this.select(table, select);
        return result[0]
    }

    /**
     * Select data from table and return all the column values
     * @param {String} table table to select
     * @param {Object} select Object with select structure
     * @param {String} column column name that will be selected, if null will use the first column
     * @return {Promise} Array with column values
     */
    this.selectCol = async (table, select, column=null) => {
        const result = await this.select(table, select);
        if(column) {
            return result.map(row => row[column])
        }
        return result.map(row => row[Object.keys(row)[0]])
    }

    /**
     * Select data from table and return a value of the first row
     * @param {String} table table to select
     * @param {Object} select Object with select structure
     * @param {(String)} value name of the column to return, if null will use first column
     * @return {Promise} Value in the first row and first column
     */
    this.selectVal = async (table, select, value=null) => {
        const result = await this.select(table, select);
        if(!result || !result[0]) return null;
        if(value && result[0][value]) {
            return result[0][value]
        }
        return result[0][Object.keys(result[0])[0]]
    }

    /**
     * Insert one or multiple rows into a table, and return the last ID inserted.
     * @param {String} table table to insert
     * @param {(Array|Object)} rows rows or row to insert
     * @param {boolean} returnAllIds if true will return all IDs inserted (Be careful, that's much slower when inserting too many rows).
     * @return {Promise} Promise of the last ID inserted.
     */
    this.insert = (table, rows, returnAllIds=false) => {
        if(returnAllIds === true && Array.isArray(rows) && rows.length > 1) {
            return Promise.all(rows.map(row => this.insert(table, row)))
        }
        const query = this.QueryBuilder.insert(table, rows)
        return this.execQuery(query, r => r.insertId)
    }

    /**
     * Deletes data from table
     * @param {String} table table to delete from
     * @param {(String|Array|Object)} where Where to apply the delete filter
     * @return {Promise} Promise of the last ID inserted.
     */
    this.delete = (table, where) => {
        const query = this.QueryBuilder.delete(table, where)
        return this.execQuery(query, r => r.insertId)
    }

    /**
     *  Updates data from table
     * @param {String} table table to update
     * @param {(String|Array|Object)} data 
     * @param {(String|Array|Object)} where 
     * @return {Promise} results
     */
    this.update = (table, data, where) => {
        const query = this.QueryBuilder.update(table, data, where)
        return this.execQuery(query)
    }

    /**
     * Does an update if row contains any identifier, otherwise inserts a new row
     * @param {String} table table to update or insert
     * @param {Object} row row to update or insert
     * @param {(String|Array)} identifiers String or Array of strings containing the identifier keys
     * @return {Promise} last inserted ID
     */
    this.upsert = (table, row, identifiers="id") => {
        if(typeof row !== 'object' || row === null) {
            throw "Row param must be an Object";
        }
        return new Promise((resolve) => {
            if(typeof identifiers === "string") {
                identifiers = [identifiers]
            }
            if(identifiers.map(id => (Object.keys(row).includes(id) && row[id] !== undefined)).reduce((prev, curr) => prev || curr)) {
                const where = {}
                Object.entries(row).forEach(([key, val]) => {
                    if(val !== undefined && identifiers.includes(key)) {
                        where[key] = val
                    }
                });
                let values = Object.values(where)
                values = values.length === 1 ? values[0] : values
                this.update(table, row, where).then(() => resolve(values))
            } else {
                this.insert(table, row).then(resolve)
            }
        })
    }

    /**
     * 
     * @param {String} query table to update
     * @param {function} callback function(result) => receives the result before returning the function
     * @return {Promise} Result from query 
     */
    this.execQuery = (query, callback = r => r) => {
        if(this.connection === null) throw "No connection, please use method setConnection or createConnection.";
        return new Promise((resolve, reject) => {
            this.connection.query(query, (err, results) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(callback(results))
                }
            })
        })
    }
}