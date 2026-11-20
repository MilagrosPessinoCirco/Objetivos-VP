import { Decision } from '../../entities';

export default interface IDecisionDataSource {

	listTitle: string;

	getItems(): Promise<Decision[]>;
	getFilteredItems(riesgoId: number): Promise<Decision[]>;
	add(item: Decision): Promise<Decision>;
	edit(item: Decision): Promise<Decision>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Decision>;

}
