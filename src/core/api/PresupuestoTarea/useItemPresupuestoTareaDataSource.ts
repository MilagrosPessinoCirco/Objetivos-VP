import { useDatasource } from '../../api';
import { PresupuestoTarea } from '../../entities';
import PresupuestoTareaDataSource from './PresupuestoTareaDataSource';

function useItemPresupuestoTareaDataSource() {
	return useDatasource<PresupuestoTarea>(new PresupuestoTareaDataSource());
}

export default useItemPresupuestoTareaDataSource;
