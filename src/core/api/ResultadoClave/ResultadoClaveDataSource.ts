import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { ResultadoClave } from "../../entities";
import IResultadoClaveDataSource from './IResultadoClaveDataSource';

const TOP_DEFAULT = 5000;

export default class ResultadoClaveDataSource implements IResultadoClaveDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'Nombre',
		'Descripcion',
		'Responsable/Id', 'Responsable/Title', 'Responsable/EMail',
		'TipoMedicion',
		'UnidadMedida',
		'Minimo',
		'Meta',
		'Maximo',
		'Peso',
		'ValorActual',
		'Fuente',
		'Evidencia',
		'ValorProyectado',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'Responsable'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.ResultadoClave;
	}

	public async getItems(): Promise<Array<ResultadoClave>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.top(TOP_DEFAULT)();
		return items.map(item => new ResultadoClave(item));
	}

	public add(item: ResultadoClave): Promise<ResultadoClave> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: ResultadoClave): Promise<ResultadoClave> {
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

	public async getById(itemId: number): Promise<ResultadoClave> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new ResultadoClave(item));
	}

}
