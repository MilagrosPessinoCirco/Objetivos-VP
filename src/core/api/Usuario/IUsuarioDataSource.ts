import { Usuario } from '../../entities';

export default interface IUsuarioDataSource {

	listTitle: string;

	getItems(): Promise<Usuario[]>;
	add(item: Usuario): Promise<Usuario>;
	edit(item: Usuario): Promise<Usuario>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Usuario>;

}
