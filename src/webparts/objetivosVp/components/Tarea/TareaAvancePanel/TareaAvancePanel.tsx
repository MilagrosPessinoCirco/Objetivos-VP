import * as React from 'react';

import { Button, Dropdown, Input, Multiline } from '../../../../../core/ui/components';
import { MessageBar, Panel, Picker } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import useAvanceTareaDataSource from '../../../../../core/api/AvanceTarea/useAvanceTareaDataSource';
import useTareaDataSource from '../../../../../core/api/Tarea/useTareaDataSource';
import { AvanceTarea, Tarea } from '../../../../../core/entities';
import { EstadoTarea } from '../../../../../core/utils/Constants';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { buildPanelTitle } from '../../shared/panelTitle';
import { getColorStep } from '../../shared/getColorStep';
import { fromDateInput, toDateInput } from '../../Objetivo/objetivoUtils';
import ConfirmacionModal from '../../Iniciativa/ConfirmacionModal/ConfirmacionModal';
import { formatIdNombre } from '../../Iniciativa/iniciativaUtils';
import {
	TAREA_MAX_LENGTH,
	formatTareaId,
	getAvanceIssue,
	getEstadosDisponibles,
	getFechaFinalizacionIssue,
	getLengthIssue,
	requiereConfirmacion
} from '../tareaUtils';
import styles from '../TareaForm/TareaForm.module.scss';

export interface ITareaAvancePanelProps {
	tarea: Tarea;
	onSaved: () => void;
	onCancel: () => void;
}

const AVANCE_FINALIZADA = 100;
const AVANCE_STEP = 1;

const ERROR_COLOR = getColorStep('Red', '600').value;

const ERROR_STYLE: React.CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	color: ERROR_COLOR
};

const toKey = (value: string | string[]): string => (Array.isArray(value) ? value[0] : value);

const TareaAvancePanel: React.FC<ITareaAvancePanelProps> = ({ tarea, onSaved, onCancel }) => {
	const [, , addEntrada] = useAvanceTareaDataSource();
	const [, , , editTarea] = useTareaDataSource();
	const estadoInicial = tarea.Estado === EstadoTarea.Finalizada ? EstadoTarea.EnCurso : tarea.Estado ?? EstadoTarea.NoIniciada;
	const avanceInicial = tarea.Estado === EstadoTarea.Finalizada ? AVANCE_FINALIZADA : tarea.Avance ?? 0;
	const comentarioPrevio = (tarea.ComentarioEjecutivo ?? '').trim();
	const entradaCreada = React.useRef<AvanceTarea | undefined>(undefined);
	const [estado, setEstado] = React.useState<EstadoTarea>(estadoInicial);
	const [avance, setAvance] = React.useState<string>(String(avanceInicial));
	const [fechaFinalizacion, setFechaFinalizacion] = React.useState<string>('');
	const [comentario, setComentario] = React.useState<string>(tarea.ComentarioEjecutivo ?? '');
	const [submitted, setSubmitted] = React.useState<boolean>(false);
	const [isConfirmOpen, setIsConfirmOpen] = React.useState<boolean>(false);
	const [isSaving, setIsSaving] = React.useState<boolean>(false);
	const [saveFailed, setSaveFailed] = React.useState<boolean>(false);
	const [isLocked, setIsLocked] = React.useState<boolean>(false);

	const finaliza = estado === EstadoTarea.Finalizada;
	const avanceValue = finaliza ? String(AVANCE_FINALIZADA) : avance;
	const estadoOptions = getEstadosDisponibles(tarea.Estado).map((value) => ({ key: value as string, text: value as string }));
	const codigo = formatTareaId(tarea.Id);

	const issues = {
		avance: finaliza ? undefined : getAvanceIssue(avance),
		fechaFinalizacion: finaliza
			? getFechaFinalizacionIssue(fechaFinalizacion, toDateInput(tarea.FechaInicio), toDateInput(new Date()))
			: undefined,
		comentario: getLengthIssue(comentario.trim(), TAREA_MAX_LENGTH.comentario, strings.TareaCommentTooLong)
	};
	const hasIssues = Object.values(issues).some((issue) => issue !== undefined);
	const shown = (issue: string | undefined): string | undefined => (submitted ? issue : undefined);
	const invalid = (issue: string | undefined, extra?: string): string | undefined =>
		[shown(issue) ? styles.invalid : undefined, extra].filter(Boolean).join(' ') || undefined;

	const confirmTitle = finaliza ? strings.TareaConfirmFinishTitle : strings.TareaConfirmCancelTitle;
	const confirmMessage = Utils.replaceAll(finaliza ? strings.TareaConfirmFinish : strings.TareaConfirmCancel, '{0}', codigo);

	const save = async (): Promise<void> => {
		setIsSaving(true);
		setSaveFailed(false);
		try {
			if (!entradaCreada.current) {
				const texto = comentario.trim();
				const nueva = new AvanceTarea();
				nueva.Tarea = { Id: tarea.Id as number, Title: tarea.Nombre ?? '' };
				nueva.Avance = finaliza ? AVANCE_FINALIZADA : Number(avance.trim());
				nueva.Estado = estado;
				if (texto !== '' && texto !== comentarioPrevio) {
					nueva.Comentario = texto;
				}
				entradaCreada.current = await addEntrada(nueva);
				setIsLocked(true);
			}
			const entrada = entradaCreada.current;
			const actualizacion = Object.assign(new Tarea(), {
				Id: tarea.Id,
				Estado: entrada.Estado,
				Avance: entrada.Avance,
				FechaFinalizacion: finaliza ? fromDateInput(fechaFinalizacion) ?? null : null,
				FechaUltimaActualizacion: entrada.Created
			});
			if (entrada.Comentario !== undefined) {
				Object.assign(actualizacion, {
					ComentarioEjecutivo: entrada.Comentario,
					ComentarioEjecutivoFecha: entrada.Created,
					ComentarioEjecutivoAutor: entrada.Author
				});
			}
			await editTarea(actualizacion);
			onSaved();
		}
		catch {
			setSaveFailed(true);
			setIsSaving(false);
			setIsConfirmOpen(false);
		}
	};

	const requestSave = (): void => {
		setSubmitted(true);
		if (hasIssues) {
			return;
		}
		if (!entradaCreada.current && requiereConfirmacion(tarea.Estado, estado)) {
			setIsConfirmOpen(true);
			return;
		}
		save();
	};

	return (
		<Panel
			open
			className={styles.panel}
			title={buildPanelTitle(strings.TareaRegisterProgress, formatIdNombre(codigo, tarea.Nombre))}
			onClose={onCancel}
			primaryAction={<Button variant="secondary" onClick={onCancel}>{strings.Cancel}</Button>}
			secondaryAction={
				<Button variant="primary" disabled={isSaving} onClick={requestSave}>
					{strings.Accept}
				</Button>
			}
		>
			<div className={styles.panelContent} style={{ gap: spacing.lg, paddingRight: spacing.lg, '--field-error': ERROR_COLOR } as React.CSSProperties}>
				<div className={styles.gridPair} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
					<Dropdown
						label={strings.ObjetivoFormStatus}
						required
						options={estadoOptions}
						value={estado}
						disabled={isLocked}
						onChange={(value) => setEstado(Object.values(EstadoTarea).filter((item) => item === toKey(value))[0] ?? estado)}
					/>
					<Input
						type="number"
						step={AVANCE_STEP}
						label={strings.TareaProgressField}
						required
						value={avanceValue}
						disabled={isLocked || finaliza}
						className={invalid(issues.avance)}
						errorMessage={shown(issues.avance)}
						onChange={(event) => setAvance(event.target.value)}
					/>
				</div>
				{finaliza && (
					<div className={invalid(issues.fechaFinalizacion, styles.field)} style={{ gap: spacing.xs }}>
						<Picker mode="date" label={strings.TareaFinishDate} required value={fechaFinalizacion} onChange={setFechaFinalizacion} />
						{shown(issues.fechaFinalizacion) && <span role="alert" style={ERROR_STYLE}>{issues.fechaFinalizacion}</span>}
					</div>
				)}
				<Multiline
					label={strings.IniciativaCommentSection}
					placeholder={strings.TareaCommentPlaceholder}
					value={comentario}
					disabled={isLocked}
					className={invalid(issues.comentario, styles.multiline)}
					errorMessage={shown(issues.comentario)}
					onChange={(event) => setComentario(event.target.value)}
				/>
				{saveFailed && <MessageBar type="error" message={strings.TareaProgressSaveError} />}
			</div>
			{isConfirmOpen && (
				<ConfirmacionModal
					title={confirmTitle}
					message={confirmMessage}
					isSaving={isSaving}
					onAccept={save}
					onCancel={() => setIsConfirmOpen(false)}
				/>
			)}
		</Panel>
	);
};

export default TareaAvancePanel;
