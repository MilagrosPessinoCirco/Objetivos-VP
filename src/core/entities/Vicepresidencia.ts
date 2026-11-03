import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';


export default class Vicepresidencia extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Nombre = item.Nombre ?? undefined;
		this.Activo = item.Activo ?? undefined;
		this.Created = toDateValue(item.Created);
		this.Modified = toDateValue(item.Modified);
		this.Author = toPersonValue(item.Author);
		this.Editor = toPersonValue(item.Editor);
	}

	public toListItem(): any {
		return {
			...super.toListItem(),
			Nombre: this.Nombre,
			Activo: this.Activo,
		};
	}

	public Nombre?: string | undefined;
	public Activo?: boolean | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
