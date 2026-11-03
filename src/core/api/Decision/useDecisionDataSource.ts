import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Decision } from '../../entities';
import DecisionDataSource from './DecisionDataSource';

function useDecisionDataSource(): DatasourceHook<Decision> {
	return useDatasource<Decision>(new DecisionDataSource());
}

export default useDecisionDataSource;
