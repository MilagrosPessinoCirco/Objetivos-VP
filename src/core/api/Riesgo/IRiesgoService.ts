import { Decision, Riesgo, Tarea } from '../../entities';
import { EstadoRiesgo } from '../../utils/Constants';
import { RiesgoRegla } from './riesgoReglas';

export interface IRiesgoConDecision {
	riesgo: Riesgo;
	decision?: Decision;
}

export interface IRiesgoInput {
	descripcion: string;
	requiereDecision: boolean;
	decisionNecesaria?: string;
	fechaLimite?: Date;
}

export interface IRiesgoAltaInput extends IRiesgoInput {
	tareaId: number;
}

export interface IRiesgoEdicionInput extends IRiesgoInput {
	riesgoId: number;
	estado: EstadoRiesgo;
}

export interface IAltaPendiente {
	riesgo: Riesgo;
	decision?: Decision;
}

export type RiesgoCampo = 'descripcion' | 'requiereDecision' | 'decisionNecesaria' | 'fechaLimite' | 'estado' | 'tarea';

export class RiesgoValidationError extends Error {
	public readonly campos: Partial<Record<RiesgoCampo, RiesgoRegla>>;
	public readonly reglas: RiesgoRegla[];

	constructor(campos: Partial<Record<RiesgoCampo, RiesgoRegla>>) {
		super('El riesgo no cumple las reglas de negocio y no se guardó.');
		Object.setPrototypeOf(this, RiesgoValidationError.prototype);
		this.name = 'RiesgoValidationError';
		this.campos = campos;
		this.reglas = Object.keys(campos).map((campo) => campos[campo as RiesgoCampo] as RiesgoRegla);
	}
}

export class RiesgoGuardadoError extends Error {
	public readonly revertido: boolean;
	public readonly pendiente?: IAltaPendiente;
	public readonly causa: unknown;

	constructor(revertido: boolean, causa: unknown, pendiente?: IAltaPendiente) {
		super(revertido
			? 'No se pudo guardar el riesgo; lo escrito se revirtió.'
			: 'No se pudo guardar el riesgo y no se pudo revertir lo escrito: el riesgo y su decisión pueden haber quedado a medias.');
		Object.setPrototypeOf(this, RiesgoGuardadoError.prototype);
		this.name = 'RiesgoGuardadoError';
		this.revertido = revertido;
		this.causa = causa;
		this.pendiente = pendiente;
	}
}

export default interface IRiesgoService {

	getByTarea(tareaId: number): Promise<IRiesgoConDecision[]>;
	getActivosEscaladosByTareas(tareas: Tarea[]): Promise<IRiesgoConDecision[]>;
	crear(input: IRiesgoAltaInput, pendiente?: IAltaPendiente): Promise<IRiesgoConDecision>;
	editar(input: IRiesgoEdicionInput): Promise<IRiesgoConDecision>;

}
