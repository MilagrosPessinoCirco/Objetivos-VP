import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { Tarea } from "../../entities";
import ITareaDataSource from './ITareaDataSource';

const TOP_DEFAULT = 5000;

export default class TareaDataSource implements ITareaDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'Nombre',
		'Descripcion',
		'Iniciativa/Id', 'Iniciativa/Title',
		'Objetivo/Id', 'Objetivo/Title',
		'Responsable/Id', 'Responsable/Title', 'Responsable/EMail',
		'Prioridad',
		'FechaInicio',
		'FechaCompromiso',
		'Avance',
		'Estado',
		'FechaFinalizacion',
		'RequiereInversion',
		'Area/Id', 'Area/Title',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'Iniciativa', 'Objetivo', 'Responsable', 'Area'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.Tarea;
	}

	public async getItems(): Promise<Array<Tarea>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.top(TOP_DEFAULT)();
		return items.map(item => new Tarea(item));
	}

	public async getFilteredItems(iniciativaId: number): Promise<Array<Tarea>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.filter(`IniciativaId eq ${iniciativaId}`)
			.top(TOP_DEFAULT)();
		return items.map(item => new Tarea(item));
	}

	public add(item: Tarea): Promise<Tarea> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: Tarea): Promise<Tarea> {
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

	public async getById(itemId: number): Promise<Tarea> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new Tarea(item));
	}

}
