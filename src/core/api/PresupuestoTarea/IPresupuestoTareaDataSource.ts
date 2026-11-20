import { PresupuestoTarea } from '../../entities';

export default interface IPresupuestoTareaDataSource {

	listTitle: string;

	getItems(): Promise<PresupuestoTarea[]>;
	getFilteredItems(tareaId: number): Promise<PresupuestoTarea[]>;
	add(item: PresupuestoTarea): Promise<PresupuestoTarea>;
	edit(item: PresupuestoTarea): Promise<PresupuestoTarea>;
	delete(itemId: number): Promise<void>;
	getById(itemId: number): Promise<PresupuestoTarea>;

}
