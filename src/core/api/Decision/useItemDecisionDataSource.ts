import { useDatasource } from '../../api';
import { Decision } from '../../entities';
import DecisionDataSource from './DecisionDataSource';

function useItemDecisionDataSource() {
	return useDatasource<Decision>(new DecisionDataSource());
}

export default useItemDecisionDataSource;
