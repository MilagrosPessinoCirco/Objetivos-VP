import { ComentarioResultadoClave } from '../../entities';

export default interface IComentarioResultadoClaveDataSource {

	listTitle: string;

	getItems(): Promise<ComentarioResultadoClave[]>;
	getFilteredItems(resultadoClaveId: number): Promise<ComentarioResultadoClave[]>;
	add(item: ComentarioResultadoClave): Promise<ComentarioResultadoClave>;
	edit(item: ComentarioResultadoClave): Promise<ComentarioResultadoClave>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<ComentarioResultadoClave>;

}
