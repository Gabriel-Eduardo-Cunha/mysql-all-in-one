const { esc, isEmptyString } = require('./string_manipulator');

function QueryBuilder(schema) {

    this.setSchema = (newSchema) => {
        if (newSchema && typeof newSchema === 'string') {
            schema = newSchema
        } else {
            schema = null
        }
    }
    this.setSchema(schema)

    this.where = (whereFilter, and = true) => {
        if (typeof whereFilter === 'string' && whereFilter !== '') {
            return `WHERE ${whereFilter}`
        } else if (Array.isArray(whereFilter) && whereFilter.length > 0) {
            if (whereFilter.includes('__OR__')) {
                whereFilter = whereFilter.filter(whereString => whereString !== '__OR__')
                and = false
            }
            return `WHERE ${whereFilter.join(and ? ' AND ' : ' OR ')}`
        } else if (typeof whereFilter === 'object' && whereFilter !== null) {
            if (Object.keys(whereFilter).includes('__OR__')) {
                and = whereFilter['__OR__'] ? false : true
                delete whereFilter['__OR__']
            }
            const whereFilterArray = buildWhereArrayFromObject(whereFilter)
            if (whereFilterArray.length === 0) return "";
            return `WHERE ${buildWhereArrayFromObject(whereFilter).join(and ? ' AND ' : ' OR ')}`
        } else {
            return ""
        }
    }
    this.select = (table, selectConfigs = {}) => {
        if (typeof selectConfigs !== 'object' || selectConfigs === null) selectConfigs = {};
        if (selectConfigs.whereAnd === undefined) selectConfigs.whereAnd = true;
        const select = `SELECT ${selectColumns((selectConfigs.select || null), table)}`
        const from = `FROM ${schema ? `${schema}.` : ''}${table}`
        const { join, joinColumns } = selectConfigs.join ? this.join(selectConfigs.join) : { join: '', joinColumns: '' }
        const where = selectConfigs.where ? this.where(selectConfigs.where, selectConfigs.whereAnd) : ''
        const having = selectConfigs.having ? this.where(selectConfigs.having).replace('WHERE', 'HAVING') : ''
        const group = selectConfigs.group ? `GROUP BY ${selectConfigs.group}` : ''
        const order = selectConfigs.order ? `ORDER BY ${selectConfigs.order}` : ''
        const limit = selectConfigs.limit ? `LIMIT ${selectConfigs.limit}` : ''
        const offset = selectConfigs.offset ? `OFFSET ${selectConfigs.offset}` : ''
        const queryParts = [
            select,
            joinColumns,
            from,
            join,
            where,
            group,
            having,
            order,
            limit,
            offset,
            ';'
        ]
        const query = queryParts.join(' ').replace(/\s\s+/g, ' ')
        return query
    }
    this.insert = (table, rows) => {
        if(Array.isArray(rows)) {
            const columns = rows.map(row => Object.keys(row)).reduce((prev, curr) => {
                return prev.concat(curr.filter((item) => prev.indexOf(item) < 0))
            }, [])
            const values = rows.map(row => `(${columns.map(column => row[column]).map(esc).join(',')})`)
            return `INSERT INTO ${schema ? `${schema}.` : ''}${table} (${columns.join(',')}) VALUES ${values.join(',')};`
        } else if(!Array.isArray(rows) && typeof rows === 'object' && rows !== null) {
            return this.insertRow(table, rows)
        } else {
            return null
        }
    }
    this.insertRow = (table, row) => {
        const columns = `(${Object.keys(row).join(',')})`
        const values = `(${Object.values(row).map(esc).join(',')})`
        const query = `INSERT INTO ${schema ? `${schema}.` : ''}${table} ${columns} VALUES ${values};`
        return query
    }
    this.update = (table, data, where) => {
        const set = buildSet(data)
        const whereQuery = this.where(where)
        const query = `UPDATE ${schema ? `${schema}.` : ''}${table} ${set} ${whereQuery};`
        return query
    }
    this.delete = (table, where) => {
        const whereQuery = this.where(where)
        const query = `DELETE FROM ${schema ? `${schema}.` : ''}${table} ${whereQuery};`
        return query
    }
    this.join = (join, defaultTable = null) => {
        if (typeof join === 'string') {
            return { join: join, joinColumns: null }
        } else if (Array.isArray(join) || (typeof join === 'object' && join !== null)) {
            if (typeof join === 'object' && join !== null && !Array.isArray(join)) {
                join = [join]
            }
            const result = join.map(joinObject => {
                if ((!joinObject.table && !defaultTable) || !joinObject.on) {
                    return { join: null, joinColumns: null }
                }
                const from = `${joinObject.schema || schema ? `${joinObject.schema || schema}.` : ''}${joinObject.table || defaultTable}`
                const joinColumns = joinObject.select !== undefined && joinObject.select !== {} ? joinObject.select : null
                const join = `${(joinObject.type || 'INNER').toUpperCase()} JOIN ${from} ON ${joinObject.on}`
                return { join, joinColumns }
            })
            const joins = result.map(join => join.join)
            const joinColumns = result.map(join => join.joinColumns).filter(join => join !== null).map(selectColumns)
            return {
                join: joins.join(' '),
                joinColumns: joinColumns.length !== 0 ? `,${joinColumns.join(',')}` : ''
            }
        } else {
            return { join: null, joinColumns: null }
        }
    }

    function selectColumns(select, table) {
        let columns;
        if (typeof select === 'string' && !isEmptyString(select)) {
            columns = select
        } else if (Array.isArray(select)) {
            columns = select.join(',')
        } else if (typeof select === 'object' && select !== null) {
            columns = Object.entries(select).map(([key, val]) => {
                return `${val} as ${key}`
            }).join(',')
        } else {
            columns = `${table ? `${table}.` : ''}*`
        }

        return columns
    }

    function buildWhereArrayFromObject(object) {
        const result = Object.entries(object).map(([key, value]) => {
            if (key === '__EXPRESSION__') {
                return value
            }
            if (typeof value === 'function') {
                value = value()
            }
            if (typeof value === 'number') {
                return `${key} = ${value.toString()}`;
            } else if (typeof value === 'string' && value !== '') {
                return buildCondition(key, value);
            } else if (Array.isArray(value)) {
                return `${key} IN (${value.map(esc).join(',')})`
            } else if (value === null || value === undefined) {
                return `${key} IS NULL`
            } else if (value === '') {
                return `${key} = ''`
            } else if (typeof value === 'boolean') {
                return `${key} IS ${value ? 'TRUE' : 'FALSE'}`
            }
        })
        return result;
    }

    function buildCondition(key, value) {

        if (value.includes('__BETWEEN__')) {
            const [begin, end] = value.split('__BETWEEN__');
            return `(${key} BETWEEN ${begin} AND ${end})`;
        }
        let operator = '='
        const operators = ['=', '>=', '<=', '<>', '>', '<', '!=', 'LIKE', 'IS']
        for (const operation of operators) {
            if (value.startsWith(`__${operation}__`)) {
                if (operation === 'IS') {
                    value = value.replace(`__${operation}__`, '__EXPRESSION__')
                } else {
                    value = value.replace(`__${operation}__`, '')
                }
                operator = operation
                break;
            }
        }
        if (value.includes('__%__') || value.includes('__?__')) {
            value = value.replace(/__%__/g, '%').replace(/__\?__/g, '_');
        }
        return `${key} ${operator} ${esc(value)}`;
    }

    function buildSet(data) {
        let columnSets = ""
        if (typeof data === 'string' && !isEmptyString(data)) {
            columnSets = data
        } else if (Array.isArray(data)) {
            columnSets = data.join(',')
        } else if (typeof data === 'object' && data !== null) {
            columnSets = Object.entries(data).map(([key, value]) => `${key} = ${esc(value)}`).join(',')
        } else {
            return ""
        }
        const set = `SET ${columnSets}`
        return set
    }

}

module.exports = QueryBuilder

