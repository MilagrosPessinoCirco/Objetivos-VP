import { Departamento } from '../../entities';

export default interface IDepartamentoDataSource {

	listTitle: string;

	getItems(): Promise<Departamento[]>;
	add(item: Departamento): Promise<Departamento>;
	edit(item: Departamento): Promise<Departamento>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<Departamento>;

}
