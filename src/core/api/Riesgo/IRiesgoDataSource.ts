import { Riesgo } from '../../entities';

export default interface IRiesgoDataSource {

	listTitle: string;

	getItems(): Promise<Riesgo[]>;
	getFilteredItems(tareaId: number): Promise<Riesgo[]>;
	add(item: Riesgo): Promise<Riesgo>;
	edit(item: Riesgo): Promise<Riesgo>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Riesgo>;

}
