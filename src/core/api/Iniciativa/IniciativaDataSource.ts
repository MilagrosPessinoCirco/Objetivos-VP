import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { Iniciativa } from "../../entities";
import IIniciativaDataSource from './IIniciativaDataSource';

const TOP_DEFAULT = 5000;

export default class IniciativaDataSource implements IIniciativaDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'Nombre',
		'Descripcion',
		'Objetivo/Id', 'Objetivo/Title',
		'Responsables/Id', 'Responsables/Title', 'Responsables/EMail',
		'Peso',
		'Estado',
		'FechaInicio',
		'FechaCompromiso',
		'Area/Id', 'Area/Title',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'Objetivo', 'Responsables', 'Area'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.Iniciativa;
	}

	public async getItems(): Promise<Array<Iniciativa>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.top(TOP_DEFAULT)();
		return items.map(item => new Iniciativa(item));
	}

	public async getFilteredItems(objetivoId: number): Promise<Array<Iniciativa>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.filter(`ObjetivoId eq ${objetivoId}`)
			.top(TOP_DEFAULT)();
		return items.map(item => new Iniciativa(item));
	}

	public add(item: Iniciativa): Promise<Iniciativa> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: Iniciativa): Promise<Iniciativa> {
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

	public async getById(itemId: number): Promise<Iniciativa> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new Iniciativa(item));
	}

}
