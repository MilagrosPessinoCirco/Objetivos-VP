import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { Decision } from "../../entities";
import IDecisionDataSource from './IDecisionDataSource';

const TOP_DEFAULT = 5000;

export default class DecisionDataSource implements IDecisionDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'DecisionNecesaria',
		'FechaResolucion/Id', 'FechaResolucion/Title',
		'Riesgo/Id', 'Riesgo/Title',
		'Responsable',
		'FechaLimite',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'FechaResolucion', 'Riesgo'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.Decision;
	}

	public async getItems(): Promise<Array<Decision>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.top(TOP_DEFAULT)();
		return items.map(item => new Decision(item));
	}

	public async getFilteredItems(riesgoId: number): Promise<Array<Decision>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.filter(`RiesgoId eq ${riesgoId}`)
			.top(TOP_DEFAULT)();
		return items.map(item => new Decision(item));
	}

	public add(item: Decision): Promise<Decision> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: Decision): Promise<Decision> {
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

	public async getById(itemId: number): Promise<Decision> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new Decision(item));
	}

}
