import { Rol } from '../../utils/Constants';
import IGrupoRolDataSource from './IGrupoRolDataSource';
import { BARBARA, MARIA, USUARIO_PRUEBA } from './UsuarioMock';

export default class GrupoRolMock implements IGrupoRolDataSource {
	private pertenencias: Record<number, Rol[]> = {
		[USUARIO_PRUEBA.Id]: [Rol.Usuario],
		[BARBARA.Id]: [Rol.Usuario],
		[MARIA.Id]: [Rol.CargadorObjetivo]
	};

	public getGruposDe(personaId: number): Promise<Rol[]> {
		return Promise.resolve((this.pertenencias[personaId] ?? []).slice());
	}

	public agregar(personaId: number, rol: Rol): Promise<void> {
		const actuales = this.pertenencias[personaId] ?? [];
		this.pertenencias[personaId] = actuales.indexOf(rol) >= 0 ? actuales : actuales.concat([rol]);
		return Promise.resolve();
	}

	public quitar(personaId: number, rol: Rol): Promise<void> {
		this.pertenencias[personaId] = (this.pertenencias[personaId] ?? []).filter((item) => item !== rol);
		return Promise.resolve();
	}

}
