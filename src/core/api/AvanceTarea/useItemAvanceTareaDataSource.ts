import { useDatasource } from '../../api';
import { AvanceTarea } from '../../entities';
import AvanceTareaDataSource from './AvanceTareaDataSource';

function useItemAvanceTareaDataSource() {
	return useDatasource<AvanceTarea>(new AvanceTareaDataSource());
}

export default useItemAvanceTareaDataSource;
