import { DataAccessObject, QueryBuilder } from "../";

const connectionConfig = {
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "ambisis01",
};

const dao = new DataAccessObject(connectionConfig, {
	usePreparedStatements: false,
});

(async () => {
	const transaction = await dao.startTransaction();
	try {
		await transaction.insert("arquivo", {
			module: "1",
			moduleId: 123,
			keyS3: "/row",
			name: "avc",
		});
		await transaction.insert("arquivo", {
			module: "2",
			moduleId: 123,
			keyS3: "/row",
			name: "avc",
		});
		await transaction.update(
			"arquivo",
			{ keyS3: "UPDATED_S3" },
			{ module: 2 }
		);

		await transaction.delete("arquivo", { module: 1 });
		// await transaction.delete("unknow_table" /* This causes an error */, {
		// 	module: 2,
		// });

		await transaction.commit();
	} catch (err) {
		await transaction.rollback();
		throw err;
	}

	await dao.dispose();
})();

// dao.getPoolConnection(async (connection) => {
// 	return new Promise<void>((res, rej) => {
// 		connection.beginTransaction(function (err) {
// 			if (err) {
// 				rej(err);
// 			}
// 			connection.query(
// 				QueryBuilder.insert(
// 					"arquivo",
// 					{
// 						module: "1",
// 						moduleId: 123,
// 						keyS3: "/row",
// 						name: "avc",
// 					},
// 					{ returnPreparedStatement: false }
// 				) as string,
// 				function (error, results, fields) {
// 					if (error) {
// 						return connection.rollback(function () {
// 							rej(error);
// 						});
// 					}
// 					connection.commit(function () {
// 						if (err) {
// 							return connection.rollback(function () {
// 								rej(err);
// 							});
// 						}
// 						res();
// 						console.log("success!");
// 					});
// 				}
// 			);
// 		});
// 	});
// });
