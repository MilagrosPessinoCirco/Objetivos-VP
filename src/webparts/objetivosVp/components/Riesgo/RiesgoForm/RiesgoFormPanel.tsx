import * as React from 'react';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Panel } from '../../../../../core/ui/patterns';
import { spacing } from '../../../../../core/ui/foundations';
import { IAltaPendiente, IRiesgoConDecision, RiesgoGuardadoError, RiesgoValidationError } from '../../../../../core/api/Riesgo/IRiesgoService';
import { getRiesgoService } from '../../../../../core/api/Riesgo/RiesgoService';
import { getDecisionIssue, getDescripcionIssue, getEstadosDisponibles, isRequiereDecisionFijo } from '../../../../../core/api/Riesgo/riesgoReglas';
import { Tarea } from '../../../../../core/entities';
import { EstadoRiesgo } from '../../../../../core/utils/Constants';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { buildPanelTitle } from '../../shared/panelTitle';
import { fromDateInput, toDateInput } from '../../Objetivo/objetivoUtils';
import { formatIdNombre } from '../../Iniciativa/iniciativaUtils';
import { formatTareaId } from '../../Tarea/tareaUtils';
import { formatRiesgoId, getRiesgoRuleMessage } from '../riesgoUtils';
import RiesgoForm from './RiesgoForm';
import type { IRiesgoFormIssues, IRiesgoFormValues } from './RiesgoForm';
import styles from './RiesgoForm.module.scss';

export interface IRiesgoFormPanelProps {
	tarea: Tarea;
	item?: IRiesgoConDecision;
	onSaved: (escalado: boolean, descripcion: string) => void;
	onCancel: () => void;
}

type SaveFailure = 'simple' | 'incompleto';

const EMPTY_VALUES: IRiesgoFormValues = { descripcion: '', estado: EstadoRiesgo.Activo, requiereDecision: false, decisionNecesaria: '', fechaLimite: '' };

const getInitialValues = (item: IRiesgoConDecision | undefined): IRiesgoFormValues =>
	item
		? {
			descripcion: item.riesgo.Descripcion ?? '',
			estado: item.riesgo.Estado ?? EstadoRiesgo.Activo,
			requiereDecision: item.riesgo.RequiereDecision === true,
			decisionNecesaria: item.decision?.DecisionNecesaria ?? '',
			fechaLimite: toDateInput(item.decision?.FechaLimite)
		}
		: EMPTY_VALUES;

const RiesgoFormPanel: React.FC<IRiesgoFormPanelProps> = ({ tarea, item, onSaved, onCancel }) => {
	const [values, setValues] = React.useState<IRiesgoFormValues>(() => getInitialValues(item));
	const [submitted, setSubmitted] = React.useState<boolean>(false);
	const [isSaving, setIsSaving] = React.useState<boolean>(false);
	const [isLocked, setIsLocked] = React.useState<boolean>(false);
	const [saveFailure, setSaveFailure] = React.useState<SaveFailure | undefined>(undefined);
	const [ruleError, setRuleError] = React.useState<boolean>(false);
	const [serviceIssues, setServiceIssues] = React.useState<IRiesgoFormIssues>({});
	const pendiente = React.useRef<IAltaPendiente | undefined>(undefined);

	const fecha = fromDateInput(values.fechaLimite);
	const descripcionIssue = getDescripcionIssue(values.descripcion);
	const decisionIssues = getDecisionIssue(values.requiereDecision, values.decisionNecesaria, fecha, item?.decision?.FechaLimite, new Date());
	const hasIssues = descripcionIssue !== undefined || decisionIssues.decision !== undefined || decisionIssues.fecha !== undefined;

	const issues: IRiesgoFormIssues = {
		descripcion: submitted && descripcionIssue ? getRiesgoRuleMessage(descripcionIssue) : serviceIssues.descripcion,
		decisionNecesaria: submitted && decisionIssues.decision ? getRiesgoRuleMessage(decisionIssues.decision) : serviceIssues.decisionNecesaria,
		fechaLimite: submitted && decisionIssues.fecha ? getRiesgoRuleMessage(decisionIssues.fecha) : serviceIssues.fechaLimite
	};

	const handleValidation = (error: RiesgoValidationError): void => {
		const campos = error.campos;
		setServiceIssues({
			descripcion: campos.descripcion ? getRiesgoRuleMessage(campos.descripcion) : undefined,
			decisionNecesaria: campos.decisionNecesaria ? getRiesgoRuleMessage(campos.decisionNecesaria) : undefined,
			fechaLimite: campos.fechaLimite ? getRiesgoRuleMessage(campos.fechaLimite) : undefined
		});
		setRuleError(campos.tarea !== undefined || campos.estado !== undefined || campos.requiereDecision !== undefined);
	};

	const handleFailure = (error: unknown): void => {
		console.error('No se pudo guardar el riesgo.', error);
		const guardado = error instanceof RiesgoGuardadoError ? error : undefined;
		pendiente.current = guardado?.pendiente;
		setIsLocked(pendiente.current !== undefined);
		setSaveFailure(guardado && !guardado.revertido ? 'incompleto' : 'simple');
	};

	const save = async (): Promise<void> => {
		setSubmitted(true);
		if (hasIssues) {
			return;
		}
		setIsSaving(true);
		setSaveFailure(undefined);
		setRuleError(false);
		setServiceIssues({});
		try {
			const decisionNecesaria = values.requiereDecision ? values.decisionNecesaria : undefined;
			const fechaLimite = values.requiereDecision ? fecha : undefined;
			if (item) {
				await getRiesgoService().editar({
					riesgoId: item.riesgo.Id as number,
					descripcion: values.descripcion,
					estado: values.estado,
					requiereDecision: values.requiereDecision,
					decisionNecesaria,
					fechaLimite
				});
				onSaved(item.riesgo.Estado === EstadoRiesgo.Activo && values.estado === EstadoRiesgo.Escalado, values.descripcion.trim());
				return;
			}
			await getRiesgoService().crear({
				tareaId: tarea.Id as number,
				descripcion: values.descripcion,
				requiereDecision: values.requiereDecision,
				decisionNecesaria,
				fechaLimite
			}, pendiente.current);
			pendiente.current = undefined;
			onSaved(false, values.descripcion.trim());
		}
		catch (error) {
			setIsSaving(false);
			if (error instanceof RiesgoValidationError) {
				handleValidation(error);
			}
			else {
				handleFailure(error);
			}
		}
	};

	return (
		<Panel
			open
			className={styles.panel}
			title={buildPanelTitle(
				item ? Utils.replaceAll(strings.RiesgoFormEditTitle, '{0}', formatRiesgoId(item.riesgo.Id)) : strings.RiesgoNew,
				formatIdNombre(formatTareaId(tarea.Id), tarea.Nombre)
			)}
			onClose={onCancel}
			primaryAction={<Button variant="secondary" onClick={onCancel}>{strings.Cancel}</Button>}
			secondaryAction={<Button variant="primary" disabled={isSaving} onClick={save}>{strings.Save}</Button>}
		>
			<RiesgoForm
				values={values}
				issues={issues}
				isLocked={isLocked}
				isEdit={item !== undefined}
				estadosDisponibles={getEstadosDisponibles(item?.riesgo.Estado)}
				isRequiereDecisionFijo={isRequiereDecisionFijo(item?.decision)}
				onChange={setValues}
			/>
			<div style={{ paddingRight: spacing.lg, paddingTop: spacing.lg }}>
				{saveFailure === 'simple' && <MessageBar type="error" message={strings.RiesgoSaveError} />}
				{saveFailure === 'incompleto' && <MessageBar type="error" message={strings.RiesgoSaveIncompleteError} />}
				{ruleError && <MessageBar type="error" message={strings.RiesgoRuleError} />}
			</div>
		</Panel>
	);
};

export default RiesgoFormPanel;
