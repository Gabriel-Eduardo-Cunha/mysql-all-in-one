# mysql-all-in-one
 All tools that a node developer needs to implements a connection and dataflow in a MYSQL database.

__Query_Builder__
The query builder module is capable of building queries from Javascript Objects, Arrays or plain Strings.

- require
```js
const {QueryBuilder} = require('mysql-all-in-one');

QueryBuilder.setSchema('shop'); // This will set the default schema of the queries.
```

- select
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
        __EXPRESSION__:  // The __EXPRESSION__ as a key will make the string be in the query exactly as it is.
            `(size = (SELECT size FROM secondaryProduct WHERE id = 1) OR size IS NULL)`,
    },
    having: { // works exactly like WHERE
        expirationDate: "__LIKE__20/08/2000" // expirationDate LIKE '20/08/2000'
    },
    group: "product.id",
    order: "STR_TO_DATE(expirationDate, '%d/%m/%Y')",

});
console.log(query);
```


