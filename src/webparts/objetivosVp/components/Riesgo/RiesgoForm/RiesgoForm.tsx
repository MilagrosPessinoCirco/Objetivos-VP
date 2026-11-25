import * as React from 'react';

import { Dropdown, Input, Multiline } from '../../../../../core/ui/components';
import { Picker } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import { EstadoRiesgo } from '../../../../../core/utils/Constants';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../shared/getColorStep';
import { formatDate, fromDateInput } from '../../Objetivo/objetivoUtils';
import { getEstadoRiesgoLabel } from '../riesgoUtils';
import styles from './RiesgoForm.module.scss';

export interface IRiesgoFormValues {
	descripcion: string;
	estado: EstadoRiesgo;
	requiereDecision: boolean;
	decisionNecesaria: string;
	fechaLimite: string;
}

export interface IRiesgoFormIssues {
	descripcion?: string;
	decisionNecesaria?: string;
	fechaLimite?: string;
}

export interface IRiesgoFormProps {
	values: IRiesgoFormValues;
	issues: IRiesgoFormIssues;
	isLocked: boolean;
	isEdit?: boolean;
	estadosDisponibles?: EstadoRiesgo[];
	isRequiereDecisionFijo?: boolean;
	onChange: (values: IRiesgoFormValues) => void;
}

const REQUIRE_NO = 'no';
const REQUIRE_YES = 'si';

const ERROR_COLOR = getColorStep('Red', '600').value;

const ERROR_STYLE: React.CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	color: ERROR_COLOR
};

const toKey = (value: string | string[]): string => (Array.isArray(value) ? value[0] : value);

const REQUIRE_OPTIONS = [
	{ key: REQUIRE_NO, text: strings.No },
	{ key: REQUIRE_YES, text: strings.Yes }
];

const RiesgoForm: React.FC<IRiesgoFormProps> = ({ values, issues, isLocked, isEdit = false, estadosDisponibles = [], isRequiereDecisionFijo = false, onChange }) => {
	const invalid = (issue: string | undefined, extra?: string): string | undefined =>
		[issue ? styles.invalid : undefined, extra].filter(Boolean).join(' ') || undefined;

	return (
		<div className={styles.panelContent} style={{ gap: spacing.lg, paddingRight: spacing.lg, '--field-error': ERROR_COLOR } as React.CSSProperties}>
			<Multiline
				label={strings.ObjetivoFieldDescription}
				required
				disabled={isLocked}
				placeholder={strings.RiesgoFieldDescriptionPlaceholder}
				value={values.descripcion}
				className={invalid(issues.descripcion, styles.multiline)}
				errorMessage={issues.descripcion}
				onChange={(event) => onChange({ ...values, descripcion: event.target.value })}
			/>
			{isEdit
				? (
					<Dropdown
						label={strings.ObjetivoFormStatus}
						required
						disabled={isLocked}
						options={estadosDisponibles.map((estado) => ({ key: estado, text: getEstadoRiesgoLabel(estado) }))}
						value={values.estado}
						onChange={(value) => onChange({ ...values, estado: toKey(value) as EstadoRiesgo })}
					/>
				)
				: <Input label={strings.ObjetivoFormStatus} disabled value={strings.RiesgoStateActive} />}
			<Dropdown
				label={strings.RiesgoFieldRequiresDecision}
				required
				disabled={isLocked || isRequiereDecisionFijo}
				options={REQUIRE_OPTIONS}
				value={values.requiereDecision ? REQUIRE_YES : REQUIRE_NO}
				onChange={(value) => onChange({ ...values, requiereDecision: toKey(value) === REQUIRE_YES })}
			/>
			{values.requiereDecision && (
				<>
					<Multiline
						label={strings.RiesgoFieldDecision}
						required
						disabled={isLocked}
						placeholder={strings.RiesgoFieldDecisionPlaceholder}
						value={values.decisionNecesaria}
						className={invalid(issues.decisionNecesaria, styles.multiline)}
						errorMessage={issues.decisionNecesaria}
						onChange={(event) => onChange({ ...values, decisionNecesaria: event.target.value })}
					/>
					<div className={invalid(issues.fechaLimite, styles.field)} style={{ gap: spacing.xs }}>
						{isLocked
							? <Input label={strings.RiesgoFieldDueDate} required disabled value={formatDate(fromDateInput(values.fechaLimite))} />
							: <Picker mode="date" label={strings.RiesgoFieldDueDate} required value={values.fechaLimite} onChange={(fechaLimite) => onChange({ ...values, fechaLimite })} />}
						{issues.fechaLimite && <span role="alert" style={ERROR_STYLE}>{issues.fechaLimite}</span>}
					</div>
				</>
			)}
		</div>
	);
};

export default RiesgoForm;
