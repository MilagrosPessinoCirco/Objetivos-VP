import { useDatasource } from '../../api';
import { Objetivo } from '../../entities';
import ObjetivoDataSource from './ObjetivoDataSource';

function useItemObjetivoDataSource() {
	return useDatasource<Objetivo>(new ObjetivoDataSource());
}

export default useItemObjetivoDataSource;
