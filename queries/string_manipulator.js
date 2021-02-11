
module.exports = {
    isEmptyString,
    esc
}

function isEmptyString(string) {
    return typeof string === 'string' && string.replace(/\s/g, '') === ''
}

function esc(value) {
    if (value === null || value === undefined) {
        return 'NULL'
    }
    if (value === false || value === true) {
        return value ? 'TRUE' : 'FALSE'
    }
    if (!isNaN(value) && typeof value !== 'string') {
        return value
    }
    if (typeof value === 'string' && value.startsWith('__EXPRESSION__')) {
        return value.replace(/__EXPRESSION__/g, '')
    }
    return `'${value}'`
}