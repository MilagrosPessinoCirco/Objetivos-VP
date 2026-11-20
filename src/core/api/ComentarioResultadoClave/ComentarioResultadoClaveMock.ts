import { ComentarioResultadoClave } from '../../entities';
import { Lista } from '../../utils/Constants';
import { ILookupValue, IPersonValue } from '../../utils/Mappers';
import { BARBARA, USUARIO_PRUEBA } from '../Usuario/UsuarioMock';
import IComentarioResultadoClaveDataSource from './IComentarioResultadoClaveDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe el comentario solicitado en el mock.';

const RESULTADO_INFORMES: ILookupValue = { Id: 1, Title: 'Informes comerciales publicados' };

const createComentario = (id: number, resultadoClave: ILookupValue, comentario: string, created: string, author: IPersonValue): ComentarioResultadoClave =>
	new ComentarioResultadoClave({ Id: id, ResultadoClave: resultadoClave, Comentario: comentario, Created: created, Author: author });

const byNewest = (a: ComentarioResultadoClave, b: ComentarioResultadoClave): number =>
	(b.Created?.getTime() ?? 0) - (a.Created?.getTime() ?? 0) || (b.Id ?? 0) - (a.Id ?? 0);

let comentarios: ComentarioResultadoClave[] = [
	createComentario(1, RESULTADO_INFORMES, 'Se relevaron los primeros informes.', '2026-03-05T12:00:00', BARBARA),
	createComentario(2, RESULTADO_INFORMES, 'Quedan pendientes los informes del interior.', '2026-04-20T12:00:00', USUARIO_PRUEBA)
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

export default class ComentarioResultadoClaveMock implements IComentarioResultadoClaveDataSource {
	public listTitle: string = Lista.ComentarioResultadoClave;

	public getItems(): Promise<ComentarioResultadoClave[]> {
		return Promise.resolve(comentarios.slice());
	}

	public getFilteredItems(resultadoClaveId: number): Promise<ComentarioResultadoClave[]> {
		return Promise.resolve(comentarios.filter((comentario) => comentario.ResultadoClave?.Id === resultadoClaveId).sort(byNewest));
	}

	public add(item: ComentarioResultadoClave): Promise<ComentarioResultadoClave> {
		const nextId = comentarios.reduce((maxId, comentario) => Math.max(maxId, comentario.Id ?? 0), 0) + 1;
		const created = Object.assign(new ComentarioResultadoClave(), item, { Id: nextId, Created: new Date(), Author: USUARIO_PRUEBA });
		comentarios = comentarios.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: ComentarioResultadoClave): Promise<ComentarioResultadoClave> {
		if (!comentarios.some((comentario) => comentario.Id === item.Id)) {
			return Promise.reject(notFoundError());
		}
		const edited = Object.assign(new ComentarioResultadoClave(), item);
		comentarios = comentarios.map((comentario) => (comentario.Id === edited.Id ? edited : comentario));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		comentarios = comentarios.filter((comentario) => comentario.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<ComentarioResultadoClave> {
		const comentario = comentarios.filter((item) => item.Id === itemId)[0];
		return comentario ? Promise.resolve(comentario) : Promise.reject(notFoundError());
	}
}
