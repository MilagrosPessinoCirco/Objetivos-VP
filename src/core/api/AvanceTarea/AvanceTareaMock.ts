import { AvanceTarea } from '../../entities';
import { EstadoTarea, Lista } from '../../utils/Constants';
import { IPersonValue } from '../../utils/Mappers';
import { BARBARA, MARIA, USUARIO_PRUEBA } from '../Usuario/UsuarioMock';
import IAvanceTareaDataSource from './IAvanceTareaDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe la entrada de avance solicitada en el mock.';
const ALTA_COMENTARIO = 'Tarea cargada.';
const ALTA_HORA = 'T10:00:00';
const PASO_HORA = 'T12:00:00';

interface IPasoMock {
	fecha: string;
	estado: EstadoTarea;
	avance: number;
	comentario?: string;
}

interface IHistorialMock {
	tareaId: number;
	autor: IPersonValue;
	alta: string;
	pasos: IPasoMock[];
}

const ROTACION: IPersonValue[] = [USUARIO_PRUEBA, BARBARA, MARIA];

const rotar = (indice: number): IPersonValue => ROTACION[indice % ROTACION.length];

const ETAPAS_STORE_PRIMERA_ID = 8;
const ETAPAS_STORE_CANTIDAD = 8;
const AVANCE_ETAPA_PASO = 10;
const CATALOGO_NO_INICIADAS_PRIMERA_ID = 20;
const CATALOGO_NO_INICIADAS_CANTIDAD = 5;
const CATALOGO_AVANCE_FRENADA = 30;
const ALTA_TABLERO = '2026-01-14';
const ALTA_STORE = '2026-01-05';
const ALTA_CATALOGO = '2026-04-10';

const HISTORIAL_TABLERO: IHistorialMock[] = [
	{ tareaId: 1, autor: BARBARA, alta: ALTA_TABLERO, pasos: [
		{ fecha: '2026-01-25', estado: EstadoTarea.EnCurso, avance: 50, comentario: 'Se definió el alcance.' },
		{ fecha: '2026-02-02', estado: EstadoTarea.Finalizada, avance: 100, comentario: 'Estrategia aprobada.' }
	] },
	{ tareaId: 2, autor: USUARIO_PRUEBA, alta: ALTA_TABLERO, pasos: [
		{ fecha: '2026-02-10', estado: EstadoTarea.EnCurso, avance: 30 },
		{ fecha: '2026-04-30', estado: EstadoTarea.Finalizada, avance: 100, comentario: 'Prototipo entregado.' },
		{ fecha: '2026-05-10', estado: EstadoTarea.EnCurso, avance: 90, comentario: 'Se reabre por ajustes de Comercial Retail.' },
		{ fecha: '2026-05-20', estado: EstadoTarea.EnCurso, avance: 95, comentario: 'Se validó el prototipo con Comercial Retail.' }
	] },
	{ tareaId: 3, autor: USUARIO_PRUEBA, alta: ALTA_TABLERO, pasos: [
		{ fecha: '2026-04-10', estado: EstadoTarea.EnCurso, avance: 50 }
	] },
	{ tareaId: 4, autor: BARBARA, alta: ALTA_TABLERO, pasos: [
		{ fecha: '2026-03-15', estado: EstadoTarea.EnCurso, avance: 20 }
	] },
	{ tareaId: 5, autor: MARIA, alta: ALTA_TABLERO, pasos: [
		{ fecha: '2026-03-20', estado: EstadoTarea.EnCurso, avance: 40 },
		{ fecha: '2026-04-25', estado: EstadoTarea.Frenada, avance: 40, comentario: 'El proveedor demora la entrega de materiales.' }
	] },
	{ tareaId: 6, autor: USUARIO_PRUEBA, alta: '2026-03-20', pasos: [] },
	{ tareaId: 7, autor: BARBARA, alta: ALTA_TABLERO, pasos: [
		{ fecha: '2026-02-20', estado: EstadoTarea.EnCurso, avance: 10 },
		{ fecha: '2026-03-05', estado: EstadoTarea.Cancelada, avance: 10, comentario: 'Se cancela: el piloto pasa a Nordelta.' }
	] }
];

const HISTORIAL_STORE_ETAPAS: IHistorialMock[] = Array.from({ length: ETAPAS_STORE_CANTIDAD }, (_, indice) => ({
	tareaId: ETAPAS_STORE_PRIMERA_ID + indice,
	autor: rotar(indice),
	alta: ALTA_STORE,
	pasos: [{ fecha: '2026-03-01', estado: EstadoTarea.EnCurso, avance: AVANCE_ETAPA_PASO * (indice + 1) }]
}));

const HISTORIAL_STORE: IHistorialMock[] = [
	...HISTORIAL_STORE_ETAPAS,
	{ tareaId: 16, autor: MARIA, alta: ALTA_STORE, pasos: [
		{ fecha: '2026-03-01', estado: EstadoTarea.EnCurso, avance: 35 },
		{ fecha: '2026-04-01', estado: EstadoTarea.Frenada, avance: 35 }
	] },
	{ tareaId: 17, autor: BARBARA, alta: ALTA_STORE, pasos: [
		{ fecha: '2026-06-30', estado: EstadoTarea.Finalizada, avance: 100 }
	] },
	{ tareaId: 18, autor: USUARIO_PRUEBA, alta: ALTA_STORE, pasos: [
		{ fecha: '2026-02-15', estado: EstadoTarea.Cancelada, avance: 5 }
	] },
	{ tareaId: 19, autor: MARIA, alta: '2026-02-20', pasos: [] }
];

const HISTORIAL_CATALOGO_NO_INICIADAS: IHistorialMock[] = Array.from({ length: CATALOGO_NO_INICIADAS_CANTIDAD }, (_, indice) => ({
	tareaId: CATALOGO_NO_INICIADAS_PRIMERA_ID + indice,
	autor: rotar(indice),
	alta: ALTA_CATALOGO,
	pasos: []
}));

const HISTORIAL_CATALOGO: IHistorialMock[] = [
	...HISTORIAL_CATALOGO_NO_INICIADAS,
	{ tareaId: 25, autor: MARIA, alta: ALTA_CATALOGO, pasos: [
		{ fecha: '2026-05-10', estado: EstadoTarea.EnCurso, avance: CATALOGO_AVANCE_FRENADA },
		{ fecha: '2026-06-01', estado: EstadoTarea.Frenada, avance: CATALOGO_AVANCE_FRENADA }
	] },
	{ tareaId: 26, autor: USUARIO_PRUEBA, alta: ALTA_CATALOGO, pasos: [
		{ fecha: '2026-05-10', estado: EstadoTarea.EnCurso, avance: CATALOGO_AVANCE_FRENADA },
		{ fecha: '2026-06-01', estado: EstadoTarea.Frenada, avance: CATALOGO_AVANCE_FRENADA }
	] },
	{ tareaId: 27, autor: BARBARA, alta: ALTA_CATALOGO, pasos: [
		{ fecha: '2026-06-15', estado: EstadoTarea.Finalizada, avance: 100 }
	] },
	{ tareaId: 28, autor: MARIA, alta: ALTA_CATALOGO, pasos: [
		{ fecha: '2026-06-15', estado: EstadoTarea.Finalizada, avance: 100 }
	] }
];

const createEntrada = (id: number, tareaId: number, estado: EstadoTarea, avance: number, comentario: string | undefined, created: string, autor: IPersonValue): AvanceTarea =>
	new AvanceTarea({
		Id: id,
		Tarea: { Id: tareaId, Title: `Tarea ${tareaId}` },
		Avance: avance,
		Estado: estado,
		Comentario: comentario,
		Created: created,
		Author: autor
	});

const buildEntradas = (historiales: IHistorialMock[]): AvanceTarea[] => {
	const entradas: AvanceTarea[] = [];
	historiales
		.slice()
		.sort((a, b) => a.tareaId - b.tareaId)
		.forEach((historial) => {
			entradas.push(createEntrada(entradas.length + 1, historial.tareaId, EstadoTarea.NoIniciada, 0, ALTA_COMENTARIO, `${historial.alta}${ALTA_HORA}`, USUARIO_PRUEBA));
			historial.pasos.forEach((paso) => {
				entradas.push(createEntrada(entradas.length + 1, historial.tareaId, paso.estado, paso.avance, paso.comentario, `${paso.fecha}${PASO_HORA}`, historial.autor));
			});
		});
	return entradas;
};

const byNewest = (a: AvanceTarea, b: AvanceTarea): number =>
	(b.Created?.getTime() ?? 0) - (a.Created?.getTime() ?? 0) || (b.Id ?? 0) - (a.Id ?? 0);

let entradas: AvanceTarea[] = buildEntradas([...HISTORIAL_TABLERO, ...HISTORIAL_STORE, ...HISTORIAL_CATALOGO]);

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

const definedFields = (item: AvanceTarea): Partial<AvanceTarea> => {
	const source = item as unknown as Record<string, unknown>;
	const fields: Record<string, unknown> = {};
	Object.keys(source)
		.filter((key) => source[key] !== undefined)
		.forEach((key) => {
			fields[key] = source[key] === null ? undefined : source[key];
		});
	return fields as Partial<AvanceTarea>;
};

export default class AvanceTareaMock implements IAvanceTareaDataSource {
	public listTitle: string = Lista.AvanceTarea;

	public getItems(): Promise<AvanceTarea[]> {
		return Promise.resolve(entradas.slice());
	}

	public getFilteredItems(tareaId: number): Promise<AvanceTarea[]> {
		return Promise.resolve(entradas.filter((entrada) => entrada.Tarea?.Id === tareaId).sort(byNewest));
	}

	public add(item: AvanceTarea): Promise<AvanceTarea> {
		const nextId = entradas.reduce((maxId, entrada) => Math.max(maxId, entrada.Id ?? 0), 0) + 1;
		const created = Object.assign(new AvanceTarea(), item, { Id: nextId, Created: new Date(), Author: USUARIO_PRUEBA });
		entradas = entradas.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: AvanceTarea): Promise<AvanceTarea> {
		const existente = entradas.filter((entrada) => entrada.Id === item.Id)[0];
		if (!existente) {
			return Promise.reject(notFoundError());
		}
		const edited = Object.assign(new AvanceTarea(), existente, definedFields(item));
		entradas = entradas.map((entrada) => (entrada.Id === edited.Id ? edited : entrada));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		entradas = entradas.filter((entrada) => entrada.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<AvanceTarea> {
		const entrada = entradas.filter((item) => item.Id === itemId)[0];
		return entrada ? Promise.resolve(entrada) : Promise.reject(notFoundError());
	}
}
