import * as React from 'react';

import { Tarea } from '../../../../../../core/entities';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import IniciativasPaginador from '../../IniciativasBandeja/IniciativasPaginador/IniciativasPaginador';
import TareasTable from '../../../Tarea/TareasTable/TareasTable';
import { FIRST_PAGE, TAREAS_PAGE_SIZE, paginarTareas } from '../../../Tarea/tareaPaginado';
import { TAREAS_MAX_NO_CANCELADAS, countNoCanceladas } from '../../../Tarea/tareaUtils';

export interface IIniciativaTareasProps {
	tareas: Tarea[];
	onView: (id: number) => void;
}

const IniciativaTareas: React.FC<IIniciativaTareasProps> = ({ tareas, onView }) => {
	const [page, setPage] = React.useState<number>(FIRST_PAGE);
	const pagina = paginarTareas(tareas, page);
	const title = Utils.replaceAll(Utils.replaceAll(strings.TareaSection,
		'{0}', String(countNoCanceladas(tareas))),
		'{1}', String(TAREAS_MAX_NO_CANCELADAS));

	return (
		<SectionBand title={title} collapsible>
			<TareasTable tareas={pagina.pageItems} variant="iniciativa" emptyText={strings.TareaSectionEmpty} onView={onView} />
			<IniciativasPaginador page={pagina.page} pageSize={TAREAS_PAGE_SIZE} total={pagina.total} inline onPageChange={setPage} />
		</SectionBand>
	);
};

export default IniciativaTareas;
