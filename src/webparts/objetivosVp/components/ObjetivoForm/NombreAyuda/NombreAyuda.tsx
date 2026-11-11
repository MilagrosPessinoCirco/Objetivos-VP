import * as React from 'react';

import { Callout } from '../../../../../core/ui/components';
import * as strings from 'ObjetivosVpWebPartStrings';

const NombreAyuda: React.FC = () => (
	<Callout
		title={strings.ObjetivoGuideTitle}
		description={strings.ObjetivoGuideText}
		showButtonLabel={strings.ObjetivoGuideAriaLabel}
		indicator="top"
	>
		<React.Fragment />
	</Callout>
);

export default NombreAyuda;
