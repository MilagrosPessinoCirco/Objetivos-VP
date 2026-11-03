import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Usuario } from '../../entities';
import UsuarioDataSource from './UsuarioDataSource';

function useUsuarioDataSource(): DatasourceHook<Usuario> {
	return useDatasource<Usuario>(new UsuarioDataSource());
}

export default useUsuarioDataSource;
