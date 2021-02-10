# mysql-all-in-one
 All tools that a node developer needs to implements a connection and dataflow in a MYSQL database.

# Query Builder

The query builder module is capable of building queries from Javascript Objects, Arrays or plain Strings.

__REQUIRE__
```js
const {QueryBuilder} = require('mysql-all-in-one');

QueryBuilder.setSchema('shop'); // This will set the default schema of the queries.
```
__SET SCHEMA__
To set the default schema for all query functions, simply use "setSchema()" method.
If no schema is set, the queries are not going to have any schema.
```js
QueryBuilder.setSchema('schema_name')
const query = QueryBuilder.select('table')
// SELECT table.* FROM schema_name.table
```

__GENERAL SELECT EXAMPLE__
```js
let query;

query = QueryBuilder.select('product');
console.log(query);

query = QueryBuilder.select('product', {
    select: {id: 'id', productName: 'name'}, // id as id, name as productName
    join: [
        {
            type: 'left', // join type (INNER)
            table: 'product_category',
            on: 'product_category.productId = product.id',
            select: 
        }
    ],
    where: { // WHERE conditions, by default uses 'AND' between conditions
        'product.id': 1, // id = 1
        'product.name': "__LIKE__pen", // name lIKE 'pen'
        description: "__%__blue__%__", // description LIKE '%blue%'
        text: "bl__?__ck", // text LIKE 'bl_ck' (will match for 'black' and 'block')
        'product_category.productId': [1,2,3,'a','b'], // product_category.productId IN (1,2,3,'a','b')
        price: "1.5__BETWEEN__2.5", // (price BETWEEN 1.5 AND 2.5)
        isEnabled: true, // isEnable IS TRUE (works for: false)
        categoryId: null, // categoryId IS NULL (works for: undefined, witch is going to be 'NULL')
        isHighlighted: "__IS__NOT NULL", // isHighlighted IS NOT NULL (when __IS__ is used, the rest becomes SQL expression)
        userReviews: "__>__3", // userReviews > 3 (works for: >, <, >=, <=, <>, !=, =)
        expirationDate: // expirationDate = STR_TO_DATE(expirationDate, '%d/%m/%Y')
            `__EXPRESSION__STR_TO_DATE(expirationDate, '%d/%m/%Y')`, //  __EXPRESSION__ makes it a SQL expression
        __WHERE__:  `(size = (SELECT size FROM secondaryProduct WHERE id = 1) OR size IS NULL)`,
        // The __WHERE__ key will make another WHERE and concatenate it
    },
    having: { // works exactly like WHERE
        expirationDate: "__LIKE__20/08/2000" // HAVING expirationDate LIKE '20/08/2000'
    },
    group: "product.id", // GROUP BYs are printed exactly like they are passed
    order: "STR_TO_DATE(expirationDate, '%d/%m/%Y')", // ORDERS are printed exactly like they are passed
    limit: 1000,
    offset: 10,
});
```

__SELECT OBJECT__
- SelectObject can be a String, array of strings (they will be joined together with ",") or a normal object;
```js
// This will be "SELECT client.id, client.name as clientName, clientRequest.productId"
const selectString = `client.id, client.name as clientName, clientRequest.productId`
// This will also be "SELECT client.id, client.name as clientName, clientRequest.productId"
const selectArrayString = [
    `client.id`,
    `client.name as clientName`,
    `clientRequest.productId`
]
// This will also be "SELECT client.id, client.name as clientName, clientRequest.productId"
const selectObject = {
    id: 'client.id',
    clientName: 'client.name',
    productId: 'clientRequest.productId',
}
// The result will be SELECT client.id, client.name as clientName, clientRequest.productId FROM client
QueryBuilder.select('client', {
    select: selectString || selectArrayString || selectObject,
})
```
__WHERE OBJECT__
WhereObject can be a string, array of strings (will be joined with `AND` or `OR`) or an object
```js
// This will be "WHERE id = 1 OR name LIKE 'john' OR clientRequest.productId IS NULL"
const whereString = `id = 1 OR name LIKE 'john' OR clientRequest.productId IS NULL`
// This will also be "WHERE id = 1 OR name LIKE 'john' OR clientRequest.productId IS NULL"
const whereArrayString = [
    `__OR__`, // this will make the glue between the String an "OR", if not passed will be "AND" by default
    `id = 1`,
    `name LIKE 'john'`,
    `clientRequest.productId IS NULL`,
]
// This will also be "WHERE id = 1 OR name LIKE 'john' OR clientRequest.productId IS NULL"
const whereObject = {
    __OR__: true, // this will make the glue between the String an "OR", if not passed will be "AND" by default
    id: 1,
    name: `__LIKE__john`,
    'clientRequest.productId': null
}
// The result will be SELECT client.* FROM client WHERE id = 1 OR name LIKE 'john' OR clientRequest.productId IS NULL
QueryBuilder.select('client', {
    where: whereString || whereArrayString || whereObject,
})
```
__WHERE OPERATORS__
You can specify any SQL operator passing `__{operator_name}__`
Those are all operators: ['=', '>=', '<=', '<>', '>', '<', '!=', 'LIKE', 'IS'] between double underscore
```js
const whereOperators = {
    score: '__>__300', // score > 300
    isAlive: '__IS__NOT FALSE', // isAlive IS NOT FALSE
    size: '__!=__5' // size != 5
}
```
__WHERE TRICKS__
- To use IN pass an array
- To use BETWEEN use the tag `__BETWEEN__`
```js
const whereIn = {
    id: [1,2,3,4,5,'b'] // id IN (1,2,3,4,5,'b')
}
const whereBetween = {
    date: `"2020-10-10"__BETWEEN__"2021-10-10"` // (date BETWEEN "2020-10-10" AND "2021-10-10")
}
// If you use __WHERE__ as a key of the object, that's going to conside is another where
// That is usefull when you want to use array of string or a single string in your WHERE, combined with the advantages of the
// whereObject, or if you want to use the same key twice, that's also possible with this setup.
const whereInsideWhere = {
    __OR__: true,
    id: 1,
    name: '__LIKE__pedro',
    __WHERE__: {
        name: '__LIKE__joao',
        __WHERE__: [
            `size = 1`,
            `score >= 300`
        ]
    }
}
// WHERE id = 1 OR name LIKE 'pedro' OR name LIKE 'joao' AND size = 1 AND score >= 300
```
__WHERE LIKE__
- To use LIKE with "%" >>> `__%__`
- To use LIKE with "_" >>> `__?__`
```js
const whereLike = {
    name: "__%__silva", // name LIKE "%silva"
    description: "__?__lack", // description LIKE "_lack"
    color: "__LIKE__red", // color LIKE "red"
}
```
__WHERE EXPRESSION__
- To use a string like an expression, and not a STRING type inside a query, just make sure that the String contains the tag `__EXPRESSION__` (That also works on INSERTS)
- You can also use the key `__EXPRESSION__` on the object, the string will be used just like
```js
const whereExpression = {
    date: `__EXPRESSION__SQL_TO_DATE(DATE(), "%d/%m/%s")`, // date = SQL_TO_DATE(DATE(), "%d/%m/%s")
    age: `__>=____EXPRESSION__CALC_AGE_IN_YEARS(birthDate)`, // age >= CALC_AGE_IN_YEARS(birthDate)
}
```

__WHERE SPECIAL VALUES__
- false becomes IS FALSE
- true becomes IS TRUE
- null and undefined becomes IS NULL
```js
const whereSpecialValues = {
    id: null, // id IS NULL
    isProgrammer: true, // isProgrammer IS TRUE
    isHealthy: false, // isHealthy IS FALSE
    isGood: undefined, // isGood IS NULL
}
```

__JOIN OBJECT__
- Joins can be either an array of objects, or a single object for a single join;
- They receive table, on, and optionally a type, select and the schema from the table;
- If no type is passed, default is `INNER`;
- The select will be appened to the "normal" selects;
- The "ON" can be build the same way the WHERE can be build;
- If the schema is passed to the join object, it will have preference over the QueryBuilder schema;
```js
const join = [
    {
        table: 'client',
        on: 'client.id = product.clientId',
        type: 'left',
        select: {
            name: 'client.name'
        }
    },
    {
        schema: 'products',
        table: 'productFile',
        on: {
            'productFile.id': 'product.productFileId'
        },
    }
]
```

__SELECT METHOD__
- Join every query object above to build a single SELECT query;
- Includes: select, join, where, having, order, group, limit, offset, schema;
```js
const query = QueryBuilder.select('table1', {
    select: '*', // See SELECT OBJECT to know more
    join: {table: 'table2', on: 'table2.id = table1.table2Id'}, // See JOIN OBJECT to know more
    where: {id: 1}, // See WHERE OBJECT to know more
    having: {fieldName: "__LIKE__column"}, // See WHERE OBJECT to know more
    group: 'table1.id', // Literal string
    order: 'column DESC', // Literal string
    limit: 10,
    offset: 15,
    schema: 'schema1' // Will have preference over the schema specified in setSchema() method
})
```

__INSERT METHOD__
- Build an insert query;
- The params are table name and the row or rows to insert;
```js
const query = QueryBuilder.insert('table', [
    {name: 'test', someId: '__EXPRESSION__(SELECT id FROM someTable)'}, // __EXPRESSION__ will make the string a SQL EXPRESSION
    {name: 'test2', someId: null}, // All special types works normally like in WHERE object
    {name: 'test2', someId: false},
])
const querySingleRow = QueryBuilder.insert('table',{singleRow: true}) // Inserts only one row
```

__UPDATE METHOD__
- Build an update query;
- The params are the table name, data to update (object) and the where object;
```js
const query = QueryBuilder.update('table', 
{name: 'newName'}, // Columns and values to update
{id: 1} // See WHERE OBJECT to know more
)
```

__DELETE METHOD__
- Build a delete query;
- The params are the table to delete from and the where object;
```js
const query = QueryBuilder.delete('table', 
{id: 1} // See WHERE OBJECT to know more
)
```