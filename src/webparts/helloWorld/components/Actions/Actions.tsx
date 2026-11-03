import * as React from 'react';
import { PrimaryButton } from '@fluentui/react';

import { TooltipButton, ShowPanel } from '../../../../core';
import styles from "./Actions.module.scss";

export interface IActionsProps {
	onAddClick: () => void;
	onEditClick: () => void;
	onDeleteClick: () => void;
	onFilterClick: () => void;
	isItemSelected?: boolean;
}

const Actions: React.FunctionComponent<IActionsProps> = ({
	onAddClick, onEditClick,
	onDeleteClick, onFilterClick,
	isItemSelected
}) => (
	<div className={styles.Filters}>
		<div className={styles.Filters_Row}>
			<div className={styles.Filters_Row_Buttons}>
				<TooltipButton iconName="Add" title="NUEVO ITEM" onClick={onAddClick} className={styles.Filters_Row_Buttons_ButtonAdd} />
				<ShowPanel show={isItemSelected}>
					<TooltipButton iconName="Edit" title="EDITAR" onClick={onEditClick} className={isItemSelected ? styles.Filters_Row_Buttons_ButtonEdit : ""} />
					<TooltipButton iconName="Clear" title="ELIMINAR" onClick={onDeleteClick} className={isItemSelected ? styles.Filters_Row_Buttons_ButtonDelete : ""} />
				</ShowPanel>
				<PrimaryButton
					text="Filtrar tareas"
					iconProps={{ iconName: 'Equalizer' }}
					onClick={onFilterClick}
					className={styles.Filters_Row_Row_Filter_Button}
				/>
			</div>
		</div>
	</div>
);

export default Actions;
