import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';


export default class Palanca extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Nombre = item.Nombre ?? undefined;
		this.Descripcion = item.Descripcion ?? undefined;
		this.Activa = item.Activa ?? undefined;
		this.Created = toDateValue(item.Created);
		this.Modified = toDateValue(item.Modified);
		this.Author = toPersonValue(item.Author);
		this.Editor = toPersonValue(item.Editor);
	}

	public toListItem(): any {
		return {
			...super.toListItem(),
			Title: this.Nombre,
			Nombre: this.Nombre,
			Descripcion: this.Descripcion,
			Activa: this.Activa,
		};
	}

	public Nombre?: string | undefined;
	public Descripcion?: string | undefined;
	public Activa?: boolean | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
