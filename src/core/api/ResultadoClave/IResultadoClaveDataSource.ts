import { ResultadoClave } from '../../entities';

export default interface IResultadoClaveDataSource {

	listTitle: string;

	getItems(): Promise<ResultadoClave[]>;
	add(item: ResultadoClave): Promise<ResultadoClave>;
	edit(item: ResultadoClave): Promise<ResultadoClave>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<ResultadoClave>;

}
