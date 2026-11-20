import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Dropdown, Input, Tooltip } from '../../../../../../core/ui/components';
import { FigmaIcon, spacing } from '../../../../../../core/ui/foundations';
import { TipoMedicion } from '../../../../../../core/utils/Constants';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import { ICON_BUTTON_STYLE } from '../../../shared/iconButtonStyle';
import { IResultadoClaveDraft, IResultadoClaveIssues, createEmptyDraft } from '../../resultadoClaveUtils';
import formStyles from '../IniciativaForm.module.scss';
import styles from './ResultadosClaveBloque.module.scss';

export interface IResultadosClaveBloqueProps {
	drafts: IResultadoClaveDraft[];
	issues: IResultadoClaveIssues[];
	onChange: (drafts: IResultadoClaveDraft[]) => void;
}

type DraftField = 'nombre' | 'tipo' | 'unidad' | 'minimo' | 'meta' | 'maximo';

const REMOVE_BUTTON_STYLE: CSSProperties = { ...ICON_BUTTON_STYLE, width: 24, minWidth: 24, padding: 0 };
const NUMBER_STEP = 'any';

const tipoOptions = Object.values(TipoMedicion).map((value) => ({ key: value, text: value }));

const toKey = (value: string | string[]): string => (Array.isArray(value) ? value[0] : value);

const ResultadosClaveBloque: React.FC<IResultadosClaveBloqueProps> = ({ drafts, issues, onChange }) => {
	const nextKey = drafts.length === 0 ? 0 : Math.max(...drafts.map((draft) => draft.key)) + 1;

	const update = (key: number, field: DraftField, value: string): void =>
		onChange(drafts.map((draft) => (draft.key === key ? { ...draft, [field]: value } : draft)));

	const invalid = (issue: string | undefined): string | undefined => (issue ? formStyles.invalid : undefined);

	const addAction = (
		<Tooltip content={strings.ResultadoClaveAddTooltip}>
			<Button
				iconOnly
				variant="secondary"
				size="small"
				style={ICON_BUTTON_STYLE}
				iconLeft={<FigmaIcon name="addPrimary" />}
				aria-label={strings.ResultadoClaveAddTooltip}
				onClick={() => onChange([...drafts, createEmptyDraft(nextKey)])}
			/>
		</Tooltip>
	);

	const renderNumero = (draft: IResultadoClaveDraft, field: 'minimo' | 'meta' | 'maximo', label: string, issue: string | undefined): React.ReactNode => (
		<Input
			type="number"
			step={NUMBER_STEP}
			label={label}
			required
			value={draft[field]}
			className={invalid(issue)}
			errorMessage={issue}
			onChange={(event) => update(draft.key, field, event.target.value)}
		/>
	);

	return (
		<SectionBand title={strings.ResultadoClaveFormSection} action={addAction}>
			<div className={styles.bloques} style={{ gap: spacing.lg }}>
				{drafts.map((draft, index) => {
					const draftIssues = issues[index] ?? {};
					const numero = String(index + 1);
					const canRemove = index > 0 && draft.id === undefined;
					return (
						<div key={draft.key} className={styles.bloque} style={{ gap: spacing.md }}>
							{canRemove && (
								<div className={styles.bloqueHeader}>
									<Tooltip content={Utils.replaceAll(strings.ResultadoClaveRemoveTooltip, '{0}', numero)}>
										<Button
											iconOnly
											variant="secondary"
											size="small"
											style={REMOVE_BUTTON_STYLE}
											iconLeft={<FigmaIcon name="deletePrimary" />}
											aria-label={Utils.replaceAll(strings.ResultadoClaveRemoveTooltip, '{0}', numero)}
											onClick={() => onChange(drafts.filter((item) => item.key !== draft.key))}
										/>
									</Tooltip>
								</div>
							)}
							<Input
								label={Utils.replaceAll(strings.ResultadoClaveFormName, '{0}', numero)}
								required
								placeholder={strings.ResultadoClaveFormNamePlaceholder}
								value={draft.nombre}
								className={invalid(draftIssues.nombre)}
								errorMessage={draftIssues.nombre}
								onChange={(event) => update(draft.key, 'nombre', event.target.value)}
							/>
							<div className={styles.gridPair} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
								<Dropdown
									label={strings.ResultadoClaveFormType}
									required
									placeholder={strings.ResultadoClaveSelect}
									options={tipoOptions}
									value={draft.tipo}
									className={invalid(draftIssues.tipo)}
									errorMessage={draftIssues.tipo}
									onChange={(value) => update(draft.key, 'tipo', toKey(value))}
								/>
								<Input
									label={strings.ResultadoClaveFormUnit}
									required
									placeholder={strings.ResultadoClaveFormUnitPlaceholder}
									value={draft.unidad}
									className={invalid(draftIssues.unidad)}
									errorMessage={draftIssues.unidad}
									onChange={(event) => update(draft.key, 'unidad', event.target.value)}
								/>
							</div>
							<div className={styles.gridTriple} style={{ columnGap: spacing.md, rowGap: spacing.md }}>
								{renderNumero(draft, 'minimo', strings.ResultadoClaveFieldMin, draftIssues.minimo)}
								{renderNumero(draft, 'meta', strings.ResultadoClaveFieldGoal, draftIssues.meta)}
								{renderNumero(draft, 'maximo', strings.ResultadoClaveFieldMax, draftIssues.maximo)}
							</div>
						</div>
					);
				})}
			</div>
		</SectionBand>
	);
};

export default ResultadosClaveBloque;
