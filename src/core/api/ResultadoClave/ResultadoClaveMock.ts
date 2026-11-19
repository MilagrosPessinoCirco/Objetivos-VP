import { ResultadoClave } from '../../entities';
import { Lista, TipoMedicion } from '../../utils/Constants';
import { ILookupValue } from '../../utils/Mappers';
import { USUARIO_PRUEBA } from '../Usuario/UsuarioMock';
import IResultadoClaveDataSource from './IResultadoClaveDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe el resultado clave solicitado en el mock.';
const EVIDENCIA_EJEMPLO = 'https://ejemplo.sharepoint.com/sites/ejemplo/evidencia-1.pdf';

const INICIATIVA_TABLERO: ILookupValue = { Id: 1, Title: 'Tablero de insights comerciales' };
const INICIATIVA_SEGMENTACION: ILookupValue = { Id: 2, Title: 'Estudio de segmentación de clientes' };
const INICIATIVA_PROPENSION: ILookupValue = { Id: 3, Title: 'Modelo de propensión de compra' };
const INICIATIVA_STORE: ILookupValue = { Id: 4, Title: 'YPF Store en estaciones' };
const INICIATIVA_CATALOGO: ILookupValue = { Id: 5, Title: 'Catálogo online de YPF Store' };
const INICIATIVA_PILOTO: ILookupValue = { Id: 6, Title: 'Piloto de tienda en Córdoba' };
const INICIATIVA_IMPRESO: ILookupValue = { Id: 8, Title: 'Venta de YPF Store por catálogo impreso' };
const INICIATIVA_VASO: ILookupValue = { Id: 9, Title: 'Promo vaso coleccionable' };
const INICIATIVA_REFERIDOS: ILookupValue = { Id: 10, Title: 'Programa de referidos' };

interface IResultadoClaveMockData {
	id: number;
	iniciativa: ILookupValue;
	nombre: string;
	tipo: TipoMedicion;
	unidad: string;
	minimo: number;
	meta: number;
	maximo: number;
	actual?: number;
	proyectado: number;
	fuente?: string;
	evidencia?: string;
}

const createResultado = (data: IResultadoClaveMockData): ResultadoClave =>
	new ResultadoClave({
		Id: data.id,
		Title: data.nombre,
		Nombre: data.nombre,
		Iniciativa: data.iniciativa,
		TipoMedicion: data.tipo,
		UnidadMedida: data.unidad,
		Minimo: data.minimo,
		Meta: data.meta,
		Maximo: data.maximo,
		ValorActual: data.actual,
		ValorProyectado: data.proyectado,
		Fuente: data.fuente,
		Evidencia: data.evidencia === undefined ? undefined : { Url: data.evidencia, Description: '' }
	});

let resultados: ResultadoClave[] = [
	createResultado({ id: 1, iniciativa: INICIATIVA_TABLERO, nombre: 'Informes comerciales publicados', tipo: TipoMedicion.Cantidad, unidad: 'informes', minimo: 20, meta: 80, maximo: 100, actual: 40, proyectado: 85, fuente: 'Tablero de gestión', evidencia: EVIDENCIA_EJEMPLO }),
	createResultado({ id: 2, iniciativa: INICIATIVA_TABLERO, nombre: 'Ahorro generado por decisiones basadas en datos', tipo: TipoMedicion.Moneda, unidad: 'KUSD', minimo: 100, meta: 200, maximo: 210, actual: 230, proyectado: 230 }),
	createResultado({ id: 3, iniciativa: INICIATIVA_SEGMENTACION, nombre: 'Segmentos de clientes definidos', tipo: TipoMedicion.Cantidad, unidad: 'segmentos', minimo: 5, meta: 9, maximo: 10, actual: 9, proyectado: 10 }),
	createResultado({ id: 4, iniciativa: INICIATIVA_PROPENSION, nombre: 'Modelos de propensión en producción', tipo: TipoMedicion.Cantidad, unidad: 'modelos', minimo: 20, meta: 40, maximo: 50, actual: 30, proyectado: 40 }),
	createResultado({ id: 5, iniciativa: INICIATIVA_STORE, nombre: 'Implementar YPF Store en 40 EESS', tipo: TipoMedicion.Cantidad, unidad: 'estaciones', minimo: 10, meta: 30, maximo: 40, proyectado: 30 }),
	createResultado({ id: 6, iniciativa: INICIATIVA_CATALOGO, nombre: 'Productos publicados en el catálogo', tipo: TipoMedicion.Cantidad, unidad: 'productos', minimo: 100, meta: 300, maximo: 400, actual: 50, proyectado: 300 }),
	createResultado({ id: 7, iniciativa: INICIATIVA_CATALOGO, nombre: 'Conversión del canal online', tipo: TipoMedicion.Porcentaje, unidad: '%', minimo: 1, meta: 3, maximo: 5, actual: 3, proyectado: 4 }),
	createResultado({ id: 8, iniciativa: INICIATIVA_CATALOGO, nombre: 'Ventas online', tipo: TipoMedicion.Moneda, unidad: 'KUSD', minimo: 50, meta: 100, maximo: 150, actual: 150, proyectado: 160 }),
	createResultado({ id: 9, iniciativa: INICIATIVA_PILOTO, nombre: 'Tiendas piloto operativas', tipo: TipoMedicion.Cantidad, unidad: 'tiendas', minimo: 1, meta: 3, maximo: 3, actual: 3, proyectado: 3 }),
	createResultado({ id: 10, iniciativa: INICIATIVA_IMPRESO, nombre: 'Catálogos impresos distribuidos', tipo: TipoMedicion.Cantidad, unidad: 'catálogos', minimo: 100, meta: 500, maximo: 1000, actual: 1000, proyectado: 1000 }),
	createResultado({ id: 11, iniciativa: INICIATIVA_VASO, nombre: 'Clientes nuevos con la promo', tipo: TipoMedicion.Cantidad, unidad: 'clientes', minimo: 1000, meta: 2000, maximo: 2500, actual: 3000, proyectado: 3000 }),
	createResultado({ id: 12, iniciativa: INICIATIVA_REFERIDOS, nombre: 'Referidos activos', tipo: TipoMedicion.Cantidad, unidad: 'referidos', minimo: 100, meta: 100, maximo: 100, actual: 100, proyectado: 100 })
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

const definedFields = (item: ResultadoClave): Partial<ResultadoClave> => {
	const source = item as unknown as Record<string, unknown>;
	const fields: Record<string, unknown> = {};
	Object.keys(source)
		.filter((key) => source[key] !== undefined)
		.forEach((key) => {
			fields[key] = source[key] === null ? undefined : source[key];
		});
	return fields as Partial<ResultadoClave>;
};

export default class ResultadoClaveMock implements IResultadoClaveDataSource {
	public listTitle: string = Lista.ResultadoClave;

	public getItems(): Promise<ResultadoClave[]> {
		return Promise.resolve(resultados.slice());
	}

	public add(item: ResultadoClave): Promise<ResultadoClave> {
		const nextId = resultados.reduce((maxId, resultado) => Math.max(maxId, resultado.Id ?? 0), 0) + 1;
		const created = Object.assign(new ResultadoClave(), item, { Id: nextId, Created: new Date(), Author: USUARIO_PRUEBA });
		resultados = resultados.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: ResultadoClave): Promise<ResultadoClave> {
		const existente = resultados.filter((resultado) => resultado.Id === item.Id)[0];
		if (!existente) {
			return Promise.reject(notFoundError());
		}
		const edited = Object.assign(new ResultadoClave(), existente, definedFields(item));
		resultados = resultados.map((resultado) => (resultado.Id === edited.Id ? edited : resultado));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		resultados = resultados.filter((resultado) => resultado.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<ResultadoClave> {
		const resultado = resultados.filter((item) => item.Id === itemId)[0];
		return resultado ? Promise.resolve(resultado) : Promise.reject(notFoundError());
	}
}
