import type { IUbicacionEstrategiaData, TipoEntidad } from '../../../../../core/api/UbicacionEstrategia/useUbicacionEstrategia';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatPalancaId } from '../../Palanca/formatPalancaId';
import { formatObjetivoId } from '../../Objetivo/objetivoUtils';
import { formatIdNombre, formatIniciativaId } from '../../Iniciativa/iniciativaUtils';
import { formatTareaId } from '../../Tarea/tareaUtils';
import { getIniciativaPath, getObjetivoPath, getPalancaPath, getTareaPath } from '../../ObjetivosVp/routes';

export interface IItemUbicacion {
	key: string;
	label: string;
	path?: string;
}

export interface INivel {
	key: TipoEntidad;
	titulo: string;
	actual: boolean;
	items: IItemUbicacion[];
}

interface IEntidadNombrada {
	Id?: number;
	Nombre?: string;
}

const OTRA_VP_ITEM_KEY = 'otraVp';

const FORMAT_ID_POR_TIPO: Record<TipoEntidad, (id: number | undefined) => string> = {
	palanca: formatPalancaId,
	objetivo: formatObjetivoId,
	iniciativa: formatIniciativaId,
	tarea: formatTareaId
};

const PATH_POR_TIPO: Record<TipoEntidad, (id: number) => string> = {
	palanca: getPalancaPath,
	objetivo: getObjetivoPath,
	iniciativa: getIniciativaPath,
	tarea: getTareaPath
};

export const formatEntidadId = (tipo: TipoEntidad, id: number): string => FORMAT_ID_POR_TIPO[tipo](id);

const buildItems = (nivel: TipoEntidad, entidades: IEntidadNombrada[], tipo: TipoEntidad, id: number): IItemUbicacion[] =>
	entidades.reduce<IItemUbicacion[]>((items, entidad) => {
		if (entidad.Id === undefined) {
			return items;
		}
		const esActual = nivel === tipo && entidad.Id === id;
		return items.concat([{
			key: `${nivel}-${entidad.Id}`,
			label: formatIdNombre(FORMAT_ID_POR_TIPO[nivel](entidad.Id), entidad.Nombre),
			path: esActual ? undefined : PATH_POR_TIPO[nivel](entidad.Id)
		}]);
	}, []);

const buildTitulo = (template: string, cantidad: number): string => Utils.replaceAll(template, '{0}', String(cantidad));

export const buildNiveles = (
	data: IUbicacionEstrategiaData,
	tipo: TipoEntidad,
	id: number,
	otraVp?: string
): INivel[] => {
	const palancas = buildItems('palanca', data.palancas.map((palanca) => ({ Id: palanca.Id, Nombre: palanca.Title })), tipo, id);
	const objetivos = buildItems('objetivo', data.objetivos, tipo, id);
	const iniciativas = buildItems('iniciativa', data.iniciativas, tipo, id);
	const tareas = buildItems('tarea', data.tareas, tipo, id);

	const nivelPalanca: INivel = otraVp !== undefined
		? { key: 'palanca', titulo: strings.UbicacionNivelOtraVp, actual: false, items: [{ key: OTRA_VP_ITEM_KEY, label: otraVp }] }
		: { key: 'palanca', titulo: buildTitulo(strings.UbicacionNivelPalanca, palancas.length), actual: tipo === 'palanca', items: palancas };

	return [
		nivelPalanca,
		{ key: 'objetivo', titulo: buildTitulo(strings.UbicacionNivelObjetivo, objetivos.length), actual: tipo === 'objetivo', items: objetivos },
		{ key: 'iniciativa', titulo: buildTitulo(strings.UbicacionNivelIniciativas, iniciativas.length), actual: tipo === 'iniciativa', items: iniciativas },
		{ key: 'tarea', titulo: buildTitulo(strings.UbicacionNivelTareas, tareas.length), actual: tipo === 'tarea', items: tareas }
	];
};
