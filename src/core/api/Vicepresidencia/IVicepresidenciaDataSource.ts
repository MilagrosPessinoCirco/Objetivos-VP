import { Vicepresidencia } from '../../entities';

export default interface IVicepresidenciaDataSource {

	listTitle: string;

	getItems(): Promise<Vicepresidencia[]>;
	add(item: Vicepresidencia): Promise<Vicepresidencia>;
	edit(item: Vicepresidencia): Promise<Vicepresidencia>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Vicepresidencia>;

}
