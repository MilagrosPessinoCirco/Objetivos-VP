import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue, toLookupValueArray } from '../utils/Mappers';

export default class Decision extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.DecisionNecesaria = item.DecisionNecesaria ?? undefined;
		this.FechaResolucion = toLookupValue(item.FechaResolucion);
		this.Riesgo = toLookupValue(item.Riesgo);
		this.Responsable = item.Responsable ?? undefined;
		this.FechaLimite = toDateValue(item.FechaLimite);
		this.Created = toDateValue(item.Created);
		this.Modified = toDateValue(item.Modified);
		this.Author = toPersonValue(item.Author);
		this.Editor = toPersonValue(item.Editor);
	}

	public toListItem(): any {
		return {
			...super.toListItem(),
			DecisionNecesaria: this.DecisionNecesaria,
			FechaResolucionId: this.FechaResolucion?.Id,
			RiesgoId: this.Riesgo?.Id,
			Responsable: this.Responsable,
			FechaLimite: this.FechaLimite,
		};
	}

	public DecisionNecesaria?: string | undefined;
	public FechaResolucion?: ILookupValue | undefined;
	public Riesgo?: ILookupValue | undefined;
	public Responsable?: string | undefined;
	public FechaLimite?: Date | null | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
