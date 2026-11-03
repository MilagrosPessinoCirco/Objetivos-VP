import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue, toLookupValueArray, toPersonValueArray, toPersonIds, toChoiceValue, toChoiceValueArray, assertChoiceValue } from '../utils/Mappers';
import { EstadoIniciativa } from '../utils/Constants';

export default class Iniciativa extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Nombre = item.Nombre ?? undefined;
		this.Descripcion = item.Descripcion ?? undefined;
		this.Objetivo = toLookupValue(item.Objetivo);
		this.Responsables = toPersonValueArray(item.Responsables);
		this.Peso = item.Peso ?? undefined;
		this.Estado = toChoiceValue(EstadoIniciativa, item.Estado, 'Estado');
		this.FechaInicio = toDateValue(item.FechaInicio);
		this.FechaCompromiso = toDateValue(item.FechaCompromiso);
		this.Area = toLookupValue(item.Area);
		this.Created = toDateValue(item.Created);
		this.Modified = toDateValue(item.Modified);
		this.Author = toPersonValue(item.Author);
		this.Editor = toPersonValue(item.Editor);
	}

	public toListItem(): any {
		return {
			...super.toListItem(),
			Nombre: this.Nombre,
			Descripcion: this.Descripcion,
			ObjetivoId: this.Objetivo?.Id,
			ResponsablesId: toPersonIds(this.Responsables),
			Peso: this.Peso,
			Estado: assertChoiceValue(EstadoIniciativa, this.Estado, 'Estado'),
			FechaInicio: this.FechaInicio,
			FechaCompromiso: this.FechaCompromiso,
			AreaId: this.Area?.Id,
		};
	}

	public Nombre?: string | undefined;
	public Descripcion?: string | undefined;
	public Objetivo?: ILookupValue | undefined;
	public Responsables?: IPersonValue[] | undefined;
	public Peso?: number | undefined;
	public Estado?: EstadoIniciativa | undefined;
	public FechaInicio?: Date | null | undefined;
	public FechaCompromiso?: Date | null | undefined;
	public Area?: ILookupValue | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
