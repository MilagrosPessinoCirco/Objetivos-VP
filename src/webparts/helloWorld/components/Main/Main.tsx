import * as React from "react";

import { Item, Tabs, ItemFormPanel } from "../../../../core";
import ItemFilterPanel from '../ItemFilterPanel/ItemFilterPanel';
import Actions from "../Actions/Actions";
import styles from "./Main.module.scss";
import { EMAIL_BODY, EMAIL_SUBJECT } from "../../../../core/utils/Constants";

export interface IMainProps {
	items: Array<Item>;
	onAdd: (item: Item) => Promise<Item>;
	onEdit: (item: Item) => void;
	onDelete: (itemId: number) => void;
	sendMail: (id: string, emails: string[], emailsCC: string[], subject: string, body: string) => Promise<void>;
}

export interface IMainState {
	isNewFormOpen: boolean;
	isEditFormOpen: boolean;
	isFilterFormOpen: boolean;
	selectedItem?: Item;
}

const Main: React.FunctionComponent<IMainProps> = ({ items, onAdd, onEdit, onDelete, sendMail }) => {

	const [mainState, setMainState] = React.useState<IMainState>({
		isNewFormOpen: false,
		isEditFormOpen: false,
		isFilterFormOpen: false
	});

	const [isDelete, setIsDelete] = React.useState(false);

	const handleAddClick = () => (
		setMainState({
			...mainState,
			isNewFormOpen: true
		})
	);

	const handleEditClick = () => (
		setMainState({
			...mainState,
			isEditFormOpen: true
		})
	);

	const handleDeleteClick = () => {
		if (mainState.selectedItem && typeof mainState.selectedItem.Id === "number") {
			onDelete(mainState.selectedItem.Id);
			setIsDelete(true);
		}
	};

	const handleFilterClick = () => (
		setMainState({
			...mainState,
			isFilterFormOpen: true
		})
	);

	const handleFilterClose = () => (
		setMainState({
			...mainState,
			isFilterFormOpen: false
		})
	);

	const handleFilterSave = () => {
		//Esta es una plantilla no guarda el filtro, pero se puede implementar en el proyecto que se requiera.
		handleFilterClose();
	};

	const handleNewItemClose = () => (
		setMainState({
			...mainState,
			isNewFormOpen: false
		})
	);

	const handleNewItemSave = async (item: Item) => {
		const createdItem = await onAdd(item);
		await sendMail(
			createdItem?.Id ? createdItem.Id.toString() : '',
			createdItem.Creador?.Email ? [createdItem.Creador.Email] : [],
			[],
			EMAIL_SUBJECT,
			EMAIL_BODY.replace('{Id}', createdItem?.Id ? createdItem.Id.toString() : '').replace('{Titulo}', createdItem?.Titulo ? createdItem.Titulo : '')
		);

		handleNewItemClose();
		
		setMainState(state => ({
		  ...state,
		  selectedItem: undefined
		}));
	};

	const handleEditItemClose = () => (
		setMainState({
			...mainState,
			isEditFormOpen: false
		})
	);

	const handleEditItemSave = (item: Item) => {
		onEdit(item);
		handleEditItemClose();
	};

	const handleItemSelect = (selectedItem?: Item) => {
		setIsDelete(false);
		setMainState({
			...mainState,
			selectedItem:
				mainState.selectedItem && selectedItem && mainState.selectedItem.Id === selectedItem.Id
					? undefined
					: selectedItem
		});
	};

	return (
		<React.Fragment>
			<div className={styles.Main}>
				<div className={styles.Main_Row}>
					<div className={styles.Main_Row_Tabs}>
						<Tabs items={items} headerProperty="Titulo" onItemSelected={handleItemSelect} />
					</div>
					<div className={styles.Main_Row_Filters}>
						<Actions
							onAddClick={handleAddClick}
							onEditClick={handleEditClick}
							onDeleteClick={handleDeleteClick}
							onFilterClick={handleFilterClick}
							isItemSelected={mainState.selectedItem && !isDelete}
						/>
					</div>
				</div>
			</div>
			<ItemFormPanel
				formName="new-item"
				isOpen={mainState.isNewFormOpen}
				title="NUEVO ITEM"
				onSave={handleNewItemSave}
				onCancel={handleNewItemClose}
			/>
			<ItemFormPanel
				formName="edit-item"
				isOpen={mainState.isEditFormOpen}
				title="EDITAR ITEM"
				onSave={handleEditItemSave}
				onCancel={handleEditItemClose}
				item={mainState.selectedItem}
			/>
			<ItemFilterPanel isOpen={mainState.isFilterFormOpen} onSave={handleFilterSave} onCancel={handleFilterClose} />
		</React.Fragment>
	);
};

export default Main;
