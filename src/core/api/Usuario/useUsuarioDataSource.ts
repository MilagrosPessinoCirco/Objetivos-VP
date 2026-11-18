import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Usuario } from '../../entities';
import UsuarioDataSource from './UsuarioDataSource';
import UsuarioMock from './UsuarioMock';

function useUsuarioDataSource(): DatasourceHook<Usuario> {
	return useDatasource<Usuario>(new UsuarioDataSource(), new UsuarioMock());
}

export default useUsuarioDataSource;
