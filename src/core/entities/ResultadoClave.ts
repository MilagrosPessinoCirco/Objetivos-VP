import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { IUrlValue, toUrlValue, toChoiceValue, toChoiceValueArray, assertChoiceValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue } from '../utils/Mappers';
import { TipoMedicion } from '../utils/Constants';

export default class ResultadoClave extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Nombre = item.Nombre ?? undefined;
		this.Descripcion = item.Descripcion ?? undefined;
		this.Responsable = toPersonValue(item.Responsable);
		this.TipoMedicion = toChoiceValue(TipoMedicion, item.TipoMedicion, 'TipoMedicion');
		this.UnidadMedida = item.UnidadMedida ?? undefined;
		this.Minimo = item.Minimo ?? undefined;
		this.Meta = item.Meta ?? undefined;
		this.Maximo = item.Maximo ?? undefined;
		this.Peso = item.Peso ?? undefined;
		this.ValorActual = item.ValorActual ?? undefined;
		this.Fuente = item.Fuente ?? undefined;
		this.Evidencia = toUrlValue(item.Evidencia);
		this.ValorProyectado = item.ValorProyectado ?? undefined;
		this.Iniciativa = toLookupValue(item.Iniciativa);
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
			ResponsableId: this.Responsable?.Id,
			TipoMedicion: assertChoiceValue(TipoMedicion, this.TipoMedicion, 'TipoMedicion'),
			UnidadMedida: this.UnidadMedida,
			Minimo: this.Minimo,
			Meta: this.Meta,
			Maximo: this.Maximo,
			Peso: this.Peso,
			ValorActual: this.ValorActual,
			Fuente: this.Fuente,
			Evidencia: this.Evidencia,
			ValorProyectado: this.ValorProyectado,
			IniciativaId: this.Iniciativa?.Id,
		};
	}

	public Nombre?: string | undefined;
	public Descripcion?: string | undefined;
	public Responsable?: IPersonValue | undefined;
	public TipoMedicion?: TipoMedicion | undefined;
	public UnidadMedida?: string | undefined;
	public Minimo?: number | undefined;
	public Meta?: number | undefined;
	public Maximo?: number | undefined;
	public Peso?: number | undefined;
	public ValorActual?: number | undefined;
	public Fuente?: string | undefined;
	public Evidencia?: IUrlValue | undefined;
	public ValorProyectado?: number | undefined;
	public Iniciativa?: ILookupValue | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
