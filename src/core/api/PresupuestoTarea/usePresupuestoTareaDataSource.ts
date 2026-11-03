import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { PresupuestoTarea } from '../../entities';
import PresupuestoTareaDataSource from './PresupuestoTareaDataSource';

function usePresupuestoTareaDataSource(): DatasourceHook<PresupuestoTarea> {
	return useDatasource<PresupuestoTarea>(new PresupuestoTareaDataSource());
}

export default usePresupuestoTareaDataSource;
