import { BaseEntity } from './';
import { IPersonValue, toPersonValue, toDateValue } from '../utils/Mappers';
import { ILookupValue, toLookupValue, toLookupValueArray } from '../utils/Mappers';

export default class PresupuestoTarea extends BaseEntity {
	constructor(item?: any) {
		super(item);
	}

	protected mapItem(item: any): void {
		this.Tarea = toLookupValue(item.Tarea);
		this.CECO = item.CECO ?? undefined;
		this.PresupuestoEjecutado = item.PresupuestoEjecutado ?? undefined;
		this.PresupuestoAprobado = item.PresupuestoAprobado ?? undefined;
		this.Saldo = item.Saldo ?? undefined;
		this.Created = toDateValue(item.Created);
		this.Modified = toDateValue(item.Modified);
		this.Author = toPersonValue(item.Author);
		this.Editor = toPersonValue(item.Editor);
	}

	public toListItem(): any {
		return {
			...super.toListItem(),
			TareaId: this.Tarea?.Id,
			CECO: this.CECO,
			PresupuestoEjecutado: this.PresupuestoEjecutado,
			PresupuestoAprobado: this.PresupuestoAprobado,
			Saldo: this.Saldo,
		};
	}

	public Tarea?: ILookupValue | undefined;
	public CECO?: string | undefined;
	public PresupuestoEjecutado?: number | undefined;
	public PresupuestoAprobado?: number | undefined;
	public Saldo?: number | undefined;

	public Created?: Date | null;
	public Modified?: Date | null;
	public Author?: IPersonValue;
	public Editor?: IPersonValue;
}
