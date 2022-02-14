const { MysqlDBMO: dbmo } = require('../index')
const path = require('path')
const fs = require('fs')

dbmo.setConnectionData({
    host: "localhost",
    user: "root",
    password: "",
});

const query = `
CREATE TABLE table1 (
	id varchar(100) NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;
CREATE TABLE table2 (
	id varchar(100) NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;
CREATE TABLE table3 (
	id varchar(100) NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;
CREATE TABLE table4 (
	id varchar(100) NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;
CREATE TABLE table5 (
	id varchar(100) NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;
`
const query2 = `
CREATE TABLE table7 (
	id varchar(100) NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;
INSERT INTO vistoriafile
(vistoriaId, filename, \`path\`, \`size\`)
VALUES(82, 'VISTORIAJULHO221ECLUCENA-6104559fb5205.docx', 'uploads/gep/vistoriafiles/82/VISTORIAJULHO221ECLUCENA-6104559fb5205.docx', 21108113);
INSERT INTO vistoriafile
(vistoriaId, filename, \`path\`, \`size\`)
VALUES(80, 'VISTORIA_JULHO_2021_BRITAGEMSOLEDADE-614dd3c5b4792.pdf', 'uploads/gep/vistoriafiles/80/VISTORIA_JULHO_2021_BRITAGEMSOLEDADE-614dd3c5b4792.pdf', 1427020);
INSERT INTO vistoriafile
(vistoriaId, filename, \`path\`, \`size\`)
VALUES(9, 'EdelmannDezembro 2021_compressed-61bd01cf6dcc4.pdf', 'uploads/gep/vistoriafiles/9/EdelmannDezembro 2021_compressed-61bd01cf6dcc4.pdf', 2042293);
`

console.time('transaction1')
const asyncFunc = async () => {
    await dbmo.runQueryTransaction(query2, 'ambisistest')
    console.timeEnd('transaction1');
    await dbmo.runQueryTransaction(query, 'ambisistest')
}
asyncFunc()
