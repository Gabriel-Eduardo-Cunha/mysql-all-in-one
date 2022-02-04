const { MysqlDAO: dao, DPPO: dppo } = require('../index');

const data = [
    {id: 1, name: 'to', 'script_id': null, 'script_function': null},
    {id: 2, name: 'rober', 'novelty_id': null},
]

const result = dppo.group(data, 'id', {
    scripts: ['script_id', 'script_function'],
    novelties: ['novelty_id', 'novelty_name', 'novelty_module', 'novelty_description', 'novelty_date'],
}, { distincGroups: true, firstRow: true, noEmptyGroups: false })

console.log(result);




