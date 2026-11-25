import { Usuario } from '../../entities';
import { Rol } from '../../utils/Constants';

export interface IUsuarioRolService {

	altaUsuario(usuario: Usuario): Promise<Usuario>;
	cambiarRol(usuarioId: number, rol: Rol): Promise<Usuario>;
	bajaUsuario(usuarioId: number): Promise<Usuario>;

}

export class UsuarioRolError extends Error {
	public deshecho: boolean;
	public causa: unknown;

	constructor(deshecho: boolean, causa: unknown) {
		super('No se pudo completar la operación sobre el usuario y sus grupos.');
		this.name = 'UsuarioRolError';
		this.deshecho = deshecho;
		this.causa = causa;
		Object.setPrototypeOf(this, UsuarioRolError.prototype);
	}
}
