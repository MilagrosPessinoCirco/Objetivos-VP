import { Gerencia } from '../../entities';

export default interface IGerenciaDataSource {

	listTitle: string;

	getItems(): Promise<Gerencia[]>;
	add(item: Gerencia): Promise<Gerencia>;
	edit(item: Gerencia): Promise<Gerencia>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Gerencia>;

}
