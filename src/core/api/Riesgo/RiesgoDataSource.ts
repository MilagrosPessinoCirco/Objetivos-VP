import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { Riesgo } from "../../entities";
import IRiesgoDataSource from './IRiesgoDataSource';

const TOP_DEFAULT = 5000;

export default class RiesgoDataSource implements IRiesgoDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'Tarea/Id', 'Tarea/Title',
		'Estado',
		'RequiereDecision',
		'FechaResolucion',
		'Descripcion',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'Tarea'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.Riesgo;
	}

	public async getItems(): Promise<Array<Riesgo>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.top(TOP_DEFAULT)();
		return items.map(item => new Riesgo(item));
	}

	public async getFilteredItems(tareaId: number): Promise<Array<Riesgo>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.filter(`TareaId eq ${tareaId}`)
			.top(TOP_DEFAULT)();
		return items.map(item => new Riesgo(item));
	}

	public add(item: Riesgo): Promise<Riesgo> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: Riesgo): Promise<Riesgo> {
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

	public async getById(itemId: number): Promise<Riesgo> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new Riesgo(item));
	}

}
