const { MysqlDAO: dao, DPPO: dppo } = require('../index');
const _ = require('lodash')

const data = [
    {id: 1, name: 'to', foo_name: 'foo1', foo_age: 10, bar_name: 'bar1', bar_age: 2},
    {id: 1, name: 'to', foo_name: 'foo2', foo_age: 35, bar_name: 'bar1', bar_age: 2},
    {id: 1, name: 'to', foo_name: 'foo1', foo_age: 10, bar_name: 'bar2', bar_age: 4},
    {id: 1, name: 'to', foo_name: 'foo2', foo_age: 35, bar_name: 'bar2', bar_age: 4},
    {id: 2, name: 'rober', foo_name: 'foo3', foo_age: 13, bar_name: 'bar3', bar_age: 34},
    {id: 2, name: 'rober', foo_name: 'foo3', foo_age: 13, bar_name: 'bar4', bar_age: 37},
]

const result = dppo.group(data, 'id', {
    foos: ['foo_name', 'foo_age'],
    bars: ['bar_name', 'bar_age'],
}, { distincGroups: true })

console.log(result);




