import { Objetivo } from '../../entities';

export default interface IObjetivoDataSource {

	listTitle: string;

	getItems(): Promise<Objetivo[]>;
	getFilteredItems(palancaId: number): Promise<Objetivo[]>;
	add(item: Objetivo): Promise<Objetivo>;
	edit(item: Objetivo): Promise<Objetivo>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Objetivo>;

}
