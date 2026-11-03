import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue, toLookupValueArray } from '../utils/Mappers';

export default class Area extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Nombre = item.Nombre ?? undefined;
		this.Gerencia = toLookupValue(item.Gerencia);
		this.Created = toDateValue(item.Created);
		this.Modified = toDateValue(item.Modified);
		this.Author = toPersonValue(item.Author);
		this.Editor = toPersonValue(item.Editor);
	}

	public toListItem(): any {
		return {
			...super.toListItem(),
			Nombre: this.Nombre,
			GerenciaId: this.Gerencia?.Id,
		};
	}

	public Nombre?: string | undefined;
	public Gerencia?: ILookupValue | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
