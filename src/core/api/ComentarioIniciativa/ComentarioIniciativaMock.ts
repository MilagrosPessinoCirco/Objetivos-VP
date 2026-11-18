import { ComentarioIniciativa } from '../../entities';
import { Lista } from '../../utils/Constants';
import { ILookupValue, IPersonValue } from '../../utils/Mappers';
import { BARBARA, MARIA, USUARIO_PRUEBA } from '../Usuario/UsuarioMock';
import IComentarioIniciativaDataSource from './IComentarioIniciativaDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe el comentario solicitado en el mock.';

const INICIATIVA_TABLERO: ILookupValue = { Id: 1, Title: 'Tablero de insights comerciales' };
const INICIATIVA_STORE: ILookupValue = { Id: 4, Title: 'YPF Store en estaciones' };

const createComentario = (id: number, iniciativa: ILookupValue, comentario: string, created: string, author: IPersonValue): ComentarioIniciativa =>
	new ComentarioIniciativa({ Id: id, Iniciativa: iniciativa, Comentario: comentario, Created: created, Author: author });

const byNewest = (a: ComentarioIniciativa, b: ComentarioIniciativa): number =>
	(b.Created?.getTime() ?? 0) - (a.Created?.getTime() ?? 0) || (b.Id ?? 0) - (a.Id ?? 0);

let comentarios: ComentarioIniciativa[] = [
	createComentario(1, INICIATIVA_TABLERO, 'Arrancamos con la definición del alcance.', '2026-02-01T12:00:00', MARIA),
	createComentario(2, INICIATIVA_TABLERO, 'Se acordó el calendario con las áreas.', '2026-03-10T12:00:00', USUARIO_PRUEBA),
	createComentario(3, INICIATIVA_STORE, 'Primera etapa en curso.', '2026-02-15T12:00:00', BARBARA)
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

export default class ComentarioIniciativaMock implements IComentarioIniciativaDataSource {
	public listTitle: string = Lista.ComentarioIniciativa;

	public getItems(): Promise<ComentarioIniciativa[]> {
		return Promise.resolve(comentarios.slice());
	}

	public getFilteredItems(iniciativaId: number): Promise<ComentarioIniciativa[]> {
		return Promise.resolve(comentarios.filter((comentario) => comentario.Iniciativa?.Id === iniciativaId).sort(byNewest));
	}

	public add(item: ComentarioIniciativa): Promise<ComentarioIniciativa> {
		const nextId = comentarios.reduce((maxId, comentario) => Math.max(maxId, comentario.Id ?? 0), 0) + 1;
		const created = Object.assign(new ComentarioIniciativa(), item, { Id: nextId, Created: new Date(), Author: USUARIO_PRUEBA });
		comentarios = comentarios.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: ComentarioIniciativa): Promise<ComentarioIniciativa> {
		if (!comentarios.some((comentario) => comentario.Id === item.Id)) {
			return Promise.reject(notFoundError());
		}
		const edited = Object.assign(new ComentarioIniciativa(), item);
		comentarios = comentarios.map((comentario) => (comentario.Id === edited.Id ? edited : comentario));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		comentarios = comentarios.filter((comentario) => comentario.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<ComentarioIniciativa> {
		const comentario = comentarios.filter((item) => item.Id === itemId)[0];
		return comentario ? Promise.resolve(comentario) : Promise.reject(notFoundError());
	}
}
