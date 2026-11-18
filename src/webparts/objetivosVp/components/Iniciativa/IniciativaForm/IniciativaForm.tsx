import * as React from 'react';

import { Button, Dropdown, Input, Multiline } from '../../../../../core/ui/components';
import { MessageBar, Panel, Picker } from '../../../../../core/ui/patterns';
import type { IPersonOption } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import { Area, Iniciativa, Objetivo, Usuario } from '../../../../../core/entities';
import { EstadoIniciativa } from '../../../../../core/utils/Constants';
import { ILookupValue, IPersonValue } from '../../../../../core/utils/Mappers';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { buildPanelTitle } from '../../shared/panelTitle';
import { getColorStep } from '../../shared/getColorStep';
import { formatDate, fromDateInput, toDateInput } from '../../Objetivo/objetivoUtils';
import ConfirmacionModal from '../ConfirmacionModal/ConfirmacionModal';
import { formatIniciativaId, formatObjetivoLabel } from '../iniciativaUtils';
import styles from './IniciativaForm.module.scss';

export interface IIniciativaFormBodyProps {
	objetivos: Objetivo[];
	areas: Area[];
	usuarios: Usuario[];
	currentUser?: IPersonValue;
	initialObjetivoId?: number;
	iniciativa?: Iniciativa;
	onSave: (iniciativa: Iniciativa) => Promise<void>;
	onCancel: () => void;
}

const NAME_MAX_LENGTH = 255;
const PEOPLE_LOCALE = 'es';

const ERROR_COLOR = getColorStep('Red', '600').value;

const ERROR_STYLE: React.CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	color: ERROR_COLOR
};

const toKey = (value: string | string[]): string => (Array.isArray(value) ? value[0] : value);
const toKeys = (value: string | string[]): string[] => (Array.isArray(value) ? value : [value]);

const toPersonOption = (persona: IPersonValue): IPersonOption => ({ key: String(persona.Id), name: persona.Title });

const byName = (a: IPersonValue, b: IPersonValue): number => a.Title.localeCompare(b.Title, PEOPLE_LOCALE);

const uniquePeople = (personas: IPersonValue[]): IPersonValue[] =>
	personas.filter((persona, index) => personas.findIndex((other) => other.Id === persona.Id) === index);

export const IniciativaFormBody: React.FC<IIniciativaFormBodyProps> = ({ objetivos, areas, usuarios, currentUser, initialObjetivoId, iniciativa, onSave, onCancel }) => {
	const isEdit = iniciativa !== undefined;
	const initialObjetivo = iniciativa?.Objetivo?.Id ?? objetivos.filter((objetivo) => objetivo.Id === initialObjetivoId)[0]?.Id;
	const initialAccountable = iniciativa ? iniciativa.Accountable : currentUser;

	const [objetivoId, setObjetivoId] = React.useState<string>(initialObjetivo === undefined ? '' : String(initialObjetivo));
	const [nombre, setNombre] = React.useState<string>(iniciativa?.Nombre ?? '');
	const [descripcion, setDescripcion] = React.useState<string>(iniciativa?.Descripcion ?? '');
	const [accountable, setAccountable] = React.useState<IPersonOption[]>(initialAccountable ? [toPersonOption(initialAccountable)] : []);
	const [areaIds, setAreaIds] = React.useState<string[]>((iniciativa?.Area ?? []).map((area) => String(area.Id)));
	const [fechaInicio, setFechaInicio] = React.useState<string>(toDateInput(iniciativa?.FechaInicio));
	const [fechaCompromiso, setFechaCompromiso] = React.useState<string>(toDateInput(iniciativa?.FechaCompromiso));
	const [submitted, setSubmitted] = React.useState<boolean>(false);
	const [isConfirmOpen, setIsConfirmOpen] = React.useState<boolean>(false);
	const [isSaving, setIsSaving] = React.useState<boolean>(false);
	const [saveFailed, setSaveFailed] = React.useState<boolean>(false);

	const personas = uniquePeople([
		...usuarios.filter((usuario) => usuario.Activo === true && usuario.Usuario).map((usuario) => usuario.Usuario as IPersonValue),
		...(currentUser ? [currentUser] : []),
		...(iniciativa?.Accountable ? [iniciativa.Accountable] : [])
	]).sort(byName);
	const peopleOptions = personas.map(toPersonOption);

	const objetivoOptions = objetivos
		.slice()
		.sort((a, b) => (a.Id ?? 0) - (b.Id ?? 0))
		.map((objetivo) => ({ key: String(objetivo.Id), text: formatObjetivoLabel(objetivo) }));
	const areaOptions = areas
		.slice()
		.sort((a, b) => (a.Nombre ?? '').localeCompare(b.Nombre ?? '', PEOPLE_LOCALE))
		.map((area) => ({ key: String(area.Id), text: area.Nombre ?? '' }));

	const objetivo = objetivos.filter((item) => String(item.Id) === objetivoId)[0];
	const objetivoInicio = toDateInput(objetivo?.FechaInicio);
	const objetivoCompromiso = toDateInput(objetivo?.FechaCompromiso);
	const hasObjetivoRange = objetivoInicio !== '' && objetivoCompromiso !== '';
	const outOfRange = Utils.replaceAll(Utils.replaceAll(strings.IniciativaDateOutOfRange,
		'{0}', formatDate(objetivo?.FechaInicio)),
		'{1}', formatDate(objetivo?.FechaCompromiso));

	const startIssue = fechaInicio === ''
		? strings.RequiredField
		: hasObjetivoRange && fechaInicio < objetivoInicio ? outOfRange : undefined;
	const commitmentIssue = fechaCompromiso === ''
		? strings.RequiredField
		: fechaInicio !== '' && fechaCompromiso < fechaInicio
			? strings.ObjetivoDateOrder
			: hasObjetivoRange && fechaCompromiso > objetivoCompromiso ? outOfRange : undefined;

	const issues = {
		objetivo: objetivoId === '' ? strings.RequiredField : undefined,
		nombre: nombre.trim() === '' ? strings.RequiredField : undefined,
		descripcion: descripcion.trim() === '' ? strings.RequiredField : undefined,
		accountable: accountable.length === 0 ? strings.RequiredField : undefined,
		fechaInicio: startIssue,
		fechaCompromiso: commitmentIssue
	};
	const hasIssues = Object.values(issues).some((issue) => issue !== undefined);
	const shown = (issue: string | undefined): string | undefined => (submitted ? issue : undefined);
	const invalid = (issue: string | undefined, extra?: string): string | undefined =>
		[shown(issue) ? styles.invalid : undefined, extra].filter(Boolean).join(' ') || undefined;

	const title = isEdit
		? buildPanelTitle(Utils.replaceAll(strings.IniciativaFormEditTitle, '{0}', formatIniciativaId(iniciativa?.Id)), iniciativa?.Nombre)
		: buildPanelTitle(strings.IniciativaNew);

	const requestSave = (): void => {
		setSubmitted(true);
		if (!hasIssues) {
			setIsConfirmOpen(true);
		}
	};

	const buildIniciativa = (): Iniciativa => {
		const toSave = new Iniciativa();
		toSave.Id = iniciativa?.Id;
		toSave.Nombre = nombre.trim();
		toSave.Descripcion = descripcion.trim();
		toSave.Objetivo = isEdit ? iniciativa?.Objetivo : { Id: objetivo?.Id as number, Title: objetivo?.Nombre ?? '' };
		toSave.Accountable = personas.filter((persona) => String(persona.Id) === accountable[0]?.key)[0];
		toSave.Area = areaIds
			.map((id) => areas.filter((area) => String(area.Id) === id)[0])
			.filter((area): area is Area => area !== undefined)
			.map((area): ILookupValue => ({ Id: area.Id as number, Title: area.Nombre ?? '' }));
		toSave.FechaInicio = fromDateInput(fechaInicio);
		toSave.FechaCompromiso = fromDateInput(fechaCompromiso);
		toSave.Estado = isEdit ? iniciativa?.Estado : EstadoIniciativa.NoIniciada;
		return toSave;
	};

	const save = async (): Promise<void> => {
		setIsSaving(true);
		setSaveFailed(false);
		try {
			await onSave(buildIniciativa());
		}
		catch {
			setSaveFailed(true);
			setIsSaving(false);
			setIsConfirmOpen(false);
		}
	};

	const renderFieldError = (issue: string | undefined): React.ReactNode =>
		shown(issue) && <span role="alert" style={ERROR_STYLE}>{issue}</span>;

	return (
		<Panel
			open
			className={styles.panel}
			title={title}
			onClose={onCancel}
			primaryAction={<Button variant="secondary" onClick={onCancel}>{strings.Cancel}</Button>}
			secondaryAction={
				<Button variant="primary" disabled={isSaving} onClick={requestSave}>
					{isEdit ? strings.SaveChanges : strings.IniciativaNew}
				</Button>
			}
		>
			<div className={styles.panelContent} style={{ gap: spacing.lg, paddingRight: spacing.lg, '--field-error': ERROR_COLOR } as React.CSSProperties}>
				<Dropdown
					label={strings.ObjetivoColumnName}
					required
					placeholder={strings.ObjetivoFormSelect}
					options={objetivoOptions}
					value={objetivoId}
					disabled={isEdit}
					className={invalid(issues.objetivo)}
					errorMessage={shown(issues.objetivo)}
					onChange={(value) => setObjetivoId(toKey(value))}
				/>
				<Input
					label={strings.IniciativaFormName}
					required
					maxLength={NAME_MAX_LENGTH}
					placeholder={strings.IniciativaFormNamePlaceholder}
					value={nombre}
					className={invalid(issues.nombre)}
					errorMessage={shown(issues.nombre)}
					onChange={(event) => setNombre(event.target.value)}
				/>
				<Multiline
					label={strings.IniciativaDescription}
					required
					placeholder={strings.IniciativaFormDescriptionPlaceholder}
					value={descripcion}
					className={invalid(issues.descripcion, styles.multiline)}
					errorMessage={shown(issues.descripcion)}
					onChange={(event) => setDescripcion(event.target.value)}
				/>
				<div className={invalid(issues.accountable, styles.field)} style={{ gap: spacing.xs }}>
					<Picker
						mode="people"
						label={strings.IniciativaAccountable}
						required
						people={peopleOptions}
						selectedPeople={accountable}
						onSelectedPeopleChange={(next) => setAccountable(next.slice(-1))}
					/>
					{renderFieldError(issues.accountable)}
				</div>
				<Dropdown
					label={strings.IniciativaAreas}
					multiple
					placeholder={strings.ObjetivoFormSelect}
					options={areaOptions}
					value={areaIds}
					onChange={(value) => setAreaIds(toKeys(value))}
				/>
				<div className={styles.gridPair} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
					<div className={invalid(issues.fechaInicio, styles.field)} style={{ gap: spacing.xs }}>
						<Picker mode="date" label={strings.ObjetivoFormStartDate} required value={fechaInicio} onChange={setFechaInicio} />
						{renderFieldError(issues.fechaInicio)}
					</div>
					<div className={invalid(issues.fechaCompromiso, styles.field)} style={{ gap: spacing.xs }}>
						<Picker mode="date" label={strings.ObjetivoFormCommitmentDate} required value={fechaCompromiso} onChange={setFechaCompromiso} />
						{renderFieldError(issues.fechaCompromiso)}
					</div>
				</div>
				{saveFailed && <MessageBar type="error" message={strings.IniciativaSaveError} />}
			</div>
			{isConfirmOpen && (
				<ConfirmacionModal
					title={isEdit ? strings.SaveChanges : strings.IniciativaNew}
					message={isEdit ? strings.IniciativaConfirmEdit : strings.IniciativaConfirmCreate}
					isSaving={isSaving}
					onAccept={save}
					onCancel={() => setIsConfirmOpen(false)}
				/>
			)}
		</Panel>
	);
};
