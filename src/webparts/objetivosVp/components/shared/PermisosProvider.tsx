import * as React from 'react';

import { Spinner } from '../../../../core/ui/patterns';
import useCurrentRol from '../../../../core/api/Usuario/useCurrentRol';
import useCurrentUser from '../../../../core/api/Usuario/useCurrentUser';
import { getPermisos, IPermisos, PermisoDenegadoError } from '../../../../core/utils/Permisos';
import * as strings from 'ObjetivosVpWebPartStrings';
import AccesoDenegado from '../Permisos/AccesoDenegado/AccesoDenegado';

export interface IPermisosContext {
	permisos: IPermisos;
	verificar: () => Promise<IPermisos>;
}

const PermisosContext = React.createContext<IPermisosContext | undefined>(undefined);

export const PermisosProvider: React.FC = ({ children }) => {
	const { user, error: userError } = useCurrentUser();
	const { rol, isLoading, error: rolError, reload } = useCurrentRol();

	if (userError || rolError) {
		return <AccesoDenegado message={strings.PermisosLoadError} />;
	}
	if (!user || isLoading) {
		return <Spinner />;
	}
	if (!rol) {
		return <AccesoDenegado message={strings.AccesoDenegado} />;
	}

	const verificar = async (): Promise<IPermisos> => {
		const vigente = await reload();
		if (!vigente) {
			throw new PermisoDenegadoError();
		}
		return getPermisos(vigente, user);
	};

	return <PermisosContext.Provider value={{ permisos: getPermisos(rol, user), verificar }}>{children}</PermisosContext.Provider>;
};

export const usePermisos = (): IPermisosContext => {
	const context = React.useContext(PermisosContext);
	if (!context) {
		throw new Error('usePermisos se usó fuera de PermisosProvider.');
	}
	return context;
};
