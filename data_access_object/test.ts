import DataAccessObject from '.';
import { DataPacket } from './types';

const dao = new DataAccessObject({
	user: 'root',
	password: '1234',
	database: 'ambisistest',
	host: 'localhost',
	port: 3306,
});

const main = async () => {
	console.time('strees_test');
	await Promise.all(
		Array(100)
			.fill(null)
			.map((_, i) =>
				dao.execute({
					statement: `SELECT * FROM empreendimento where id = ?`,
					values: [1],
				})
			)
	);
	console.timeEnd('strees_test');

	// console.time('insert');
	// const insertResult = await dao.insert('historico', [
	// 	{
	// 		module: 'teste',
	// 		moduleId: 3,
	// 		data: new Date(),
	// 		texto: 'texto do histórico',
	// 		usuarioId: 1,
	// 	},
	// 	{
	// 		module: 'teste',
	// 		moduleId: 2,
	// 		data: new Date(),
	// 		texto: 'texto do histórico',
	// 		usuarioId: 1,
	// 	},
	// 	{
	// 		module: 'teste',
	// 		moduleId: 3,
	// 		data: new Date(),
	// 		texto: 'texto do histórico',
	// 		usuarioId: 1,
	// 	},
	// ]);
	// console.timeEnd('insert');
	// console.log(insertResult);
	// // DELETE RESULT
	// console.log('\n\nDELETE RESULT\n\n');
	// const deleteResult = await dao.delete(
	// 	'historico',
	// 	{ id: 41 },
	// 	{ ignore: true }
	// );
	// console.log(deleteResult);
	// const result = await dao.select(
	// 	{
	// 		from: 'empreendimento e',
	// 		columns: ['id', 'razaoSocial'],
	// 		join: [
	// 			{
	// 				table: 'licenca l',
	// 				on: { __col_relation: { empreendimentoId: 'id' } },
	// 				type: 'left',
	// 				columns: { licencaId: 'id', numeroLicenca: 'numero' },
	// 			},
	// 			{
	// 				table: 'historico',
	// 				on: {
	// 					__col_relation: { moduleId: 'id' },
	// 					module: 'licenca',
	// 				},
	// 				columns: { historicoId: 'id', historicoTexto: 'texto' },
	// 				type: 'left',
	// 			},
	// 		],
	// 	},
	// 	{
	// 		groupData: {
	// 			by: 'id',
	// 			columnGroups: {
	// 				licencas: {
	// 					id: 'licencaId',
	// 					numero: 'numeroLicenca',
	// 				},
	// 			},
	// 		},
	// 	}
	// );
	// // SELECT RESULT
	// console.log('\n\nSELECT RESULT\n\n');
	// (result as DataPacket).forEach((v) => console.log(v));
};
main();
