import { Tarea } from '../../entities';
import { EstadoTarea, Lista, Prioridad } from '../../utils/Constants';
import { ILookupValue, IPersonValue } from '../../utils/Mappers';
import { BARBARA, MARIA, USUARIO_PRUEBA } from '../Usuario/UsuarioMock';
import ITareaDataSource from './ITareaDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe la tarea solicitada en el mock.';

const OBJETIVO_DATOS: ILookupValue = { Id: 1, Title: 'Convertir datos e insights en ventaja competitiva' };
const OBJETIVO_STORE: ILookupValue = { Id: 2, Title: 'Nuevo motor de crecimiento a través de YPF Store' };
const OBJETIVO_MOVILIDAD: ILookupValue = { Id: 5, Title: 'Habilitar la movilidad eléctrica' };

const INICIATIVA_TABLERO: ILookupValue = { Id: 1, Title: 'Tablero de insights comerciales' };
const INICIATIVA_STORE: ILookupValue = { Id: 4, Title: 'YPF Store en estaciones' };
const INICIATIVA_CATALOGO: ILookupValue = { Id: 5, Title: 'Catálogo online de YPF Store' };
const INICIATIVA_CARGA: ILookupValue = { Id: 11, Title: 'Puntos de carga en estaciones propias' };

const AREA_MERCADO: ILookupValue = { Id: 1, Title: 'Análisis de mercado' };
const AREA_DIGITAL: ILookupValue = { Id: 2, Title: 'Canal digital' };
const AREA_PROMOCIONES: ILookupValue = { Id: 3, Title: 'Promociones' };
const AREA_CONVENIOS: ILookupValue = { Id: 4, Title: 'Gestión de convenios' };

interface IComentarioMockData {
	texto: string;
	fecha: string;
	autor: IPersonValue;
}

interface ITareaMockData {
	id: number;
	iniciativa: ILookupValue;
	objetivo: ILookupValue;
	nombre: string;
	estado: EstadoTarea;
	avance: number;
	prioridad?: Prioridad;
	responsable: IPersonValue;
	areas: ILookupValue[];
	inicio: string;
	compromiso: string;
	finalizacion?: string;
	actualizada: string;
	comentario?: IComentarioMockData;
}

const day = (value: string): string => `${value}T00:00:00`;

const createTarea = (data: ITareaMockData): Tarea =>
	new Tarea({
		Id: data.id,
		Title: data.nombre,
		Nombre: data.nombre,
		Descripcion: `Alcance de la tarea "${data.nombre}".`,
		QueHabilita: `Habilita la continuidad de "${data.nombre}".`,
		Iniciativa: data.iniciativa,
		Objetivo: data.objetivo,
		Responsable: data.responsable,
		Prioridad: data.prioridad,
		FechaInicio: day(data.inicio),
		FechaCompromiso: day(data.compromiso),
		Avance: data.avance,
		Estado: data.estado,
		FechaFinalizacion: data.finalizacion === undefined ? undefined : day(data.finalizacion),
		FechaUltimaActualizacion: day(data.actualizada),
		ComentarioEjecutivo: data.comentario?.texto,
		ComentarioEjecutivoFecha: data.comentario === undefined ? undefined : day(data.comentario.fecha),
		ComentarioEjecutivoAutor: data.comentario?.autor,
		Area: data.areas
	});

const ROTACION: IPersonValue[] = [USUARIO_PRUEBA, BARBARA, MARIA];

const rotar = (indice: number): IPersonValue => ROTACION[indice % ROTACION.length];

const TAREAS_TABLERO: ITareaMockData[] = [
	{ id: 1, iniciativa: INICIATIVA_TABLERO, objetivo: OBJETIVO_DATOS, nombre: 'Estrategia Portfolio Management', estado: EstadoTarea.Finalizada, avance: 100, prioridad: Prioridad.Alta, responsable: BARBARA, areas: [AREA_MERCADO], inicio: '2026-01-15', compromiso: '2026-02-02', finalizacion: '2026-02-02', actualizada: '2026-02-02' },
	{ id: 2, iniciativa: INICIATIVA_TABLERO, objetivo: OBJETIVO_DATOS, nombre: 'Diseño de Prototipo de Imagen y Experiencia BLACK/FULL - Nordelta', estado: EstadoTarea.EnCurso, avance: 95, prioridad: Prioridad.Alta, responsable: USUARIO_PRUEBA, areas: [AREA_MERCADO, AREA_DIGITAL, AREA_PROMOCIONES], inicio: '2026-01-20', compromiso: '2026-06-15', actualizada: '2026-05-20', comentario: { texto: 'Se validó el prototipo con Comercial Retail.', fecha: '2026-05-20', autor: USUARIO_PRUEBA } },
	{ id: 3, iniciativa: INICIATIVA_TABLERO, objetivo: OBJETIVO_DATOS, nombre: 'Diseño de la Propuesta de Valor BLACK en Playa, FULL y BOXES', estado: EstadoTarea.EnCurso, avance: 50, prioridad: Prioridad.Media, responsable: USUARIO_PRUEBA, areas: [AREA_DIGITAL], inicio: '2026-02-01', compromiso: '2026-06-30', actualizada: '2026-04-10' },
	{ id: 4, iniciativa: INICIATIVA_TABLERO, objetivo: OBJETIVO_DATOS, nombre: 'Plan de Comunicación e Inauguración BLACK Nordelta', estado: EstadoTarea.EnCurso, avance: 20, responsable: BARBARA, areas: [AREA_PROMOCIONES], inicio: '2026-03-01', compromiso: '2026-06-30', actualizada: '2026-03-15' },
	{ id: 5, iniciativa: INICIATIVA_TABLERO, objetivo: OBJETIVO_DATOS, nombre: 'Adecuación y Desarrollo de Prototipo BLACK para Despliegue 2026', estado: EstadoTarea.Frenada, avance: 40, prioridad: Prioridad.Alta, responsable: MARIA, areas: [AREA_CONVENIOS, AREA_MERCADO], inicio: '2026-02-15', compromiso: '2026-06-30', actualizada: '2026-04-25', comentario: { texto: 'El proveedor demora la entrega de materiales.', fecha: '2026-04-25', autor: MARIA } },
	{ id: 6, iniciativa: INICIATIVA_TABLERO, objetivo: OBJETIVO_DATOS, nombre: 'Relevamiento de estaciones piloto', estado: EstadoTarea.NoIniciada, avance: 0, prioridad: Prioridad.Baja, responsable: USUARIO_PRUEBA, areas: [AREA_MERCADO], inicio: '2026-04-01', compromiso: '2026-06-15', actualizada: '2026-03-20' },
	{ id: 7, iniciativa: INICIATIVA_TABLERO, objetivo: OBJETIVO_DATOS, nombre: 'Piloto en estación de Rosario', estado: EstadoTarea.Cancelada, avance: 10, prioridad: Prioridad.Media, responsable: BARBARA, areas: [AREA_DIGITAL], inicio: '2026-02-10', compromiso: '2026-06-30', actualizada: '2026-03-05', comentario: { texto: 'Se cancela: el piloto pasa a Nordelta.', fecha: '2026-03-05', autor: BARBARA } }
];

const ETAPAS_STORE_PRIMERA_ID = 8;
const ETAPAS_STORE_CANTIDAD = 8;
const AVANCE_ETAPA_PASO = 10;

const TAREAS_STORE_ETAPAS: ITareaMockData[] = Array.from({ length: ETAPAS_STORE_CANTIDAD }, (_, indice) => ({
	id: ETAPAS_STORE_PRIMERA_ID + indice,
	iniciativa: INICIATIVA_STORE,
	objetivo: OBJETIVO_STORE,
	nombre: `Despliegue YPF Store, etapa ${indice + 1}`,
	estado: EstadoTarea.EnCurso,
	avance: AVANCE_ETAPA_PASO * (indice + 1),
	prioridad: Prioridad.Media,
	responsable: rotar(indice),
	areas: [AREA_DIGITAL],
	inicio: '2026-02-01',
	compromiso: '2026-12-31',
	actualizada: '2026-03-01'
}));

const TAREAS_STORE: ITareaMockData[] = [
	...TAREAS_STORE_ETAPAS,
	{ id: 16, iniciativa: INICIATIVA_STORE, objetivo: OBJETIVO_STORE, nombre: 'Puesta en marcha en estaciones del interior', estado: EstadoTarea.Frenada, avance: 35, prioridad: Prioridad.Media, responsable: MARIA, areas: [AREA_DIGITAL], inicio: '2026-02-01', compromiso: '2026-12-31', actualizada: '2026-04-01' },
	{ id: 17, iniciativa: INICIATIVA_STORE, objetivo: OBJETIVO_STORE, nombre: 'Relevamiento inicial de estaciones', estado: EstadoTarea.Finalizada, avance: 100, prioridad: Prioridad.Media, responsable: BARBARA, areas: [AREA_DIGITAL], inicio: '2026-01-15', compromiso: '2026-06-30', finalizacion: '2026-06-30', actualizada: '2026-06-30' },
	{ id: 18, iniciativa: INICIATIVA_STORE, objetivo: OBJETIVO_STORE, nombre: 'Catálogo en papel para estaciones', estado: EstadoTarea.Cancelada, avance: 5, prioridad: Prioridad.Media, responsable: USUARIO_PRUEBA, areas: [AREA_DIGITAL], inicio: '2026-02-01', compromiso: '2026-12-31', actualizada: '2026-02-15' }
];

const TAREA_OTRA_VP: ITareaMockData = {
	id: 19,
	iniciativa: INICIATIVA_CARGA,
	objetivo: OBJETIVO_MOVILIDAD,
	nombre: 'Instalar cargadores en estaciones piloto',
	estado: EstadoTarea.NoIniciada,
	avance: 0,
	prioridad: Prioridad.Media,
	responsable: MARIA,
	areas: [AREA_CONVENIOS],
	inicio: '2026-03-01',
	compromiso: '2026-12-31',
	actualizada: '2026-02-20'
};

const CATALOGO_NO_INICIADAS_PRIMERA_ID = 20;
const CATALOGO_NO_INICIADAS_CANTIDAD = 5;
const CATALOGO_FRENADAS_PRIMERA_ID = 25;
const CATALOGO_FRENADAS_CANTIDAD = 2;
const CATALOGO_FINALIZADAS_PRIMERA_ID = 27;
const CATALOGO_FINALIZADAS_CANTIDAD = 2;
const CATALOGO_FRENADAS_DESFASE = 2;
const CATALOGO_PAGOS_AVANCE = 30;

const TAREAS_CATALOGO_NO_INICIADAS: ITareaMockData[] = Array.from({ length: CATALOGO_NO_INICIADAS_CANTIDAD }, (_, indice) => ({
	id: CATALOGO_NO_INICIADAS_PRIMERA_ID + indice,
	iniciativa: INICIATIVA_CATALOGO,
	objetivo: OBJETIVO_STORE,
	nombre: `Catálogo online, etapa ${indice + 1}`,
	estado: EstadoTarea.NoIniciada,
	avance: 0,
	prioridad: Prioridad.Media,
	responsable: rotar(indice),
	areas: [AREA_PROMOCIONES],
	inicio: '2026-05-01',
	compromiso: '2026-12-31',
	actualizada: '2026-04-10'
}));

const TAREAS_CATALOGO_FRENADAS: ITareaMockData[] = Array.from({ length: CATALOGO_FRENADAS_CANTIDAD }, (_, indice) => ({
	id: CATALOGO_FRENADAS_PRIMERA_ID + indice,
	iniciativa: INICIATIVA_CATALOGO,
	objetivo: OBJETIVO_STORE,
	nombre: `Integración de pagos, etapa ${indice + 1}`,
	estado: EstadoTarea.Frenada,
	avance: CATALOGO_PAGOS_AVANCE,
	prioridad: Prioridad.Media,
	responsable: rotar(indice + CATALOGO_FRENADAS_DESFASE),
	areas: [AREA_PROMOCIONES],
	inicio: '2026-05-01',
	compromiso: '2026-12-31',
	actualizada: '2026-06-01'
}));

const TAREAS_CATALOGO_FINALIZADAS: ITareaMockData[] = Array.from({ length: CATALOGO_FINALIZADAS_CANTIDAD }, (_, indice) => ({
	id: CATALOGO_FINALIZADAS_PRIMERA_ID + indice,
	iniciativa: INICIATIVA_CATALOGO,
	objetivo: OBJETIVO_STORE,
	nombre: `Relevamiento de catálogo ${indice + 1}`,
	estado: EstadoTarea.Finalizada,
	avance: 100,
	prioridad: Prioridad.Media,
	responsable: rotar(indice + 1),
	areas: [AREA_PROMOCIONES],
	inicio: '2026-04-01',
	compromiso: '2026-06-15',
	finalizacion: '2026-06-15',
	actualizada: '2026-06-15'
}));

let tareas: Tarea[] = [
	...TAREAS_TABLERO,
	...TAREAS_STORE,
	TAREA_OTRA_VP,
	...TAREAS_CATALOGO_NO_INICIADAS,
	...TAREAS_CATALOGO_FRENADAS,
	...TAREAS_CATALOGO_FINALIZADAS
].map(createTarea);

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

const definedFields = (item: Tarea): Partial<Tarea> => {
	const source = item as unknown as Record<string, unknown>;
	const fields: Record<string, unknown> = {};
	Object.keys(source)
		.filter((key) => source[key] !== undefined)
		.forEach((key) => {
			fields[key] = source[key] === null ? undefined : source[key];
		});
	return fields as Partial<Tarea>;
};

export default class TareaMock implements ITareaDataSource {
	public listTitle: string = Lista.Tarea;

	public getItems(): Promise<Tarea[]> {
		return Promise.resolve(tareas.slice());
	}

	public getFilteredItems(iniciativaId: number): Promise<Tarea[]> {
		return Promise.resolve(tareas.filter((tarea) => tarea.Iniciativa?.Id === iniciativaId));
	}

	public add(item: Tarea): Promise<Tarea> {
		const nextId = tareas.reduce((maxId, tarea) => Math.max(maxId, tarea.Id ?? 0), 0) + 1;
		const created = Object.assign(new Tarea(), item, { Id: nextId, Created: new Date(), Author: USUARIO_PRUEBA });
		tareas = tareas.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: Tarea): Promise<Tarea> {
		const existente = tareas.filter((tarea) => tarea.Id === item.Id)[0];
		if (!existente) {
			return Promise.reject(notFoundError());
		}
		const edited = Object.assign(new Tarea(), existente, definedFields(item));
		tareas = tareas.map((tarea) => (tarea.Id === edited.Id ? edited : tarea));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		tareas = tareas.filter((tarea) => tarea.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<Tarea> {
		const tarea = tareas.filter((item) => item.Id === itemId)[0];
		return tarea ? Promise.resolve(tarea) : Promise.reject(notFoundError());
	}
}
