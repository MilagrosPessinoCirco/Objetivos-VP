import { AvanceTarea } from '../../entities';

export default interface IAvanceTareaDataSource {

	listTitle: string;

	getItems(): Promise<AvanceTarea[]>;
	getFilteredItems(tareaId: number): Promise<AvanceTarea[]>;
	add(item: AvanceTarea): Promise<AvanceTarea>;
	edit(item: AvanceTarea): Promise<AvanceTarea>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<AvanceTarea>;

}
