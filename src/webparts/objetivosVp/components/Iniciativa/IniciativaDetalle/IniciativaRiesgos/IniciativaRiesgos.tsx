import * as React from 'react';

import { IRiesgoConDecision } from '../../../../../../core/api/Riesgo/IRiesgoService';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import RiesgosTable from '../../../Riesgo/RiesgosTable/RiesgosTable';

export interface IIniciativaRiesgosProps {
	items: IRiesgoConDecision[];
	onView: (tareaId: number) => void;
}

const IniciativaRiesgos: React.FC<IIniciativaRiesgosProps> = ({ items, onView }) => (
	<SectionBand title={Utils.replaceAll(strings.RiesgoIniciativaSection, '{0}', String(items.length))} collapsible defaultCollapsed>
		<RiesgosTable variant="iniciativa" items={items} emptyText={strings.RiesgoIniciativaEmpty} onView={onView} />
	</SectionBand>
);

export default IniciativaRiesgos;
