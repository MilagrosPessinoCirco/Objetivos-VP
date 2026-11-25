import { Usuario } from '../../entities';
import { Rol } from '../../utils/Constants';
import { assertPermiso, getPermisos, getRolFromGroups, isPermisoDenegadoError } from '../../utils/Permisos';
import GrupoRolDataSource from './GrupoRolDataSource';
import IGrupoRolDataSource from './IGrupoRolDataSource';
import { IUsuarioRolService, UsuarioRolError } from './IUsuarioRolService';
import IUsuarioDataSource from './IUsuarioDataSource';
import UsuarioDataSource from './UsuarioDataSource';

type PasoDeshacer = () => Promise<void>;

export default class UsuarioRolService implements IUsuarioRolService {
	private usuarios: IUsuarioDataSource;
	private grupos: IGrupoRolDataSource;

	constructor(usuarios?: IUsuarioDataSource, grupos?: IGrupoRolDataSource) {
		this.usuarios = usuarios ?? new UsuarioDataSource();
		this.grupos = grupos ?? new GrupoRolDataSource();
	}

	public async altaUsuario(usuario: Usuario): Promise<Usuario> {
		await this.assertAdministrador();
		const personaId = usuario.Usuario?.Id;
		const rol = usuario.Rol;
		if (personaId === undefined || rol === undefined) {
			throw new Error('El alta de un usuario requiere la persona y su rol.');
		}
		const deshacer: PasoDeshacer[] = [];
		try {
			const existente = (await this.usuarios.getItems()).filter((item) => item.Usuario?.Id === personaId)[0];
			let guardado: Usuario;
			if (existente) {
				guardado = await this.usuarios.edit(Object.assign(new Usuario(), existente, usuario, { Id: existente.Id, Activo: true }));
				deshacer.push(async () => { await this.usuarios.edit(existente); });
			}
			else {
				guardado = await this.usuarios.add(Object.assign(new Usuario(), usuario, { Activo: true }));
				deshacer.push(() => this.usuarios.delete(guardado.Id as number));
			}
			const yaEstaba = (await this.grupos.getGruposDe(personaId)).indexOf(rol) >= 0;
			await this.grupos.agregar(personaId, rol);
			if (!yaEstaba) {
				deshacer.push(() => this.grupos.quitar(personaId, rol));
			}
			return guardado;
		}
		catch (error) {
			throw await this.deshacer(deshacer, error);
		}
	}

	public async cambiarRol(usuarioId: number, rol: Rol): Promise<Usuario> {
		await this.assertAdministrador();
		const previo = await this.usuarios.getById(usuarioId);
		const personaId = this.getPersonaId(previo);
		const actuales = await this.grupos.getGruposDe(personaId);
		if (previo.Rol === rol && actuales.length === 1 && actuales[0] === rol) {
			return previo;
		}
		const deshacer: PasoDeshacer[] = [];
		try {
			const editado = await this.usuarios.edit(Object.assign(new Usuario(), previo, { Rol: rol }));
			deshacer.push(async () => { await this.usuarios.edit(previo); });
			if (actuales.indexOf(rol) < 0) {
				await this.grupos.agregar(personaId, rol);
				deshacer.push(() => this.grupos.quitar(personaId, rol));
			}
			for (const grupo of actuales.filter((item) => item !== rol)) {
				await this.grupos.quitar(personaId, grupo);
				deshacer.push(() => this.grupos.agregar(personaId, grupo));
			}
			return editado;
		}
		catch (error) {
			throw await this.deshacer(deshacer, error);
		}
	}

	public async bajaUsuario(usuarioId: number): Promise<Usuario> {
		await this.assertAdministrador();
		const previo = await this.usuarios.getById(usuarioId);
		const personaId = this.getPersonaId(previo);
		const actuales = await this.grupos.getGruposDe(personaId);
		const deshacer: PasoDeshacer[] = [];
		try {
			const editado = await this.usuarios.edit(Object.assign(new Usuario(), previo, { Activo: false }));
			deshacer.push(async () => { await this.usuarios.edit(previo); });
			for (const grupo of actuales) {
				await this.grupos.quitar(personaId, grupo);
				deshacer.push(() => this.grupos.agregar(personaId, grupo));
			}
			return editado;
		}
		catch (error) {
			throw await this.deshacer(deshacer, error);
		}
	}

	private async assertAdministrador(): Promise<void> {
		const rol = getRolFromGroups(await this.usuarios.getCurrentUserGroups());
		const currentUser = await this.usuarios.getCurrentUser();
		assertPermiso(rol !== undefined && getPermisos(rol, currentUser).canManageUsuarios);
	}

	private getPersonaId(usuario: Usuario): number {
		const personaId = usuario.Usuario?.Id;
		if (personaId === undefined) {
			throw new Error('El elemento de la lista Usuario no tiene una persona asociada.');
		}
		return personaId;
	}

	private async deshacer(pasos: PasoDeshacer[], causa: unknown): Promise<Error> {
		if (isPermisoDenegadoError(causa)) {
			return causa as Error;
		}
		console.error('No se pudo completar la operación sobre el usuario y sus grupos; se deshace lo hecho.', causa);
		let deshecho = true;
		for (const paso of pasos.slice().reverse()) {
			try {
				await paso();
			}
			catch (error) {
				console.error('No se pudo deshacer un paso de la operación sobre el usuario y sus grupos.', error);
				deshecho = false;
			}
		}
		return new UsuarioRolError(deshecho, causa);
	}

}
