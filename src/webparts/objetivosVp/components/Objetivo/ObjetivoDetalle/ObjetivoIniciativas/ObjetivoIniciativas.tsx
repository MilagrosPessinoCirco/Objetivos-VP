import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button, Tooltip } from '../../../../../../core/ui/components';
import { MessageBar, Spinner } from '../../../../../../core/ui/patterns';
import { FigmaIcon } from '../../../../../../core/ui/foundations';
import { Iniciativa, Objetivo, ResultadoClave } from '../../../../../../core/entities';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getIniciativaPath } from '../../../ObjetivosVp/routes';
import { ICON_BUTTON_STYLE } from '../../../shared/iconButtonStyle';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import IniciativaFormPanel from '../../../Iniciativa/IniciativaForm/IniciativaFormPanel';
import IniciativasTable from '../../../Iniciativa/IniciativasTable/IniciativasTable';

export interface IObjetivoIniciativasProps {
	objetivo: Objetivo;
	iniciativas: Iniciativa[];
	resultados: ResultadoClave[];
	ready: boolean;
	error: boolean;
	canCreate: boolean;
	canLoadResultadosClave: boolean;
	onCreated: (iniciativa: Iniciativa) => void;
	onReload: () => void;
}

const ObjetivoIniciativas: React.FC<IObjetivoIniciativasProps> = ({
	objetivo,
	iniciativas,
	resultados,
	ready,
	error,
	canCreate,
	canLoadResultadosClave,
	onCreated,
	onReload
}) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);

	const delObjetivo = iniciativas.filter((iniciativa) => iniciativa.Objetivo?.Id === objetivo.Id);

	const onSaved = (iniciativa: Iniciativa): void => {
		setIsFormOpen(false);
		onReload();
		onCreated(iniciativa);
	};

	const addAction = canCreate && (
		<Tooltip content={strings.IniciativaAddTooltip}>
			<Button
				iconOnly
				variant="secondary"
				size="small"
				style={ICON_BUTTON_STYLE}
				iconLeft={<FigmaIcon name="addPrimary" />}
				aria-label={strings.IniciativaAddTooltip}
				onClick={() => setIsFormOpen(true)}
			/>
		</Tooltip>
	);

	return (
		<>
			<SectionBand title={Utils.replaceAll(strings.ObjetivoInitiativesSection, '{0}', String(delObjetivo.length))} action={addAction} collapsible>
				{error && <MessageBar type="error" message={strings.IniciativasLoadError} />}
				{!error && !ready && <Spinner />}
				{!error && ready && (
					<IniciativasTable
						iniciativas={delObjetivo}
						resultados={resultados}
						variant="objetivo"
						objetivo={objetivo}
						emptyText={strings.ObjetivoInitiativesEmpty}
						onView={(id) => navigate(getIniciativaPath(id), { state: { from: location.pathname } })}
					/>
				)}
			</SectionBand>
			{isFormOpen && (
				<IniciativaFormPanel
					initialObjetivoId={objetivo.Id}
					canLoadResultadosClave={canLoadResultadosClave}
					onSaved={onSaved}
					onCancel={() => setIsFormOpen(false)}
				/>
			)}
		</>
	);
};

export default ObjetivoIniciativas;
