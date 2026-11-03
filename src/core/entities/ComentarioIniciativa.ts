import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue, toLookupValueArray } from '../utils/Mappers';

export default class ComentarioIniciativa extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Iniciativa = toLookupValue(item.Iniciativa);
		this.Comentario = item.Comentario ?? undefined;
		this.Created = toDateValue(item.Created);
		this.Modified = toDateValue(item.Modified);
		this.Author = toPersonValue(item.Author);
		this.Editor = toPersonValue(item.Editor);
	}

	public toListItem(): any {
		return {
			...super.toListItem(),
			IniciativaId: this.Iniciativa?.Id,
			Comentario: this.Comentario,
		};
	}

	public Iniciativa?: ILookupValue | undefined;
	public Comentario?: string | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
