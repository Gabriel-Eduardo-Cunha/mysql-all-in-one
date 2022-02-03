// DPPO = Data Post Processing Object
const _ = require('lodash')

module.exports = {
    /**
     * @description
     * Group data in a useful way when doing multiple joins that create duplicate collumns
     * @param {Array} data array of objects to be grouped
     * @param {Object} columnGroups object where keys will be column name and the value must be an array with the columns that should be in this group
     * @param {Object} opts
     * @param {boolean} opts.distincGroups no repeated values in columnGroups
     * @param {boolean} opts.firstRow return the first row result
     * 
     */
    group(data, by, columnGroups, opts) {
        opts = opts || {}
        const resultSet = data.reduce((majorData, cur) => {
            if (cur[by] === undefined) return majorData;
            let index = majorData.findIndex(row => cur[by] === row[by])
            if (index === -1) {
                const newRow = { ...cur }
                Object.entries(columnGroups).forEach(([key, columns]) => {
                    newRow[key] = []
                    columns.forEach(col => delete newRow[col])
                })
                majorData.push(newRow)
                index = majorData.length - 1
            }
            Object.entries(columnGroups).forEach(([key, columns]) => {
                const groupObject = {}
                columns.forEach(col => {
                    groupObject[col] = cur[col]
                })
                if(opts.distincGroups !== true || !_.find(majorData[index][key], o => _.isEqual(o, groupObject))) {
                    majorData[index][key].push(groupObject)
                }
            })
            return majorData
        }, [])
        if(opts.firstRow === true) {
            return resultSet.length > 0 ? resultSet[0] : resultSet
        }
        return resultSet
    }
}