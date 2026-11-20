import * as React from 'react';

import { Button, Dropdown, Multiline } from '../../../../../core/ui/components';
import { MessageBar, Panel } from '../../../../../core/ui/patterns';
import { spacing } from '../../../../../core/ui/foundations';
import useComentarioIniciativaDataSource from '../../../../../core/api/ComentarioIniciativa/useComentarioIniciativaDataSource';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import { ComentarioIniciativa, Iniciativa } from '../../../../../core/entities';
import { EstadoIniciativa } from '../../../../../core/utils/Constants';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { buildPanelTitle } from '../../shared/panelTitle';
import ConfirmacionModal from '../ConfirmacionModal/ConfirmacionModal';
import { formatIdNombre, formatIniciativaId } from '../iniciativaUtils';
import styles from '../IniciativaForm/IniciativaForm.module.scss';

export interface IIniciativaEstadoPanelProps {
	iniciativa: Iniciativa;
	ultimoComentario?: ComentarioIniciativa;
	onSaved: () => void;
	onCancel: () => void;
}

const toKey = (value: string | string[]): string => (Array.isArray(value) ? value[0] : value);

const IniciativaEstadoPanel: React.FC<IIniciativaEstadoPanelProps> = ({ iniciativa, ultimoComentario, onSaved, onCancel }) => {
	const [, , addComentario] = useComentarioIniciativaDataSource();
	const [, , , editIniciativa] = useIniciativaDataSource();
	const estadoActual = iniciativa.Estado ?? EstadoIniciativa.NoIniciada;
	const [estado, setEstado] = React.useState<EstadoIniciativa>(estadoActual);
	const [comentario, setComentario] = React.useState<string>(ultimoComentario?.Comentario ?? '');
	const [comentarioRegistrado, setComentarioRegistrado] = React.useState<string>((ultimoComentario?.Comentario ?? '').trim());
	const [isConfirmOpen, setIsConfirmOpen] = React.useState<boolean>(false);
	const [isSaving, setIsSaving] = React.useState<boolean>(false);
	const [saveFailed, setSaveFailed] = React.useState<boolean>(false);

	const estadoOptions = Object.values(EstadoIniciativa).map((value) => ({ key: value, text: value }));
	const nombre = iniciativa.Nombre ?? '';
	const title = buildPanelTitle(strings.IniciativaStatusPanelTitle, formatIdNombre(formatIniciativaId(iniciativa.Id), nombre));
	const message = Utils.replaceAll(Utils.replaceAll(Utils.replaceAll(strings.IniciativaConfirmStatus,
		'{0}', nombre),
		'{1}', estadoActual),
		'{2}', estado);

	const save = async (): Promise<void> => {
		const texto = comentario.trim();
		const registraComentario = texto !== '' && texto !== comentarioRegistrado;
		const cambiaEstado = estado !== iniciativa.Estado;
		if (!registraComentario && !cambiaEstado) {
			onCancel();
			return;
		}
		setIsSaving(true);
		setSaveFailed(false);
		try {
			if (registraComentario) {
				const nuevo = new ComentarioIniciativa();
				nuevo.Iniciativa = { Id: iniciativa.Id as number, Title: nombre };
				nuevo.Comentario = texto;
				await addComentario(nuevo);
				setComentarioRegistrado(texto);
			}
			if (cambiaEstado) {
				await editIniciativa(Object.assign(new Iniciativa(), iniciativa, { Estado: estado }));
			}
			onSaved();
		}
		catch {
			setSaveFailed(true);
			setIsSaving(false);
			setIsConfirmOpen(false);
		}
	};

	return (
		<Panel
			open
			className={styles.panel}
			title={title}
			onClose={onCancel}
			primaryAction={<Button variant="secondary" onClick={onCancel}>{strings.Cancel}</Button>}
			secondaryAction={
				<Button variant="primary" disabled={isSaving} onClick={() => setIsConfirmOpen(true)}>
					{strings.IniciativaChangeStatus}
				</Button>
			}
		>
			<div className={styles.panelContent} style={{ gap: spacing.lg, paddingRight: spacing.lg }}>
				<Dropdown
					label={strings.ObjetivoFormStatus}
					required
					options={estadoOptions}
					value={estado}
					onChange={(value) => setEstado(Object.values(EstadoIniciativa).filter((item) => item === toKey(value))[0] ?? estado)}
				/>
				<Multiline
					label={strings.IniciativaCommentSection}
					placeholder={strings.IniciativaCommentPlaceholder}
					value={comentario}
					className={styles.multiline}
					onChange={(event) => setComentario(event.target.value)}
				/>
				{saveFailed && <MessageBar type="error" message={strings.IniciativaStatusSaveError} />}
			</div>
			{isConfirmOpen && (
				<ConfirmacionModal
					title={strings.IniciativaChangeStatus}
					message={message}
					isSaving={isSaving}
					onAccept={save}
					onCancel={() => setIsConfirmOpen(false)}
				/>
			)}
		</Panel>
	);
};

export default IniciativaEstadoPanel;
