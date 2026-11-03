import * as React from 'react';
import { DatePicker, Dropdown } from '@fluentui/react';

import { FormPanel } from '../../../../core';
import styles from './ItemFilterPanel.module.scss';
import * as strings from 'HelloWorldWebPartStrings';

export interface IItemFilterPanelProps {
	isOpen: boolean;
	onSave: () => void;
	onCancel: () => void;
}

const ItemFilterPanel: React.FunctionComponent<IItemFilterPanelProps> = ({ isOpen, onSave, onCancel }) => (
	<FormPanel
		title="FILTRAR POR"
		isOpen={isOpen}
		onCancel={onCancel}
		onSave={onSave}
		cancelLabel="Salir"
		saveLabel="Aplicar filtros"
		formName="filtros"
		className={styles.itemFilterPanel}
	>
		<Dropdown
			placeholder="Seleccione una opción"
			label="ID"
			options={[]}
			className={styles.input}
		/>
		<Dropdown
			placeholder="Seleccione una opción"
			label="Título"
			options={[]}
			className={styles.input}
		/>
		<DatePicker
			label="Fecha"
			strings={strings.DatePickerStrings}
			placeholder="Seleccioná una fecha..."
			className={styles.input}
			ariaLabel="Seleccioná una fecha"
		/>
	</FormPanel>
);

export default ItemFilterPanel;
