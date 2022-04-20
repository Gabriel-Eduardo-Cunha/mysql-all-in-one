
# mysql-all-in-one

All tools to connect, execute commands and build raw queries for Mysql databases.

It's safe, fast and easy to implement. This package is a Wrapper around `mysql2` package



## Installation

Installation is done using the npm install command:

```
$ npm install mysql-all-in-one
```
## Features

* Data access object;
* SQL Injection proof;
* Prepared statements to execute faster queries;
* All basic commands: `SELECT`, `INSERT`, `UPDATE`, `DELETE` and `UPSERT`;
* Create database dumps;
* Easy to execute commands on multiple databases;
## Quick start

### Data Access Object

Data access object (DAO) will connect to the database and execute commands (as prepared statements by default).

```js
const { DataAccessObject } = require('mysql-all-in-one');

const dao = new DataAccessObject({
	host: 'localhost',
	user: 'root',
	password: '1234',
	port: 3306,
	database: 'test_database',
});
const main = async () => {
	const result = await dao.select({ from: 'my_table' });
	console.log(result); //Will list all rows from a table "my_table" located at a database "test_database"
};
main();

```

### Query Builder

Query builder simply returns Mysql Query commands as string. (This module is used by DataAccessObject to build queries).

```js
const { QueryBuilder } = require('mysql-all-in-one');
// OR
// const QueryBuilder = require('mysql-all-in-one/QueryBuilder');

const query = QueryBuilder.select({ from: 'my_table', where: { id: 1 } });
console.log(query);
// >>> SELECT `my_table`.* FROM `my_table` WHERE (`my_table`.`id` = 1);

```
## Examples

### Data Access Object

`DataAccessObject` uses `QueryBuilder` under the hood. So for example, everything that works on the method `select` from `QueryBuilder` also works on `select` command from `DataAccessObject`.

#### SELECT

###### WHERE

Simple where object:

```js
dao.select({
	from: 'table_user',
	where: {
		name: { like: 'foo' },
		id: 1,
		active: null,
		permission: {isnot: null}
	},
});
```

Or between conditions:

```js
dao.select({
	from: 'table_user',
	where: {
		__or: true, // All conditions inside this object will use OR between them.
		id: 1,
		active: 1,
	},
});
```

Array with multiple objects:

```js
dao.select({
	from: 'table_user',
	where: [
		'__or', // If first position is "__or" all conditions inside this array will use OR between them.
		{ id: 1, },
		{ id: 2, },
	]
});
```

Complex nesting to achieve any AND/OR relation needed:

```js
dao.select({
	from: 'table_user',
	where: [
		'__or',
		[ // Unlimited nestings are possible, allowing to create any condition combination
			[ // Every array or object will be inside it's own bracket.
				'__or',
				{
					name: { like: 'foo_bar' },
					id: 4,
				},
			],
			{name: { like: 'bar' },}
		],
		{
			name: { like: 'foo' },
			id: 1,
			active: null,
			permission: {isnot: null}
		},
		{
			id: 2,
		}
	]
});
```

Custom SQL Expressions is also allowed:

```js
const { sqlExpression } = QueryBuilder;

const name = 'john';
const birth = new Date(2002, 8, 30);

dao.select({
	from: 'table_user',
	where: [
		// Also accepts sqlExpression objects to create custom where commands (automatically escape variables).
		sqlExpression`table_user.name LIKE ${name}`, // >>> table_user.name LIKE "john"
		sqlExpression`table_user.birthdate = ${birth}`, // >>> table_user.birthdate = '2002-09-30 00:00:00.000'
	],
});
```