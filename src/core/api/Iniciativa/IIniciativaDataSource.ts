import { Iniciativa } from '../../entities';

export default interface IIniciativaDataSource {

	listTitle: string;

	getItems(): Promise<Iniciativa[]>;
	getFilteredItems(objetivoId: number): Promise<Iniciativa[]>;
	add(item: Iniciativa): Promise<Iniciativa>;
	edit(item: Iniciativa): Promise<Iniciativa>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Iniciativa>;

}
