import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { Tarea } from "../../entities";
import ITareaDataSource from './ITareaDataSource';

const TOP_DEFAULT = 5000;
const COLUMNAS_NUEVAS_DISPONIBLES = false;
const COLUMNAS_NUEVAS = ['QueHabilita', 'FechaUltimaActualizacion', 'ComentarioEjecutivo', 'ComentarioEjecutivoFecha', 'ComentarioEjecutivoAutor'];

const isColumnaNueva = (property: string): boolean =>
	COLUMNAS_NUEVAS.some((columna) => property === columna || property.indexOf(`${columna}/`) === 0 || property === `${columna}Id`);

export default class TareaDataSource implements ITareaDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'Nombre',
		'Descripcion',
		'QueHabilita',
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
		'FechaUltimaActualizacion',
		'ComentarioEjecutivo',
		'ComentarioEjecutivoFecha',
		'ComentarioEjecutivoAutor/Id', 'ComentarioEjecutivoAutor/Title', 'ComentarioEjecutivoAutor/EMail',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'Iniciativa', 'Objetivo', 'Responsable', 'Area', 'ComentarioEjecutivoAutor'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.Tarea;
		if (!COLUMNAS_NUEVAS_DISPONIBLES) {
			this.selectProperties = this.selectProperties.filter((property) => !isColumnaNueva(property));
			this.expand = this.expand.filter((property) => !isColumnaNueva(property));
		}
	}

	private toWritableItem(item: Tarea): any {
		const listItem = item.toListItem();
		if (COLUMNAS_NUEVAS_DISPONIBLES) {
			return listItem;
		}
		const writable: any = {};
		Object.keys(listItem)
			.filter((key) => !isColumnaNueva(key))
			.forEach((key) => {
				writable[key] = listItem[key];
			});
		if (Array.isArray(writable.AreaId)) {
			writable.AreaId = writable.AreaId[0];
		}
		return writable;
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
		const listItem = this.toWritableItem(item);
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: Tarea): Promise<Tarea> {
		const listItem = this.toWritableItem(item);
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
