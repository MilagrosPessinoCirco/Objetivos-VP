import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { ComentarioIniciativa } from "../../entities";
import IComentarioIniciativaDataSource from './IComentarioIniciativaDataSource';

const TOP_DEFAULT = 5000;

export default class ComentarioIniciativaDataSource implements IComentarioIniciativaDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'Iniciativa/Id', 'Iniciativa/Title',
		'Comentario',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'Iniciativa'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.ComentarioIniciativa;
	}

	public async getItems(): Promise<Array<ComentarioIniciativa>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.top(TOP_DEFAULT)();
		return items.map(item => new ComentarioIniciativa(item));
	}

	public add(item: ComentarioIniciativa): Promise<ComentarioIniciativa> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: ComentarioIniciativa): Promise<ComentarioIniciativa> {
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

	public async getById(itemId: number): Promise<ComentarioIniciativa> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new ComentarioIniciativa(item));
	}

}
