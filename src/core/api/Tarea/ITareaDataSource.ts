import { Tarea } from '../../entities';

export default interface ITareaDataSource {

	listTitle: string;

	getItems(): Promise<Tarea[]>;
	getFilteredItems(iniciativaId: number): Promise<Tarea[]>;
	add(item: Tarea): Promise<Tarea>;
	edit(item: Tarea): Promise<Tarea>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Tarea>;

}
