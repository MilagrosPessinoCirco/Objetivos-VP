import { ComentarioIniciativa } from '../../entities';

export default interface IComentarioIniciativaDataSource {

	listTitle: string;

	getItems(): Promise<ComentarioIniciativa[]>;
	getFilteredItems(iniciativaId: number): Promise<ComentarioIniciativa[]>;
	add(item: ComentarioIniciativa): Promise<ComentarioIniciativa>;
	edit(item: ComentarioIniciativa): Promise<ComentarioIniciativa>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<ComentarioIniciativa>;

}
