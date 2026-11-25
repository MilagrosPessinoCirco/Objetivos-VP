import * as React from 'react';

import { FigmaIcon } from '../../../../../core/ui/foundations';
import { EmptyState } from '../../../../../core/ui/patterns';
import styles from './AccesoDenegado.module.scss';

export interface IAccesoDenegadoProps {
	message: string;
}

const AccesoDenegado: React.FC<IAccesoDenegadoProps> = ({ message }) => (
	<div className={styles.container}>
		<EmptyState className={styles.estado} title={message} description="" action={<></>} icon={<FigmaIcon name="lockPrimary" size="xl" />} />
	</div>
);

export default AccesoDenegado;
