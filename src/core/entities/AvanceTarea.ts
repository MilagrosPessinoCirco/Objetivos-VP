import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue, toLookupValueArray, toChoiceValue, toChoiceValueArray, assertChoiceValue } from '../utils/Mappers';
import { EstadoTarea } from '../utils/Constants';

export default class AvanceTarea extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Tarea = toLookupValue(item.Tarea);
		this.Avance = item.Avance ?? undefined;
		this.Estado = toChoiceValue(EstadoTarea, item.Estado, 'Estado');
		this.Comentario = item.Comentario ?? undefined;
		this.Created = toDateValue(item.Created);
		this.Modified = toDateValue(item.Modified);
		this.Author = toPersonValue(item.Author);
		this.Editor = toPersonValue(item.Editor);
	}

	public toListItem(): any {
		return {
			...super.toListItem(),
			TareaId: this.Tarea?.Id,
			Avance: this.Avance,
			Estado: assertChoiceValue(EstadoTarea, this.Estado, 'Estado'),
			Comentario: this.Comentario,
		};
	}

	public Tarea?: ILookupValue | undefined;
	public Avance?: number | undefined;
	public Estado?: EstadoTarea | undefined;
	public Comentario?: string | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
