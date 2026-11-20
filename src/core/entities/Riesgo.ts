import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue, toLookupValueArray, toChoiceValue, toChoiceValueArray, assertChoiceValue } from '../utils/Mappers';
import { EstadoRiesgo } from '../utils/Constants';

export default class Riesgo extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Tarea = toLookupValue(item.Tarea);
		this.Estado = toChoiceValue(EstadoRiesgo, item.Estado, 'Estado');
		this.RequiereDecision = item.RequiereDecision ?? undefined;
		this.FechaResolucion = toDateValue(item.FechaResolucion);
		this.Descripcion = item.Descripcion ?? undefined;
		this.Created = toDateValue(item.Created);
		this.Modified = toDateValue(item.Modified);
		this.Author = toPersonValue(item.Author);
		this.Editor = toPersonValue(item.Editor);
	}

	public toListItem(): any {
		return {
			...super.toListItem(),
			TareaId: this.Tarea?.Id,
			Estado: assertChoiceValue(EstadoRiesgo, this.Estado, 'Estado'),
			RequiereDecision: this.RequiereDecision,
			FechaResolucion: this.FechaResolucion,
			Descripcion: this.Descripcion,
		};
	}

	public Tarea?: ILookupValue | undefined;
	public Estado?: EstadoRiesgo | undefined;
	public RequiereDecision?: boolean | undefined;
	public FechaResolucion?: Date | null | undefined;
	public Descripcion?: string | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
