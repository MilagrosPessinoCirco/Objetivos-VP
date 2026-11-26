import { useEffect, useRef, useState } from 'react';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { stringIsNullOrEmpty } from '@pnp/common';

import { Iniciativa, Objetivo, Tarea } from '../../entities';
import { ILookupValue } from '../../utils/Mappers';
import IPalancaDataSource from '../Palanca/IPalancaDataSource';
import PalancaDataSource from '../Palanca/PalancaDataSource';
import PalancaMock from '../Palanca/PalancaMock';
import IObjetivoDataSource from '../Objetivo/IObjetivoDataSource';
import ObjetivoDataSource from '../Objetivo/ObjetivoDataSource';
import ObjetivoMock from '../Objetivo/ObjetivoMock';
import IIniciativaDataSource from '../Iniciativa/IIniciativaDataSource';
import IniciativaDataSource from '../Iniciativa/IniciativaDataSource';
import IniciativaMock from '../Iniciativa/IniciativaMock';
import TareaDataSource from '../Tarea/TareaDataSource';

export type TipoEntidad = 'palanca' | 'objetivo' | 'iniciativa' | 'tarea';

export interface IUbicacionEstrategiaData {
	palancas: ILookupValue[];
	objetivos: Objetivo[];
	iniciativas: Iniciativa[];
	tareas: Tarea[];
}

export interface IUbicacionEstrategiaOptions {
	enabled: boolean;
	filtrarObjetivos?: (objetivos: Objetivo[]) => Objetivo[];
	omitirPalanca?: boolean;
}

export interface IUbicacionEstrategiaState {
	data?: IUbicacionEstrategiaData;
	isLoading: boolean;
	error: boolean;
	reload: () => void;
}

interface ICachedState {
	key?: string;
	data?: IUbicacionEstrategiaData;
	isLoading: boolean;
	error: boolean;
}

const selectDatasource = <T extends { listTitle: string }>(datasource: T, mock: T): T =>
	Environment.type === EnvironmentType.SharePoint && !stringIsNullOrEmpty(datasource.listTitle) ? datasource : mock;

const sortById = <T extends { Id?: number }>(items: T[]): T[] =>
	items.slice().sort((a, b) => (a.Id ?? 0) - (b.Id ?? 0));

const idsOf = (items: Array<{ Id?: number }>): number[] =>
	items.map((item) => item.Id).filter((id): id is number => id !== undefined);

const palancasOf = (objetivo: Objetivo | undefined, omitirPalanca: boolean | undefined): ILookupValue[] =>
	objetivo?.Palanca && !omitirPalanca ? [objetivo.Palanca] : [];

const buildData = (data: IUbicacionEstrategiaData): IUbicacionEstrategiaData => ({
	palancas: data.palancas,
	objetivos: sortById(data.objetivos),
	iniciativas: sortById(data.iniciativas),
	tareas: sortById(data.tareas)
});

const loadTarea = async (id: number, omitirPalanca: boolean | undefined): Promise<IUbicacionEstrategiaData> => {
	const tarea = await new TareaDataSource().getById(id);
	const iniciativa = tarea.Iniciativa
		? await selectDatasource<IIniciativaDataSource>(new IniciativaDataSource(), new IniciativaMock()).getById(tarea.Iniciativa.Id)
		: undefined;
	const objetivo = iniciativa?.Objetivo
		? await selectDatasource<IObjetivoDataSource>(new ObjetivoDataSource(), new ObjetivoMock()).getById(iniciativa.Objetivo.Id)
		: undefined;
	return buildData({
		palancas: palancasOf(objetivo, omitirPalanca),
		objetivos: objetivo ? [objetivo] : [],
		iniciativas: iniciativa ? [iniciativa] : [],
		tareas: [tarea]
	});
};

const loadIniciativa = async (id: number, omitirPalanca: boolean | undefined): Promise<IUbicacionEstrategiaData> => {
	const [iniciativa, tareas] = await Promise.all([
		selectDatasource<IIniciativaDataSource>(new IniciativaDataSource(), new IniciativaMock()).getById(id),
		new TareaDataSource().getFilteredItems(id)
	]);
	const objetivo = iniciativa.Objetivo
		? await selectDatasource<IObjetivoDataSource>(new ObjetivoDataSource(), new ObjetivoMock()).getById(iniciativa.Objetivo.Id)
		: undefined;
	return buildData({
		palancas: palancasOf(objetivo, omitirPalanca),
		objetivos: objetivo ? [objetivo] : [],
		iniciativas: [iniciativa],
		tareas
	});
};

const loadObjetivo = async (id: number, omitirPalanca: boolean | undefined): Promise<IUbicacionEstrategiaData> => {
	const [objetivo, iniciativas] = await Promise.all([
		selectDatasource<IObjetivoDataSource>(new ObjetivoDataSource(), new ObjetivoMock()).getById(id),
		selectDatasource<IIniciativaDataSource>(new IniciativaDataSource(), new IniciativaMock()).getFilteredItems(id)
	]);
	const tareas = await new TareaDataSource().getItemsByIniciativaIds(idsOf(iniciativas));
	return buildData({
		palancas: palancasOf(objetivo, omitirPalanca),
		objetivos: [objetivo],
		iniciativas,
		tareas
	});
};

const loadPalanca = async (
	id: number,
	filtrarObjetivos: ((objetivos: Objetivo[]) => Objetivo[]) | undefined
): Promise<IUbicacionEstrategiaData> => {
	const [palanca, objetivosDePalanca] = await Promise.all([
		selectDatasource<IPalancaDataSource>(new PalancaDataSource(), new PalancaMock()).getById(id),
		selectDatasource<IObjetivoDataSource>(new ObjetivoDataSource(), new ObjetivoMock()).getFilteredItems(id)
	]);
	const objetivos = filtrarObjetivos ? filtrarObjetivos(objetivosDePalanca) : objetivosDePalanca;
	const iniciativas = await selectDatasource<IIniciativaDataSource>(new IniciativaDataSource(), new IniciativaMock()).getItemsByObjetivoIds(idsOf(objetivos));
	const tareas = await new TareaDataSource().getItemsByIniciativaIds(idsOf(iniciativas));
	return buildData({
		palancas: palanca.Id !== undefined ? [{ Id: palanca.Id, Title: palanca.Nombre ?? '' }] : [],
		objetivos,
		iniciativas,
		tareas
	});
};

const loadUbicacion = (
	tipo: TipoEntidad,
	id: number,
	options: IUbicacionEstrategiaOptions
): Promise<IUbicacionEstrategiaData> => {
	switch (tipo) {
		case 'tarea':
			return loadTarea(id, options.omitirPalanca);
		case 'iniciativa':
			return loadIniciativa(id, options.omitirPalanca);
		case 'objetivo':
			return loadObjetivo(id, options.omitirPalanca);
		default:
			return loadPalanca(id, options.filtrarObjetivos);
	}
};

function useUbicacionEstrategia(tipo: TipoEntidad, id: number, options: IUbicacionEstrategiaOptions): IUbicacionEstrategiaState {
	const key = `${tipo}-${id}`;
	const [state, setState] = useState<ICachedState>({ isLoading: false, error: false });
	const [attempt, setAttempt] = useState<number>(0);
	const optionsRef = useRef<IUbicacionEstrategiaOptions>(options);
	optionsRef.current = options;

	useEffect(() => {
		if (!options.enabled || state.key === key) {
			return undefined;
		}
		let cancelled = false;
		setState({ isLoading: true, error: false });
		loadUbicacion(tipo, id, optionsRef.current)
			.then((data) => {
				if (!cancelled) {
					setState({ key, data, isLoading: false, error: false });
				}
			})
			.catch((loadError) => {
				console.error(`No se pudo cargar la ubicación en la estrategia de la entidad de tipo "${tipo}".`, loadError);
				if (!cancelled) {
					setState({ isLoading: false, error: true });
				}
			});
		return () => {
			cancelled = true;
		};
	}, [options.enabled, key, attempt]);

	return {
		data: state.key === key ? state.data : undefined,
		isLoading: state.isLoading,
		error: state.error,
		reload: () => setAttempt(attempt + 1)
	};
}

export default useUbicacionEstrategia;
