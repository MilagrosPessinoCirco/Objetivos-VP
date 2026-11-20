import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { Palanca } from "../../entities";
import IPalancaDataSource from './IPalancaDataSource';

const TOP_DEFAULT = 5000;
const ORDER_FIELD = 'Nombre';

export default class PalancaDataSource implements IPalancaDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'Nombre',
		'Descripcion',
		'Activa',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.Palanca;
	}

	public async getItems(): Promise<Array<Palanca>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.orderBy(ORDER_FIELD, true)
			.top(TOP_DEFAULT)();
		return items.map(item => new Palanca(item));
	}

	public async getActiveItems(): Promise<Array<Palanca>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.filter('Activa eq 1')
			.orderBy(ORDER_FIELD, true)
			.top(TOP_DEFAULT)();
		return items.map(item => new Palanca(item));
	}

	public add(item: Palanca): Promise<Palanca> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: Palanca): Promise<Palanca> {
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

	public async getById(itemId: number): Promise<Palanca> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new Palanca(item));
	}

}
