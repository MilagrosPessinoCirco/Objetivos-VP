import { Palanca } from '../../entities';

export default interface IPalancaDataSource {

	listTitle: string;

	getItems(): Promise<Palanca[]>;
	getActiveItems(): Promise<Palanca[]>;
	add(item: Palanca): Promise<Palanca>;
	edit(item: Palanca): Promise<Palanca>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Palanca>;

}
