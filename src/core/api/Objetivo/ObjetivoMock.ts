import { Objetivo } from '../../entities';
import { Duracion, Estado, Lista, VP_RRII_NOMBRE } from '../../utils/Constants';
import IObjetivoDataSource from './IObjetivoDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe el objetivo solicitado en el mock.';

const VP_RRII = { Id: 1, Title: VP_RRII_NOMBRE };
const MARKETING = { Id: 1, Title: 'Marketing' };
const ALIANZAS = { Id: 2, Title: 'Alianzas' };
const FIDELIZACION = { Id: 3, Title: 'Fidelización' };

const createRrii = (
	id: number,
	nombre: string,
	descripcion: string,
	departamento: { Id: number; Title: string },
	gerencia: { Id: number; Title: string },
	palanca: { Id: number; Title: string },
	duracion: Duracion,
	peso: number,
	esDeVp: boolean,
	fechaInicio: string,
	fechaCompromiso: string,
	estado: Estado
): Objetivo =>
	new Objetivo({
		Id: id,
		Title: nombre,
		Nombre: nombre,
		Descripcion: descripcion,
		VP: VP_RRII,
		Departamento: departamento,
		Gerencia: gerencia,
		Palanca: palanca,
		Duracion: duracion,
		Peso: peso,
		EsDelVp: esDeVp,
		FechaInicio: fechaInicio,
		FechaCompromiso: fechaCompromiso,
		Estado: estado
	});

const createOtraVp = (
	id: number,
	nombre: string,
	descripcion: string,
	vp: { Id: number; Title: string },
	departamento: { Id: number; Title: string },
	gerencia: { Id: number; Title: string },
	estado: Estado
): Objetivo =>
	new Objetivo({
		Id: id,
		Title: nombre,
		Nombre: nombre,
		Descripcion: descripcion,
		VP: vp,
		Departamento: departamento,
		Gerencia: gerencia,
		Estado: estado
	});

let objetivos: Objetivo[] = [
	createRrii(1, 'Convertir datos e insights en ventaja competitiva', 'Que las decisiones del negocio se apoyen en estudios y datos.', MARKETING, { Id: 1, Title: 'B2B' }, { Id: 1, Title: 'Excelencia comercial' }, Duracion.Anual, 20, true, '2026-01-01', '2026-12-31', Estado.EnCurso),
	createRrii(2, 'Nuevo motor de crecimiento a través de YPF Store', 'Llevar YPF Store a las estaciones de servicio y al canal online.', MARKETING, { Id: 2, Title: 'B2C' }, { Id: 2, Title: 'Experiencia de cliente' }, Duracion.Plurianual, 30, false, '2026-01-01', '2027-12-31', Estado.EnCurso),
	createRrii(3, 'Duplicar la cantidad de clientes YPF', 'Duplicar los clientes activos con campañas y promociones.', MARKETING, { Id: 3, Title: 'Growth' }, { Id: 2, Title: 'Experiencia de cliente' }, Duracion.Anual, 25, true, '2026-03-01', '2026-12-31', Estado.NoIniciada),
	createRrii(4, 'Consolidar alianzas estratégicas', 'Sostener las alianzas vigentes con socios clave.', ALIANZAS, { Id: 4, Title: 'Convenios' }, { Id: 5, Title: 'Eficiencia en el canal' }, Duracion.Permanente, 25, false, '2026-01-01', '2026-12-31', Estado.FinalizadoCumplido),
	createOtraVp(5, 'Habilitar la movilidad eléctrica', 'Instalar puntos de carga en la red de estaciones.', { Id: 3, Title: 'VP Downstream' }, FIDELIZACION, { Id: 5, Title: 'Programas' }, Estado.EnCurso),
	createOtraVp(6, 'Integrar los canales de atención', 'Unificar la atención de clientes en un solo canal.', { Id: 4, Title: 'VP Finanzas' }, ALIANZAS, { Id: 4, Title: 'Convenios' }, Estado.FinalizadoIncumplido)
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

export default class ObjetivoMock implements IObjetivoDataSource {
	public listTitle: string = Lista.Objetivo;

	public getItems(): Promise<Objetivo[]> {
		return Promise.resolve(objetivos.slice());
	}

	public getFilteredItems(palancaId: number): Promise<Objetivo[]> {
		return Promise.resolve(objetivos.filter((objetivo) => objetivo.Palanca?.Id === palancaId));
	}

	public add(item: Objetivo): Promise<Objetivo> {
		const nextId = objetivos.reduce((maxId, objetivo) => Math.max(maxId, objetivo.Id ?? 0), 0) + 1;
		const created = Object.assign(new Objetivo(), item, { Id: nextId });
		objetivos = objetivos.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: Objetivo): Promise<Objetivo> {
		if (!objetivos.some((objetivo) => objetivo.Id === item.Id)) {
			return Promise.reject(notFoundError());
		}
		const edited = Object.assign(new Objetivo(), item);
		objetivos = objetivos.map((objetivo) => (objetivo.Id === edited.Id ? edited : objetivo));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		objetivos = objetivos.filter((objetivo) => objetivo.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<Objetivo> {
		const objetivo = objetivos.filter((item) => item.Id === itemId)[0];
		return objetivo ? Promise.resolve(objetivo) : Promise.reject(notFoundError());
	}
}
