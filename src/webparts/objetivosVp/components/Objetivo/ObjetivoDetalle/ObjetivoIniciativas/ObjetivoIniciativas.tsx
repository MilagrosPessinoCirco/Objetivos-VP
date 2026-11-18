import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button, Tooltip } from '../../../../../../core/ui/components';
import { MessageBar, Spinner } from '../../../../../../core/ui/patterns';
import { FigmaIcon } from '../../../../../../core/ui/foundations';
import useIniciativaDataSource from '../../../../../../core/api/Iniciativa/useIniciativaDataSource';
import { Iniciativa, Objetivo } from '../../../../../../core/entities';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getIniciativaPath } from '../../../ObjetivosVp/routes';
import { ICON_BUTTON_STYLE } from '../../../shared/iconButtonStyle';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import IniciativaFormPanel from '../../../Iniciativa/IniciativaForm/IniciativaFormPanel';
import IniciativasTable from '../../../Iniciativa/IniciativasTable/IniciativasTable';

export interface IObjetivoIniciativasProps {
	objetivo: Objetivo;
	canCreate: boolean;
	onCreated: (iniciativa: Iniciativa) => void;
}

const ObjetivoIniciativas: React.FC<IObjetivoIniciativasProps> = ({ objetivo, canCreate, onCreated }) => {
	const [state, getItems] = useIniciativaDataSource();
	const navigate = useNavigate();
	const location = useLocation();
	const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
	const [ready, setReady] = React.useState<boolean>(false);

	React.useEffect(() => {
		getItems().then(() => setReady(true));
	}, []);

	const iniciativas = state.items.filter((iniciativa) => iniciativa.Objetivo?.Id === objetivo.Id);

	const onSaved = (iniciativa: Iniciativa): void => {
		setIsFormOpen(false);
		getItems();
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
			<SectionBand title={Utils.replaceAll(strings.ObjetivoInitiativesSection, '{0}', String(iniciativas.length))} action={addAction} collapsible>
				{state.error && <MessageBar type="error" message={strings.IniciativasLoadError} />}
				{!state.error && !ready && <Spinner />}
				{!state.error && ready && (
					<IniciativasTable
						iniciativas={iniciativas}
						variant="objetivo"
						objetivo={objetivo}
						emptyText={strings.ObjetivoInitiativesEmpty}
						onView={(id) => navigate(getIniciativaPath(id), { state: { from: location.pathname } })}
					/>
				)}
			</SectionBand>
			{isFormOpen && <IniciativaFormPanel initialObjetivoId={objetivo.Id} onSaved={onSaved} onCancel={() => setIsFormOpen(false)} />}
		</>
	);
};

export default ObjetivoIniciativas;
