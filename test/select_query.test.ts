import { QueryBuilder } from '..';
import { sqlCol } from '../QueryBuilder/utils';

const query = QueryBuilder.select({
	columns: [
		{
			teste: 'dffr',
			a: 'asd',
		},
	], //this.clienteColumns,
	from: 'cliente c',
	join: [
		{
			table: 'clientecontato cc',
			on: { __col_relation: { 'cc.clienteId': 'c.id' } },
			columns: {
				contatoId: 'cc.id',
				contatoNome: 'cc.nome',
				contatoTelefone: 'cc.telefone',
				contatoCelular: 'cc.celular',
				contatoEmail: 'cc.email',
				contatoCargo: 'cc.cargo',
			},

			type: 'left',
		},
		{
			table: 'responsavel r',
			on: { __col_relation: { 'r.moduleId': 'c.id' } },
			type: 'left',
		},
		{
			table: 'auth_usuario au',
			on: { __col_relation: { 'au.id': 'r.responsavelId' } },
			columns: {
				responsavelId: 'r.responsavelId',
				responsavelNome: 'au.nome',
			},
			type: 'left',
		},
		{
			table: 'clienteartfile caf',
			on: { __col_relation: { 'caf.clienteId': 'c.id' } },
			columns: {
				artFileId: 'caf.id',
				artFileNumero: 'caf.numero',
				artFileValidade: 'caf.validade',
				artFileFinalizado: 'caf.finalizado',
				artFileArquivoId: 'caf.arquivoId',
			},
			type: 'left',
		},
		{
			table: 'clientefile cf',
			on: { __col_relation: { 'cf.clienteId': 'c.id' } },
			columns: {
				clienteFileId: 'cf.id',
				clienteFileDescricao: 'cf.descricao',
				clienteFileValidade: 'cf.validade',
				clienteFileFinalizado: 'cf.finalizado',
				clienteFileArquivoId: 'cf.arquivoId',
			},
			type: 'left',
		},
		{
			table: 'clientelogin cl',
			on: { __col_relation: { 'cl.clienteId': 'c.id' } },
			columns: {
				clienteLoginId: 'cl.id',
				clienteLoginDescricao: 'cl.descricao',
				clienteLoginLink: 'cl.link',
				clienteLoginLogin: 'cl.login',
				clienteLoginSenha: 'cl.senha',
			},
			type: 'left',
		},
	],
});
console.log(query);
