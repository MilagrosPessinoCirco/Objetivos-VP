import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { Usuario } from "../../entities";
import IUsuarioDataSource from './IUsuarioDataSource';

const TOP_DEFAULT = 5000;

export default class UsuarioDataSource implements IUsuarioDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'Usuario/Id', 'Usuario/Title', 'Usuario/EMail',
		'Departamento/Id', 'Departamento/Title',
		'Gerencia/Id', 'Gerencia/Title',
		'Area/Id', 'Area/Title',
		'Activo',
		'Rol',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'Usuario', 'Departamento', 'Gerencia', 'Area'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.Usuario;
	}

	public async getItems(): Promise<Array<Usuario>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.top(TOP_DEFAULT)();
		return items.map(item => new Usuario(item));
	}

	public add(item: Usuario): Promise<Usuario> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: Usuario): Promise<Usuario> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(item.Id as number)
			.update(listItem)
			.then(() => {
				return this.getById(item.Id as number);
			});
	}

	public delete(itemId: number): Promise<void> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.delete();
	}

	public async getById(itemId: number): Promise<Usuario> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new Usuario(item));
	}

}
