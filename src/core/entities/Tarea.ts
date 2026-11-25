import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue, toLookupValueArray, toLookupIds, toChoiceValue, toChoiceValueArray, assertChoiceValue } from '../utils/Mappers';
import { Prioridad, EstadoTarea } from '../utils/Constants';

export default class Tarea extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Nombre = item.Nombre ?? undefined;
		this.Descripcion = item.Descripcion ?? undefined;
		this.QueHabilita = item.QueHabilita ?? undefined;
		this.Iniciativa = toLookupValue(item.Iniciativa);
		this.Objetivo = toLookupValue(item.Objetivo);
		this.Responsable = toPersonValue(item.Responsable);
		this.Prioridad = toChoiceValue(Prioridad, item.Prioridad, 'Prioridad');
		this.FechaInicio = toDateValue(item.FechaInicio);
		this.FechaCompromiso = toDateValue(item.FechaCompromiso);
		this.Avance = item.Avance ?? undefined;
		this.Estado = toChoiceValue(EstadoTarea, item.Estado, 'Estado');
		this.FechaFinalizacion = toDateValue(item.FechaFinalizacion);
		this.RequiereInversion = item.RequiereInversion ?? undefined;
		this.Area = toLookupValueArray(item.Area);
		this.FechaUltimaActualizacion = toDateValue(item.FechaUltimaActualizacion);
		this.ComentarioEjecutivo = item.ComentarioEjecutivo ?? undefined;
		this.ComentarioEjecutivoFecha = toDateValue(item.ComentarioEjecutivoFecha);
		this.ComentarioEjecutivoAutor = toPersonValue(item.ComentarioEjecutivoAutor);
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
			QueHabilita: this.QueHabilita,
			IniciativaId: this.Iniciativa?.Id,
			ObjetivoId: this.Objetivo?.Id,
			ResponsableId: this.Responsable?.Id,
			Prioridad: this.Prioridad == null ? this.Prioridad : assertChoiceValue(Prioridad, this.Prioridad, 'Prioridad'),
			FechaInicio: this.FechaInicio,
			FechaCompromiso: this.FechaCompromiso,
			Avance: this.Avance,
			Estado: this.Estado === undefined ? undefined : assertChoiceValue(EstadoTarea, this.Estado, 'Estado'),
			FechaFinalizacion: this.FechaFinalizacion,
			FechaUltimaActualizacion: this.FechaUltimaActualizacion,
			ComentarioEjecutivo: this.ComentarioEjecutivo,
			ComentarioEjecutivoFecha: this.ComentarioEjecutivoFecha,
			ComentarioEjecutivoAutorId: this.ComentarioEjecutivoAutor?.Id,
			AreaId: toLookupIds(this.Area),
		};
	}

	public Nombre?: string | undefined;
	public Descripcion?: string | undefined;
	public QueHabilita?: string | undefined;
	public Iniciativa?: ILookupValue | undefined;
	public Objetivo?: ILookupValue | undefined;
	public Responsable?: IPersonValue | undefined;
	public Prioridad?: Prioridad | null | undefined;
	public FechaInicio?: Date | null | undefined;
	public FechaCompromiso?: Date | null | undefined;
	public Avance?: number | undefined;
	public Estado?: EstadoTarea | undefined;
	public FechaFinalizacion?: Date | null | undefined;
	public RequiereInversion?: boolean | undefined;
	public Area?: ILookupValue[] | undefined;
	public FechaUltimaActualizacion?: Date | null | undefined;
	public ComentarioEjecutivo?: string | undefined;
	public ComentarioEjecutivoFecha?: Date | null | undefined;
	public ComentarioEjecutivoAutor?: IPersonValue | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
