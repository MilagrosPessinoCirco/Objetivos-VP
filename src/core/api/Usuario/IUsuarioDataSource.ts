import { Usuario } from '../../entities';
import { IPersonValue } from '../../utils/Mappers';

export default interface IUsuarioDataSource {

	listTitle: string;

	getItems(): Promise<Usuario[]>;
	getCurrentUser(): Promise<IPersonValue>;
	add(item: Usuario): Promise<Usuario>;
	edit(item: Usuario): Promise<Usuario>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Usuario>;

}
