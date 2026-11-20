import * as React from 'react';

import { Button, Dropdown, Input, Multiline } from '../../../../../core/ui/components';
import { MessageBar, Panel } from '../../../../../core/ui/patterns';
import { spacing } from '../../../../../core/ui/foundations';
import { Palanca } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { buildPanelTitle } from '../../shared/panelTitle';
import { formatPalancaId } from '../formatPalancaId';
import styles from './PalancaForm.module.scss';

export interface IPalancaFormProps {
	palanca?: Palanca;
	onSave: (palanca: Palanca) => Promise<void>;
	onCancel: () => void;
}

const ACTIVE_KEY = 'si';
const INACTIVE_KEY = 'no';

const PalancaForm: React.FC<IPalancaFormProps> = ({ palanca, onSave, onCancel }) => {
	const [nombre, setNombre] = React.useState<string>(palanca?.Nombre ?? '');
	const [descripcion, setDescripcion] = React.useState<string>(palanca?.Descripcion ?? '');
	const [activa, setActiva] = React.useState<boolean>(palanca ? palanca.Activa === true : true);
	const [submitted, setSubmitted] = React.useState<boolean>(false);
	const [isSaving, setIsSaving] = React.useState<boolean>(false);
	const [saveFailed, setSaveFailed] = React.useState<boolean>(false);

	const nombreError = submitted && nombre.trim() === '' ? strings.RequiredField : undefined;
	const descripcionError = submitted && descripcion.trim() === '' ? strings.RequiredField : undefined;

	const title = buildPanelTitle(
		palanca ? Utils.replaceAll(strings.PalancaFormEditTitle, '{0}', formatPalancaId(palanca.Id)) : strings.PalancaFormNewTitle,
		strings.PalancaFormNote
	);

	const save = async (): Promise<void> => {
		setSubmitted(true);
		if (nombre.trim() === '' || descripcion.trim() === '') {
			return;
		}
		const toSave = new Palanca();
		toSave.Id = palanca?.Id;
		toSave.Nombre = nombre.trim();
		toSave.Descripcion = descripcion.trim();
		toSave.Activa = activa;
		setIsSaving(true);
		setSaveFailed(false);
		try {
			await onSave(toSave);
		}
		catch {
			setSaveFailed(true);
			setIsSaving(false);
		}
	};

	const onActivaChange = (value: string | string[]): void => {
		const key = Array.isArray(value) ? value[0] : value;
		setActiva(key === ACTIVE_KEY);
	};

	return (
		<Panel
			open
			className={styles.panel}
			title={title}
			onClose={onCancel}
			primaryAction={
				<Button variant="secondary" onClick={onCancel}>
					{strings.Cancel}
				</Button>
			}
			secondaryAction={
				<Button variant="primary" disabled={isSaving} onClick={save}>
					{strings.Save}
				</Button>
			}
		>
			<div className={styles.fields} style={{ gap: spacing.lg }}>
				{saveFailed && <MessageBar type="error" message={strings.PalancaSaveError} />}
				<Input
					label={strings.PalancaFormName}
					required
					value={nombre}
					onChange={(event) => setNombre(event.target.value)}
					errorMessage={nombreError}
				/>
				<Multiline
					className={styles.description}
					label={strings.PalancaFormDescription}
					required
					value={descripcion}
					onChange={(event) => setDescripcion(event.target.value)}
					errorMessage={descripcionError}
				/>
				<Dropdown
					label={strings.PalancaFormActive}
					required
					options={[
						{ key: ACTIVE_KEY, text: strings.Yes },
						{ key: INACTIVE_KEY, text: strings.No }
					]}
					value={activa ? ACTIVE_KEY : INACTIVE_KEY}
					onChange={onActivaChange}
				/>
			</div>
		</Panel>
	);
};

export default PalancaForm;
