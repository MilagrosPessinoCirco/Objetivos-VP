import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue, toLookupValueArray, toChoiceValue, toChoiceValueArray, assertChoiceValue } from '../utils/Mappers';
import { Rol } from '../utils/Constants';

export default class Usuario extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Usuario = toPersonValue(item.Usuario);
		this.Departamento = toLookupValue(item.Departamento);
		this.Gerencia = toLookupValue(item.Gerencia);
		this.Area = toLookupValue(item.Area);
		this.Activo = item.Activo ?? undefined;
		this.Rol = toChoiceValue(Rol, item.Rol, 'Rol');
		this.Created = toDateValue(item.Created);
		this.Modified = toDateValue(item.Modified);
		this.Author = toPersonValue(item.Author);
		this.Editor = toPersonValue(item.Editor);
	}

	public toListItem(): any {
		return {
			...super.toListItem(),
			UsuarioId: this.Usuario?.Id,
			DepartamentoId: this.Departamento?.Id,
			GerenciaId: this.Gerencia?.Id,
			AreaId: this.Area?.Id,
			Activo: this.Activo,
			Rol: assertChoiceValue(Rol, this.Rol, 'Rol'),
		};
	}

	public Usuario?: IPersonValue | undefined;
	public Departamento?: ILookupValue | undefined;
	public Gerencia?: ILookupValue | undefined;
	public Area?: ILookupValue | undefined;
	public Activo?: boolean | undefined;
	public Rol?: Rol | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
