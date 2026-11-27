import * as React from 'react';

import { Header } from '../../../../../core/ui/patterns';
import { Rol } from '../../../../../core/utils/Constants';
import * as strings from 'ObjetivosVpWebPartStrings';
import { usePermisos } from '../PermisosProvider';
import styles from './AppHeader.module.scss';

const ROL_LABELS: Record<Rol, string> = {
	[Rol.Administrador]: strings.RolAdministrador,
	[Rol.CargadorObjetivo]: strings.RolCargadorObjetivo,
	[Rol.Usuario]: strings.RolUsuario,
	[Rol.Visualizador]: strings.RolVisualizador
};

const AppHeader: React.FC = () => {
	const { permisos } = usePermisos();

	return (
		<div className={styles.appHeader}>
			<Header
				color="blue"
				showMenu={false}
				showPlatformLogo={false}
				separator={false}
				title=""
				logo={<span className={styles.title}>{strings.HomeTitle}</span>}
				description=""
				rightContent={<span className={styles.rol}>{ROL_LABELS[permisos.rol] || permisos.rol}</span>}
			/>
		</div>
	);
};

export default AppHeader;
