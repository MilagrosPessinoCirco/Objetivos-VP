import { Decision, Riesgo, Tarea } from '../../entities';
import { EstadoRiesgo, EstadoTarea } from '../../utils/Constants';
import IDecisionDataSource from '../Decision/IDecisionDataSource';
import DecisionDataSource from '../Decision/DecisionDataSource';
import IIniciativaDataSource from '../Iniciativa/IIniciativaDataSource';
import IniciativaDataSource from '../Iniciativa/IniciativaDataSource';
import ITareaDataSource from '../Tarea/ITareaDataSource';
import TareaDataSource from '../Tarea/TareaDataSource';
import IRiesgoDataSource from './IRiesgoDataSource';
import RiesgoDataSource from './RiesgoDataSource';
import IRiesgoService, {
	IAltaPendiente,
	IRiesgoAltaInput,
	IRiesgoConDecision,
	IRiesgoEdicionInput,
	RiesgoCampo,
	RiesgoGuardadoError,
	RiesgoValidationError
} from './IRiesgoService';
import {
	RiesgoRegla,
	canCargarRiesgo,
	getDecisionIssue,
	getDescripcionIssue,
	isMismoDia,
	isRequiereDecisionFijo,
	isTransicionPermitida,
	ordenarRiesgos,
	recortarTitulo
} from './riesgoReglas';

type Campos = Partial<Record<RiesgoCampo, RiesgoRegla>>;

const hasCampos = (campos: Campos): boolean => Object.keys(campos).length > 0;

const leer = async <T>(lectura: () => Promise<T>): Promise<T> => {
	try {
		return await lectura();
	}
	catch (error) {
		throw new RiesgoGuardadoError(true, error);
	}
};

const armarDecision = (id: number | undefined, riesgoId: number, texto: string, fecha: Date): Decision =>
	Object.assign(new Decision(), {
		Id: id,
		Titulo: recortarTitulo(texto),
		DecisionNecesaria: texto,
		Riesgo: id === undefined ? { Id: riesgoId, Title: '' } : undefined,
		FechaLimite: fecha
	});

export default class RiesgoService implements IRiesgoService {

	constructor(
		private readonly riesgos: IRiesgoDataSource,
		private readonly decisiones: IDecisionDataSource,
		private readonly tareas: ITareaDataSource,
		private readonly iniciativas: IIniciativaDataSource
	) { }

	public async getByTarea(tareaId: number): Promise<IRiesgoConDecision[]> {
		const items = ordenarRiesgos(await this.riesgos.getFilteredItems(tareaId));
		return this.unirDecisiones(items);
	}

	public async getActivosEscaladosByTareas(tareas: Tarea[]): Promise<IRiesgoConDecision[]> {
		const tareaIds = tareas.filter((tarea) => tarea.Estado !== EstadoTarea.Cancelada).map((tarea) => tarea.Id as number);
		if (tareaIds.length === 0) {
			return [];
		}
		const leidos = await this.riesgos.getActivosEscaladosByTareas(tareaIds);
		const items = ordenarRiesgos(leidos.filter((riesgo) => riesgo.Estado === EstadoRiesgo.Activo || riesgo.Estado === EstadoRiesgo.Escalado));
		return this.unirDecisiones(items);
	}

	public async crear(input: IRiesgoAltaInput, pendiente?: IAltaPendiente): Promise<IRiesgoConDecision> {
		const hoy = new Date();
		const campos = this.validarCampos(input.descripcion, input.requiereDecision, input.decisionNecesaria, input.fechaLimite, undefined, hoy);
		if (!pendiente) {
			const tarea = await leer(() => this.tareas.getById(input.tareaId));
			const iniciativa = await leer(() => this.iniciativas.getById(tarea.Iniciativa?.Id as number));
			if (!canCargarRiesgo(tarea, iniciativa)) {
				campos.tarea = RiesgoRegla.TareaOIniciativaCerrada;
			}
		}
		if (pendiente) {
			if (input.requiereDecision !== pendiente.riesgo.RequiereDecision) {
				campos.requiereDecision = RiesgoRegla.CambioEnReintento;
			}
			if (input.descripcion.trim() !== (pendiente.riesgo.Descripcion ?? '')) {
				campos.descripcion = RiesgoRegla.CambioEnReintento;
			}
		}
		if (hasCampos(campos)) {
			throw new RiesgoValidationError(campos);
		}

		let creado = pendiente?.riesgo;
		if (!creado) {
			const nuevo = Object.assign(new Riesgo(), {
				Titulo: recortarTitulo(input.descripcion.trim()),
				Tarea: { Id: input.tareaId, Title: '' },
				Estado: EstadoRiesgo.Activo,
				RequiereDecision: input.requiereDecision,
				Descripcion: input.descripcion.trim()
			});
			creado = await leer(() => this.riesgos.add(nuevo));
		}
		if (!input.requiereDecision) {
			return { riesgo: creado };
		}

		try {
			const existentes = pendiente ? await this.decisiones.getFilteredItems(creado.Id as number) : [];
			const texto = (input.decisionNecesaria as string).trim();
			const fecha = input.fechaLimite as Date;
			const decision = existentes[0]
				? await this.decisiones.edit(armarDecision(existentes[0].Id, creado.Id as number, texto, fecha))
				: await this.decisiones.add(armarDecision(undefined, creado.Id as number, texto, fecha));
			return { riesgo: creado, decision };
		}
		catch (error) {
			throw await this.revertirAlta(creado, error);
		}
	}

	public async editar(input: IRiesgoEdicionInput): Promise<IRiesgoConDecision> {
		const hoy = new Date();
		const guardado = await leer(() => this.riesgos.getById(input.riesgoId));
		const decisionGuardada = (await leer(() => this.decisiones.getFilteredItems(input.riesgoId)))[0];
		const tarea = await leer(() => this.tareas.getById(guardado.Tarea?.Id as number));

		const campos = this.validarCampos(input.descripcion, input.requiereDecision, input.decisionNecesaria, input.fechaLimite, decisionGuardada?.FechaLimite, hoy);
		if (guardado.Estado === undefined) {
			campos.estado = RiesgoRegla.EstadoNoLeido;
		}
		else if (guardado.Estado === EstadoRiesgo.Resuelto) {
			campos.estado = RiesgoRegla.RiesgoResuelto;
		}
		else if (tarea.Estado === EstadoTarea.Cancelada) {
			campos.tarea = RiesgoRegla.TareaCancelada;
		}
		else if (!isTransicionPermitida(guardado.Estado, input.estado)) {
			campos.estado = RiesgoRegla.TransicionNoPermitida;
		}
		if (guardado.RequiereDecision === true && !input.requiereDecision && isRequiereDecisionFijo(decisionGuardada)) {
			campos.requiereDecision = RiesgoRegla.RequiereDecisionFijo;
		}
		if (hasCampos(campos)) {
			throw new RiesgoValidationError(campos);
		}

		const descripcion = input.descripcion.trim();
		const texto = (input.decisionNecesaria ?? '').trim();
		const crearDecision = input.requiereDecision && decisionGuardada === undefined;
		const editarDecision = input.requiereDecision && decisionGuardada !== undefined
			&& (texto !== (decisionGuardada.DecisionNecesaria ?? '') || !isMismoDia(input.fechaLimite, decisionGuardada.FechaLimite));
		const cambiaRiesgo = descripcion !== (guardado.Descripcion ?? '')
			|| input.estado !== guardado.Estado
			|| input.requiereDecision !== guardado.RequiereDecision;

		let decisionEscrita: Decision | undefined = decisionGuardada;
		let decisionTocada = false;
		try {
			if (crearDecision) {
				decisionEscrita = await this.decisiones.add(armarDecision(undefined, input.riesgoId, texto, input.fechaLimite as Date));
				decisionTocada = true;
			}
			else if (editarDecision) {
				decisionEscrita = await this.decisiones.edit(armarDecision(decisionGuardada.Id, input.riesgoId, texto, input.fechaLimite as Date));
				decisionTocada = true;
			}
			let riesgoEscrito = guardado;
			if (cambiaRiesgo) {
				const actualizado = Object.assign(new Riesgo(), {
					Id: guardado.Id,
					Titulo: recortarTitulo(descripcion),
					Descripcion: descripcion,
					Estado: input.estado,
					RequiereDecision: input.requiereDecision,
					FechaResolucion: input.estado === EstadoRiesgo.Resuelto && !guardado.FechaResolucion ? new Date() : undefined
				});
				riesgoEscrito = await this.riesgos.edit(actualizado);
			}
			return { riesgo: riesgoEscrito, decision: decisionEscrita };
		}
		catch (error) {
			if (!decisionTocada) {
				throw new RiesgoGuardadoError(true, error);
			}
			throw await this.revertirEdicion(crearDecision ? decisionEscrita : undefined, decisionGuardada, error);
		}
	}

	private validarCampos(
		descripcion: string,
		requiereDecision: boolean,
		decisionNecesaria: string | undefined,
		fechaLimite: Date | undefined,
		fechaGuardada: Date | null | undefined,
		hoy: Date
	): Campos {
		const campos: Campos = {};
		const descripcionIssue = getDescripcionIssue(descripcion);
		if (descripcionIssue) {
			campos.descripcion = descripcionIssue;
		}
		const decisionIssues = getDecisionIssue(requiereDecision, decisionNecesaria, fechaLimite, fechaGuardada, hoy);
		if (decisionIssues.decision) {
			campos.decisionNecesaria = decisionIssues.decision;
		}
		if (decisionIssues.fecha) {
			campos.fechaLimite = decisionIssues.fecha;
		}
		return campos;
	}

	private async unirDecisiones(items: Riesgo[]): Promise<IRiesgoConDecision[]> {
		const conDecision = items.filter((riesgo) => riesgo.RequiereDecision === true).map((riesgo) => riesgo.Id as number);
		const decisiones = conDecision.length > 0 ? await this.decisiones.getFilteredItemsByRiesgos(conDecision) : [];
		return items.map((riesgo) => ({
			riesgo,
			decision: decisiones
				.filter((decision) => decision.Riesgo?.Id === riesgo.Id)
				.sort((a, b) => (a.Id ?? 0) - (b.Id ?? 0))[0]
		}));
	}

	private async revertirAlta(creado: Riesgo, causa: unknown): Promise<RiesgoGuardadoError> {
		try {
			await this.riesgos.delete(creado.Id as number);
			return new RiesgoGuardadoError(true, causa);
		}
		catch {
			return new RiesgoGuardadoError(false, causa, { riesgo: creado });
		}
	}

	private async revertirEdicion(decisionCreada: Decision | undefined, decisionPrevia: Decision | undefined, causa: unknown): Promise<RiesgoGuardadoError> {
		try {
			if (decisionCreada) {
				await this.decisiones.delete(decisionCreada.Id as number);
			}
			else if (decisionPrevia) {
				await this.decisiones.edit(Object.assign(new Decision(), {
					Id: decisionPrevia.Id,
					Titulo: decisionPrevia.Titulo,
					DecisionNecesaria: decisionPrevia.DecisionNecesaria,
					FechaLimite: decisionPrevia.FechaLimite
				}));
			}
			return new RiesgoGuardadoError(true, causa);
		}
		catch {
			return new RiesgoGuardadoError(false, causa);
		}
	}
}

export const getRiesgoService = (): IRiesgoService =>
	new RiesgoService(new RiesgoDataSource(), new DecisionDataSource(), new TareaDataSource(), new IniciativaDataSource());
