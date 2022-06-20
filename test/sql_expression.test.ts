import { sqlExpression } from '../QueryBuilder';

const exp1 = sqlExpression`(SELECT id FROM table WHERE id = ${1})`;

const exp2 = sqlExpression`SELECT nome FROM table2 WHERE table1Id = ${exp1}`;

console.log(exp2);
