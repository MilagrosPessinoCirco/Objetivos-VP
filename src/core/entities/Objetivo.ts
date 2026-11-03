import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue, toLookupValueArray, toChoiceValue, toChoiceValueArray, assertChoiceValue } from '../utils/Mappers';
import { Duracion, Estado } from '../utils/Constants';

export default class Objetivo extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Nombre = item.Nombre ?? undefined;
		this.Descripcion = item.Descripcion ?? undefined;
		this.Palanca = toLookupValue(item.Palanca);
		this.Responsable = toPersonValue(item.Responsable);
		this.Duracion = toChoiceValue(Duracion, item.Duracion, 'Duracion');
		this.CantidadAnios = item.CantidadAnios ?? undefined;
		this.Peso = item.Peso ?? undefined;
		this.FechaInicio = toDateValue(item.FechaInicio);
		this.FechaCompromiso = toDateValue(item.FechaCompromiso);
		this.Estado = toChoiceValue(Estado, item.Estado, 'Estado');
		this.VP = toLookupValue(item.VP);
		this.Departamento = toLookupValue(item.Departamento);
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
			Descripcion: this.Descripcion,
			PalancaId: this.Palanca?.Id,
			ResponsableId: this.Responsable?.Id,
			Duracion: assertChoiceValue(Duracion, this.Duracion, 'Duracion'),
			CantidadAnios: this.CantidadAnios,
			Peso: this.Peso,
			FechaInicio: this.FechaInicio,
			FechaCompromiso: this.FechaCompromiso,
			Estado: assertChoiceValue(Estado, this.Estado, 'Estado'),
			VPId: this.VP?.Id,
			DepartamentoId: this.Departamento?.Id,
			GerenciaId: this.Gerencia?.Id,
		};
	}

	public Nombre?: string | undefined;
	public Descripcion?: string | undefined;
	public Palanca?: ILookupValue | undefined;
	public Responsable?: IPersonValue | undefined;
	public Duracion?: Duracion | undefined;
	public CantidadAnios?: number | undefined;
	public Peso?: number | undefined;
	public FechaInicio?: Date | null | undefined;
	public FechaCompromiso?: Date | null | undefined;
	public Estado?: Estado | undefined;
	public VP?: ILookupValue | undefined;
	public Departamento?: ILookupValue | undefined;
	public Gerencia?: ILookupValue | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
