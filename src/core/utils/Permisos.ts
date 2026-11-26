import { Rol } from './Constants';
import { IPersonValue } from './Mappers';

export interface IPermisos {
	rol: Rol;
	canManagePalancas: boolean;
	canCreateObjetivo: boolean;
	canEditObjetivo: boolean;
	canCreateIniciativa: boolean;
	canLoadResultadosClave: boolean;
	canCreateTarea: boolean;
	canViewPesos: boolean;
	canManageUsuarios: boolean;
	canEditIniciativa: (accountable?: IPersonValue) => boolean;
	canTrackResultadoClave: (accountable?: IPersonValue) => boolean;
	canUpdateTarea: (responsable?: IPersonValue, accountable?: IPersonValue) => boolean;
}

const PERMISO_DENEGADO_NAME = 'PermisoDenegadoError';

const ROL_PRECEDENCIA: Record<Rol, number> = {
	[Rol.Administrador]: 4,
	[Rol.CargadorObjetivo]: 3,
	[Rol.Usuario]: 2,
	[Rol.Visualizador]: 1
};

export class PermisoDenegadoError extends Error {
	constructor(message: string = 'No tenés permiso para realizar esta acción.') {
		super(message);
		this.name = PERMISO_DENEGADO_NAME;
		Object.setPrototypeOf(this, PermisoDenegadoError.prototype);
	}
}

export const isPermisoDenegadoError = (error: unknown): boolean =>
	typeof error === 'object' && error !== null && (error as { name?: string }).name === PERMISO_DENEGADO_NAME;

export const assertPermiso = (allowed: boolean): void => {
	if (!allowed) {
		throw new PermisoDenegadoError();
	}
};

export const getRolFromGroups = (groupTitles: string[]): Rol | undefined =>
	Object.values(Rol)
		.filter((rol) => groupTitles.indexOf(rol) >= 0)
		.sort((a, b) => ROL_PRECEDENCIA[b] - ROL_PRECEDENCIA[a])[0];

const isSamePerson = (person: IPersonValue | undefined, currentUser: IPersonValue): boolean =>
	person !== undefined && person.Id === currentUser.Id;

export const getPermisos = (rol: Rol, currentUser: IPersonValue): IPermisos => {
	const isAdmin = rol === Rol.Administrador;
	const isPower = isAdmin || rol === Rol.CargadorObjetivo;
	const canWrite = isPower || rol === Rol.Usuario;
	return {
		rol,
		canManagePalancas: isAdmin,
		canCreateObjetivo: isPower,
		canEditObjetivo: isAdmin,
		canCreateIniciativa: canWrite,
		canLoadResultadosClave: canWrite,
		canCreateTarea: canWrite,
		canViewPesos: isPower,
		canManageUsuarios: isAdmin,
		canEditIniciativa: (accountable) => isPower || (rol === Rol.Usuario && isSamePerson(accountable, currentUser)),
		canTrackResultadoClave: (accountable) => isPower || (rol === Rol.Usuario && isSamePerson(accountable, currentUser)),
		canUpdateTarea: (responsable, accountable) =>
			isPower || (rol === Rol.Usuario && (isSamePerson(responsable, currentUser) || isSamePerson(accountable, currentUser)))
	};
};
