import * as React from 'react';

import { FigmaIcon } from '../../../../../core/ui/foundations';
import { EmptyState } from '../../../../../core/ui/patterns';

export interface IAccesoDenegadoProps {
	message: string;
}

const AccesoDenegado: React.FC<IAccesoDenegadoProps> = ({ message }) => (
	<EmptyState title={message} description="" action={<></>} icon={<FigmaIcon name="lock" />} />
);

export default AccesoDenegado;
