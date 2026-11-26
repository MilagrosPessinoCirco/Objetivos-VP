import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useUbicacionEstrategia from '../../../../../core/api/UbicacionEstrategia/useUbicacionEstrategia';
import type { TipoEntidad } from '../../../../../core/api/UbicacionEstrategia/useUbicacionEstrategia';
import { Objetivo } from '../../../../../core/entities';
import LocationButton from '../LocationButton/LocationButton';
import UbicacionEstrategiaPanel from './UbicacionEstrategiaPanel/UbicacionEstrategiaPanel';
import { buildNiveles } from './ubicacionUtils';

export interface IUbicacionEstrategiaProps {
	tipo: TipoEntidad;
	id: number;
	otraVp?: string;
	filtrarObjetivos?: (objetivos: Objetivo[]) => Objetivo[];
}

const UbicacionEstrategia: React.FC<IUbicacionEstrategiaProps> = ({ tipo, id, otraVp, filtrarObjetivos }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [open, setOpen] = React.useState<boolean>(false);
	const triggerRef = React.useRef<HTMLButtonElement>(null);
	const returnFocusRef = React.useRef<boolean>(false);
	const { data, error, reload } = useUbicacionEstrategia(tipo, id, { enabled: open, filtrarObjetivos, omitirPalanca: otraVp !== undefined });

	React.useEffect(() => {
		if (!open && returnFocusRef.current) {
			returnFocusRef.current = false;
			triggerRef.current?.focus();
		}
	}, [open]);

	const handleClose = (): void => {
		returnFocusRef.current = true;
		setOpen(false);
	};

	const handleNavigate = (path: string): void => {
		setOpen(false);
		navigate(path, { state: { from: location.pathname + location.search } });
	};

	return (
		<>
			<LocationButton buttonRef={triggerRef} onClick={() => setOpen(true)} />
			{open && (
				<UbicacionEstrategiaPanel
					tipo={tipo}
					id={id}
					niveles={data ? buildNiveles(data, tipo, id, otraVp) : undefined}
					error={error}
					onRetry={reload}
					onNavigate={handleNavigate}
					onClose={handleClose}
				/>
			)}
		</>
	);
};

export default UbicacionEstrategia;
