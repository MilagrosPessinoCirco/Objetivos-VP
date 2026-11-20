import { Iniciativa } from '../../entities';
import { EstadoIniciativa, Lista } from '../../utils/Constants';
import { ILookupValue, IPersonValue } from '../../utils/Mappers';
import { BARBARA, MARIA, USUARIO_PRUEBA } from '../Usuario/UsuarioMock';
import IIniciativaDataSource from './IIniciativaDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe la iniciativa solicitada en el mock.';

const OBJETIVO_DATOS: ILookupValue = { Id: 1, Title: 'Convertir datos e insights en ventaja competitiva' };
const OBJETIVO_STORE: ILookupValue = { Id: 2, Title: 'Nuevo motor de crecimiento a través de YPF Store' };
const OBJETIVO_CLIENTES: ILookupValue = { Id: 3, Title: 'Duplicar la cantidad de clientes YPF' };
const OBJETIVO_MOVILIDAD: ILookupValue = { Id: 5, Title: 'Habilitar la movilidad eléctrica' };
const OBJETIVO_ATENCION: ILookupValue = { Id: 6, Title: 'Integrar los canales de atención' };
const OBJETIVO_MARCAS: ILookupValue = { Id: 7, Title: 'Ordenar el portfolio de marcas' };

const AREA_MERCADO: ILookupValue = { Id: 1, Title: 'Análisis de mercado' };
const AREA_DIGITAL: ILookupValue = { Id: 2, Title: 'Canal digital' };
const AREA_PROMOCIONES: ILookupValue = { Id: 3, Title: 'Promociones' };
const AREA_CONVENIOS: ILookupValue = { Id: 4, Title: 'Gestión de convenios' };

const createIniciativa = (
	id: number,
	nombre: string,
	objetivo: ILookupValue,
	accountable: IPersonValue,
	areas: ILookupValue[],
	estado: EstadoIniciativa,
	fechaInicio: string,
	fechaCompromiso: string
): Iniciativa =>
	new Iniciativa({
		Id: id,
		Title: nombre,
		Nombre: nombre,
		Descripcion: `Impacto esperado de ${nombre.toLowerCase()}.`,
		Objetivo: objetivo,
		Accountable: accountable,
		Area: areas,
		Estado: estado,
		FechaInicio: fechaInicio,
		FechaCompromiso: fechaCompromiso
	});

let iniciativas: Iniciativa[] = [
	createIniciativa(1, 'Tablero de insights comerciales', OBJETIVO_DATOS, USUARIO_PRUEBA, [AREA_MERCADO, AREA_DIGITAL], EstadoIniciativa.EnCurso, '2026-01-15', '2026-06-30'),
	createIniciativa(2, 'Estudio de segmentación de clientes', OBJETIVO_DATOS, BARBARA, [AREA_MERCADO], EstadoIniciativa.NoIniciada, '2026-03-01', '2026-12-31'),
	createIniciativa(3, 'Modelo de propensión de compra', OBJETIVO_DATOS, MARIA, [], EstadoIniciativa.Frenada, '2026-02-01', '2026-09-30'),
	createIniciativa(4, 'YPF Store en estaciones', OBJETIVO_STORE, USUARIO_PRUEBA, [AREA_DIGITAL, AREA_PROMOCIONES], EstadoIniciativa.EnCurso, '2026-01-01', '2027-12-31'),
	createIniciativa(5, 'Catálogo online de YPF Store', OBJETIVO_STORE, BARBARA, [AREA_PROMOCIONES], EstadoIniciativa.EnCurso, '2026-04-01', '2027-06-30'),
	createIniciativa(6, 'Piloto de tienda en Córdoba', OBJETIVO_STORE, MARIA, [], EstadoIniciativa.Finalizada, '2026-01-01', '2026-06-30'),
	createIniciativa(7, 'Expansión de YPF Store al interior', OBJETIVO_STORE, BARBARA, [AREA_DIGITAL], EstadoIniciativa.NoIniciada, '2027-01-01', '2027-12-31'),
	createIniciativa(8, 'Venta de YPF Store por catálogo impreso', OBJETIVO_STORE, MARIA, [], EstadoIniciativa.Cancelada, '2026-01-01', '2026-12-31'),
	createIniciativa(9, 'Promo vaso coleccionable', OBJETIVO_CLIENTES, USUARIO_PRUEBA, [AREA_PROMOCIONES], EstadoIniciativa.EnCurso, '2026-03-01', '2026-12-31'),
	createIniciativa(10, 'Programa de referidos', OBJETIVO_CLIENTES, BARBARA, [], EstadoIniciativa.NoIniciada, '2026-05-01', '2026-11-30'),
	createIniciativa(11, 'Puntos de carga en estaciones propias', OBJETIVO_MOVILIDAD, USUARIO_PRUEBA, [AREA_CONVENIOS], EstadoIniciativa.EnCurso, '2026-01-01', '2028-12-31'),
	createIniciativa(12, 'Centro de atención unificado', OBJETIVO_ATENCION, MARIA, [AREA_CONVENIOS], EstadoIniciativa.Frenada, '2026-02-01', '2026-10-31'),
	createIniciativa(13, 'Manual de marcas del portfolio', OBJETIVO_MARCAS, BARBARA, [AREA_MERCADO], EstadoIniciativa.EnCurso, '2026-02-01', '2026-11-30')
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

export default class IniciativaMock implements IIniciativaDataSource {
	public listTitle: string = Lista.Iniciativa;

	public getItems(): Promise<Iniciativa[]> {
		return Promise.resolve(iniciativas.slice());
	}

	public getFilteredItems(objetivoId: number): Promise<Iniciativa[]> {
		return Promise.resolve(iniciativas.filter((iniciativa) => iniciativa.Objetivo?.Id === objetivoId));
	}

	public add(item: Iniciativa): Promise<Iniciativa> {
		const nextId = iniciativas.reduce((maxId, iniciativa) => Math.max(maxId, iniciativa.Id ?? 0), 0) + 1;
		const created = Object.assign(new Iniciativa(), item, { Id: nextId });
		iniciativas = iniciativas.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: Iniciativa): Promise<Iniciativa> {
		if (!iniciativas.some((iniciativa) => iniciativa.Id === item.Id)) {
			return Promise.reject(notFoundError());
		}
		const edited = Object.assign(new Iniciativa(), item);
		iniciativas = iniciativas.map((iniciativa) => (iniciativa.Id === edited.Id ? edited : iniciativa));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		iniciativas = iniciativas.filter((iniciativa) => iniciativa.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<Iniciativa> {
		const iniciativa = iniciativas.filter((item) => item.Id === itemId)[0];
		return iniciativa ? Promise.resolve(iniciativa) : Promise.reject(notFoundError());
	}
}
