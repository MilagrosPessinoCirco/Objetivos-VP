import { Area } from '../../entities';

export default interface IAreaDataSource {

	listTitle: string;

	getItems(): Promise<Area[]>;
	add(item: Area): Promise<Area>;
	edit(item: Area): Promise<Area>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Area>;

}
