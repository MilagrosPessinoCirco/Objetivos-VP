import { Usuario } from '../../entities';
import { Lista, Rol } from '../../utils/Constants';
import { IPersonValue } from '../../utils/Mappers';
import GrupoRolMock from './GrupoRolMock';
import IGrupoRolDataSource from './IGrupoRolDataSource';
import { IUsuarioRolService } from './IUsuarioRolService';
import IUsuarioDataSource from './IUsuarioDataSource';
import UsuarioMock from './UsuarioMock';
import UsuarioRolService from './UsuarioRolService';

export type PasoFallido = 'lista' | 'grupo-agregar' | 'grupo-quitar';

export interface IFallaInyectada {
	paso: PasoFallido;
	veces?: number;
	deshacer?: boolean;
}

class Inyector {
	private restantes: number;
	private deshacerPendiente: boolean = false;
	private falla?: IFallaInyectada;

	constructor(falla?: IFallaInyectada) {
		this.falla = falla;
		this.restantes = falla?.veces ?? 1;
	}

	public escribir(paso?: PasoFallido): void {
		if (!this.falla) {
			return;
		}
		if (this.deshacerPendiente) {
			this.deshacerPendiente = false;
			throw new Error('Falla simulada al deshacer.');
		}
		if (paso === this.falla.paso && this.restantes > 0) {
			this.restantes--;
			this.deshacerPendiente = this.falla.deshacer === true;
			throw new Error(`Falla simulada en el paso ${paso}.`);
		}
	}
}

class UsuariosConFalla implements IUsuarioDataSource {
	public listTitle: string = Lista.Usuario;
	private base: UsuarioMock;
	private inyector: Inyector;

	constructor(base: UsuarioMock, inyector: Inyector) {
		this.base = base;
		this.inyector = inyector;
	}

	public getItems(): Promise<Usuario[]> {
		return this.base.getItems();
	}

	public getCurrentUser(): Promise<IPersonValue> {
		return this.base.getCurrentUser();
	}

	public getCurrentUserGroups(): Promise<string[]> {
		return this.base.getCurrentUserGroups();
	}

	public getById(itemId: number): Promise<Usuario> {
		return this.base.getById(itemId);
	}

	public add(item: Usuario): Promise<Usuario> {
		this.inyector.escribir('lista');
		return this.base.add(item);
	}

	public edit(item: Usuario): Promise<Usuario> {
		this.inyector.escribir('lista');
		return this.base.edit(item);
	}

	public delete(itemId: number): Promise<void> {
		this.inyector.escribir();
		return this.base.delete(itemId);
	}
}

class GruposConFalla implements IGrupoRolDataSource {
	private base: GrupoRolMock;
	private inyector: Inyector;

	constructor(base: GrupoRolMock, inyector: Inyector) {
		this.base = base;
		this.inyector = inyector;
	}

	public getGruposDe(personaId: number): Promise<Rol[]> {
		return this.base.getGruposDe(personaId);
	}

	public agregar(personaId: number, rol: Rol): Promise<void> {
		this.inyector.escribir('grupo-agregar');
		return this.base.agregar(personaId, rol);
	}

	public quitar(personaId: number, rol: Rol): Promise<void> {
		this.inyector.escribir('grupo-quitar');
		return this.base.quitar(personaId, rol);
	}
}

export const createUsuarioRolServiceMock = (falla?: IFallaInyectada): IUsuarioRolService => {
	const inyector = new Inyector(falla);
	return new UsuarioRolService(new UsuariosConFalla(new UsuarioMock(), inyector), new GruposConFalla(new GrupoRolMock(), inyector));
};
