import { Usuario } from '../../entities';
import { Lista } from '../../utils/Constants';
import { IPersonValue } from '../../utils/Mappers';
import IUsuarioDataSource from './IUsuarioDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe el usuario solicitado en el mock.';

export const USUARIO_PRUEBA: IPersonValue = { Id: 10, Title: 'Usuario de prueba', EMail: 'usuario.prueba@ejemplo.com' };
export const BARBARA: IPersonValue = { Id: 11, Title: 'Bárbara Adán', EMail: 'barbara.adan@ejemplo.com' };
export const MARIA: IPersonValue = { Id: 12, Title: 'María Martha Grotz', EMail: 'maria.grotz@ejemplo.com' };
const INACTIVO: IPersonValue = { Id: 13, Title: 'Usuario inactivo', EMail: 'usuario.inactivo@ejemplo.com' };

const createUsuario = (id: number, persona: IPersonValue, activo: boolean): Usuario =>
	new Usuario({ Id: id, Title: persona.Title, Usuario: persona, Activo: activo });

let usuarios: Usuario[] = [
	createUsuario(1, USUARIO_PRUEBA, true),
	createUsuario(2, BARBARA, true),
	createUsuario(3, MARIA, true),
	createUsuario(4, INACTIVO, false)
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

export default class UsuarioMock implements IUsuarioDataSource {
	public listTitle: string = Lista.Usuario;

	public getItems(): Promise<Usuario[]> {
		return Promise.resolve(usuarios.slice());
	}

	public getCurrentUser(): Promise<IPersonValue> {
		return Promise.resolve(USUARIO_PRUEBA);
	}

	public add(item: Usuario): Promise<Usuario> {
		const nextId = usuarios.reduce((maxId, usuario) => Math.max(maxId, usuario.Id ?? 0), 0) + 1;
		const created = Object.assign(new Usuario(), item, { Id: nextId });
		usuarios = usuarios.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: Usuario): Promise<Usuario> {
		if (!usuarios.some((usuario) => usuario.Id === item.Id)) {
			return Promise.reject(notFoundError());
		}
		const edited = Object.assign(new Usuario(), item);
		usuarios = usuarios.map((usuario) => (usuario.Id === edited.Id ? edited : usuario));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		usuarios = usuarios.filter((usuario) => usuario.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<Usuario> {
		const usuario = usuarios.filter((item) => item.Id === itemId)[0];
		return usuario ? Promise.resolve(usuario) : Promise.reject(notFoundError());
	}
}
