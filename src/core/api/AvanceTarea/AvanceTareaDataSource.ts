import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { AvanceTarea } from "../../entities";
import IAvanceTareaDataSource from './IAvanceTareaDataSource';

const TOP_DEFAULT = 5000;

export default class AvanceTareaDataSource implements IAvanceTareaDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'Tarea/Id', 'Tarea/Title',
		'Avance',
		'Estado',
		'Comentario',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'Tarea'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.AvanceTarea;
	}

	public async getItems(): Promise<Array<AvanceTarea>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.top(TOP_DEFAULT)();
		return items.map(item => new AvanceTarea(item));
	}

	public async getFilteredItems(tareaId: number): Promise<Array<AvanceTarea>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.filter(`TareaId eq ${tareaId}`)
			.top(TOP_DEFAULT)();
		return items.map(item => new AvanceTarea(item));
	}

	public add(item: AvanceTarea): Promise<AvanceTarea> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: AvanceTarea): Promise<AvanceTarea> {
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

	public async getById(itemId: number): Promise<AvanceTarea> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new AvanceTarea(item));
	}

}
