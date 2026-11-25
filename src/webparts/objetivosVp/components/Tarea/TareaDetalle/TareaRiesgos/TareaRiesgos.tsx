import * as React from 'react';

import { Button } from '../../../../../../core/ui/components';
import { MessageBar, Spinner } from '../../../../../../core/ui/patterns';
import { IRiesgoConDecision } from '../../../../../../core/api/Riesgo/IRiesgoService';
import { isRiesgoEditable } from '../../../../../../core/api/Riesgo/riesgoReglas';
import { Tarea } from '../../../../../../core/entities';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import RiesgosTable from '../../../Riesgo/RiesgosTable/RiesgosTable';

export interface ITareaRiesgosProps {
	items: IRiesgoConDecision[];
	isLoading: boolean;
	error: boolean;
	onRetry: () => void;
	tarea: Tarea;
	canEdit?: boolean;
	onEdit?: (item: IRiesgoConDecision) => void;
}

const TareaRiesgos: React.FC<ITareaRiesgosProps> = ({ items, isLoading, error, onRetry, tarea, canEdit, onEdit }) => {
	const renderContent = (): React.ReactNode => {
		if (error) {
			return (
				<MessageBar
					type="error"
					message={strings.RiesgosLoadError}
					actions={<Button variant="secondary" onClick={onRetry}>{strings.TareasRetry}</Button>}
				/>
			);
		}
		if (isLoading) {
			return <Spinner />;
		}
		return (
			<RiesgosTable
				variant="tarea"
				items={items}
				emptyText={strings.RiesgoSectionEmpty}
				canEdit={canEdit}
				isEditable={(item) => isRiesgoEditable(item.riesgo, tarea)}
				onEdit={onEdit}
			/>
		);
	};

	return (
		<SectionBand title={Utils.replaceAll(strings.RiesgoSection, '{0}', String(items.length))} collapsible>
			{renderContent()}
		</SectionBand>
	);
};

export default TareaRiesgos;
