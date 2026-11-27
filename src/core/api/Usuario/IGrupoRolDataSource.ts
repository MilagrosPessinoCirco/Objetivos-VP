import { Rol } from '../../utils/Constants';

export default interface IGrupoRolDataSource {

	getGruposDe(personaId: number): Promise<Rol[]>;
	agregar(personaId: number, rol: Rol): Promise<void>;
	quitar(personaId: number, rol: Rol): Promise<void>;

}
