import { SPFI } from '@pnp/sp';
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Rol } from '../../utils/Constants';
import IGrupoRolDataSource from './IGrupoRolDataSource';

export default class GrupoRolDataSource implements IGrupoRolDataSource {
	private _sp: SPFI;

	constructor() {
		this._sp = getSP();
	}

	public async getGruposDe(personaId: number): Promise<Rol[]> {
		const groups: Array<{ Title: string }> = await this._sp.web.siteUsers.getById(personaId).groups.select('Title')();
		return Object.values(Rol).filter((rol) => groups.some((group) => group.Title === rol));
	}

	public async agregar(personaId: number, rol: Rol): Promise<void> {
		const user: { LoginName: string } = await this._sp.web.siteUsers.getById(personaId).select('LoginName')();
		await this._sp.web.siteGroups.getByName(rol).users.add(user.LoginName);
	}

	public async quitar(personaId: number, rol: Rol): Promise<void> {
		await this._sp.web.siteGroups.getByName(rol).users.removeById(personaId);
	}

}
