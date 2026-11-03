import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { ComentarioResultadoClave } from "../../entities";
import IComentarioResultadoClaveDataSource from './IComentarioResultadoClaveDataSource';

const TOP_DEFAULT = 5000;

export default class ComentarioResultadoClaveDataSource implements IComentarioResultadoClaveDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'ResultadoClave/Id', 'ResultadoClave/Title',
		'Comentario',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'ResultadoClave'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.ComentarioResultadoClave;
	}

	public async getItems(): Promise<Array<ComentarioResultadoClave>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.top(TOP_DEFAULT)();
		return items.map(item => new ComentarioResultadoClave(item));
	}

	public add(item: ComentarioResultadoClave): Promise<ComentarioResultadoClave> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: ComentarioResultadoClave): Promise<ComentarioResultadoClave> {
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

	public async getById(itemId: number): Promise<ComentarioResultadoClave> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new ComentarioResultadoClave(item));
	}

}
