import { useDatasource } from '../../api';
import { Usuario } from '../../entities';
import UsuarioDataSource from './UsuarioDataSource';

function useItemUsuarioDataSource() {
	return useDatasource<Usuario>(new UsuarioDataSource());
}

export default useItemUsuarioDataSource;
