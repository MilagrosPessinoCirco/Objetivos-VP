import * as React from 'react';

import { Button, Dropdown, Input, Multiline } from '../../../../../core/ui/components';
import { MessageBar, Panel, Picker } from '../../../../../core/ui/patterns';
import type { IPersonOption } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import { Area, Iniciativa, Objetivo, Tarea, Usuario } from '../../../../../core/entities';
import { EstadoIniciativa, EstadoTarea, Prioridad } from '../../../../../core/utils/Constants';
import { ILookupValue, IPersonValue } from '../../../../../core/utils/Mappers';
import { Utils } from '../../../../../core/utils';
import { isPermisoDenegadoError } from '../../../../../core/utils/Permisos';
import * as strings from 'ObjetivosVpWebPartStrings';
import { buildPanelTitle } from '../../shared/panelTitle';
import { getColorStep } from '../../shared/getColorStep';
import { fromDateInput, toDateInput } from '../../Objetivo/objetivoUtils';
import ConfirmacionModal from '../../Iniciativa/ConfirmacionModal/ConfirmacionModal';
import { formatIdNombre, formatIniciativaId, formatObjetivoLabel } from '../../Iniciativa/iniciativaUtils';
import { TAREA_MAX_LENGTH, formatTareaId, getFechasIssues, getLengthIssue, isTopeError } from '../tareaUtils';
import styles from './TareaForm.module.scss';

export interface ITareaFormBodyProps {
	iniciativas: Iniciativa[];
	objetivos: Objetivo[];
	areas: Area[];
	usuarios: Usuario[];
	currentUser?: IPersonValue;
	iniciativaFijaId?: number;
	tarea?: Tarea;
	onSave: (tarea: Tarea) => Promise<void>;
	onCancel: () => void;
}

const PEOPLE_LOCALE = 'es';
const NO_PRIORITY_KEY = '';

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

const byId = (a: Iniciativa, b: Iniciativa): number => (a.Id ?? 0) - (b.Id ?? 0);

const uniquePeople = (personas: IPersonValue[]): IPersonValue[] =>
	personas.filter((persona, index) => personas.findIndex((other) => other.Id === persona.Id) === index);

export const TareaFormBody: React.FC<ITareaFormBodyProps> = ({
	iniciativas,
	objetivos,
	areas,
	usuarios,
	currentUser,
	iniciativaFijaId,
	tarea,
	onSave,
	onCancel
}) => {
	const iniciativaInicialId = iniciativaFijaId ?? tarea?.Iniciativa?.Id;
	const [iniciativaId, setIniciativaId] = React.useState<string>(iniciativaInicialId === undefined ? '' : String(iniciativaInicialId));
	const [nombre, setNombre] = React.useState<string>(tarea?.Nombre ?? '');
	const [responsable, setResponsable] = React.useState<IPersonOption[]>(
		tarea ? (tarea.Responsable ? [toPersonOption(tarea.Responsable)] : []) : currentUser ? [toPersonOption(currentUser)] : []
	);
	const [descripcion, setDescripcion] = React.useState<string>(tarea?.Descripcion ?? '');
	const [queHabilita, setQueHabilita] = React.useState<string>(tarea?.QueHabilita ?? '');
	const [areaIds, setAreaIds] = React.useState<string[]>((tarea?.Area ?? []).map((area) => String(area.Id)));
	const [prioridad, setPrioridad] = React.useState<string>(tarea?.Prioridad ?? NO_PRIORITY_KEY);
	const [fechaInicio, setFechaInicio] = React.useState<string>(toDateInput(tarea?.FechaInicio));
	const [fechaCompromiso, setFechaCompromiso] = React.useState<string>(toDateInput(tarea?.FechaCompromiso));
	const [submitted, setSubmitted] = React.useState<boolean>(false);
	const [isConfirmOpen, setIsConfirmOpen] = React.useState<boolean>(false);
	const [isSaving, setIsSaving] = React.useState<boolean>(false);
	const [saveFailed, setSaveFailed] = React.useState<boolean>(false);
	const [permisoDenegado, setPermisoDenegado] = React.useState<boolean>(false);
	const [topeIssue, setTopeIssue] = React.useState<string | undefined>(undefined);

	const personas = uniquePeople([
		...usuarios.filter((usuario) => usuario.Activo === true && usuario.Usuario).map((usuario) => usuario.Usuario as IPersonValue),
		...(currentUser ? [currentUser] : [])
	]).sort(byName);
	const peopleOptions = personas.map(toPersonOption);

	const iniciativaOptions = iniciativas
		.filter((item) => String(item.Id) === String(iniciativaInicialId)
			|| (item.Estado !== EstadoIniciativa.Finalizada && item.Estado !== EstadoIniciativa.Cancelada))
		.sort(byId)
		.map((item) => ({ key: String(item.Id), text: formatIdNombre(formatIniciativaId(item.Id), item.Nombre) }));
	const areaLookups: ILookupValue[] = [
		...areas.map((area): ILookupValue => ({ Id: area.Id as number, Title: area.Nombre ?? '' })),
		...(tarea?.Area ?? []).filter((actual) => !areas.some((area) => area.Id === actual.Id))
	];
	const areaOptions = areaLookups
		.slice()
		.sort((a, b) => a.Title.localeCompare(b.Title, PEOPLE_LOCALE))
		.map((area) => ({ key: String(area.Id), text: area.Title }));
	const prioridadOptions = [
		{ key: NO_PRIORITY_KEY, text: strings.TareaNoPriority },
		...Object.values(Prioridad).map((value) => ({ key: value as string, text: value as string }))
	];

	const iniciativa = iniciativas.filter((item) => String(item.Id) === iniciativaId)[0];
	const objetivo = objetivos.filter((item) => item.Id === iniciativa?.Objetivo?.Id)[0];
	const fechasIssues = getFechasIssues(fechaInicio, fechaCompromiso, iniciativa);

	const issues = {
		iniciativa: iniciativaId === '' ? strings.RequiredField : undefined,
		nombre: nombre.trim() === ''
			? strings.RequiredField
			: getLengthIssue(nombre.trim(), TAREA_MAX_LENGTH.nombre, strings.TareaNameTooLong),
		responsable: responsable.length === 0 ? strings.RequiredField : undefined,
		descripcion: descripcion.trim() === '' ? strings.RequiredField : undefined,
		queHabilita: queHabilita.trim() === '' ? strings.RequiredField : undefined,
		areas: areaIds.length === 0 ? strings.RequiredField : undefined,
		fechaInicio: fechasIssues.inicio,
		fechaCompromiso: fechasIssues.compromiso
	};
	const hasIssues = Object.values(issues).some((issue) => issue !== undefined);
	const shown = (issue: string | undefined): string | undefined => (submitted ? issue : undefined);
	const invalid = (issue: string | undefined, extra?: string): string | undefined =>
		[shown(issue) ? styles.invalid : undefined, extra].filter(Boolean).join(' ') || undefined;

	const iniciativaError = shown(issues.iniciativa) ?? topeIssue;

	const requestSave = (): void => {
		setSubmitted(true);
		if (!hasIssues) {
			setIsConfirmOpen(true);
		}
	};

	const buildTarea = (): Tarea => {
		const toSave = new Tarea();
		toSave.Nombre = nombre.trim();
		toSave.Descripcion = descripcion.trim();
		toSave.QueHabilita = queHabilita.trim();
		toSave.Responsable = [...personas, ...(tarea?.Responsable ? [tarea.Responsable] : [])]
			.filter((persona) => String(persona.Id) === responsable[0]?.key)[0];
		toSave.Area = areaIds
			.map((id) => areaLookups.filter((area) => String(area.Id) === id)[0])
			.filter((area): area is ILookupValue => area !== undefined);
		toSave.Prioridad = prioridad === NO_PRIORITY_KEY ? undefined : prioridad as Prioridad;
		toSave.FechaInicio = fromDateInput(fechaInicio);
		toSave.FechaCompromiso = fromDateInput(fechaCompromiso);
		if (!tarea) {
			toSave.Iniciativa = { Id: iniciativa?.Id as number, Title: iniciativa?.Nombre ?? '' };
			toSave.Objetivo = { Id: objetivo?.Id as number, Title: objetivo?.Nombre ?? '' };
			toSave.Estado = EstadoTarea.NoIniciada;
			toSave.Avance = 0;
		}
		return toSave;
	};

	const save = async (): Promise<void> => {
		setIsSaving(true);
		setSaveFailed(false);
		setPermisoDenegado(false);
		setTopeIssue(undefined);
		try {
			await onSave(buildTarea());
		}
		catch (saveError) {
			setIsSaving(false);
			setIsConfirmOpen(false);
			if (isTopeError(saveError)) {
				setTopeIssue(saveError.message);
			}
			else {
				setPermisoDenegado(isPermisoDenegadoError(saveError));
				setSaveFailed(true);
			}
		}
	};

	const renderFieldError = (issue: string | undefined): React.ReactNode =>
		shown(issue) && <span role="alert" style={ERROR_STYLE}>{issue}</span>;

	return (
		<Panel
			open
			className={styles.panel}
			title={tarea ? buildPanelTitle(Utils.replaceAll(strings.TareaFormEditTitle, '{0}', formatTareaId(tarea.Id)), tarea.Nombre) : buildPanelTitle(strings.TareaNew)}
			onClose={onCancel}
			primaryAction={<Button variant="secondary" onClick={onCancel}>{strings.Cancel}</Button>}
			secondaryAction={
				<Button variant="primary" disabled={isSaving} onClick={requestSave}>
					{tarea ? strings.SaveChanges : strings.TareaNew}
				</Button>
			}
		>
			<div className={styles.panelContent} style={{ gap: spacing.lg, paddingRight: spacing.lg, '--field-error': ERROR_COLOR } as React.CSSProperties}>
				<Dropdown
					label={strings.IniciativaColumnName}
					required
					placeholder={strings.ObjetivoFormSelect}
					options={iniciativaOptions}
					value={iniciativaId}
					disabled={iniciativaInicialId !== undefined}
					className={iniciativaError ? styles.invalid : undefined}
					errorMessage={iniciativaError}
					onChange={(value) => {
						setIniciativaId(toKey(value));
						setTopeIssue(undefined);
					}}
				/>
				<Input
					label={strings.ObjetivoColumnName}
					disabled
					value={objetivo ? formatObjetivoLabel(objetivo) : ''}
				/>
				<Input
					label={strings.TareaFormName}
					required
					maxLength={TAREA_MAX_LENGTH.nombre}
					placeholder={strings.TareaFormNamePlaceholder}
					value={nombre}
					className={invalid(issues.nombre)}
					errorMessage={shown(issues.nombre)}
					onChange={(event) => setNombre(event.target.value)}
				/>
				<div className={invalid(issues.responsable, styles.field)} style={{ gap: spacing.xs }}>
					<Picker
						mode="people"
						label={strings.TareaColumnResponsible}
						required
						people={peopleOptions}
						selectedPeople={responsable}
						onSelectedPeopleChange={(next) => setResponsable(next.slice(-1))}
					/>
					{renderFieldError(issues.responsable)}
				</div>
				<Multiline
					label={strings.ObjetivoFormDescription}
					required
					placeholder={strings.TareaFormDescriptionPlaceholder}
					value={descripcion}
					className={invalid(issues.descripcion, styles.multiline)}
					errorMessage={shown(issues.descripcion)}
					onChange={(event) => setDescripcion(event.target.value)}
				/>
				<Multiline
					label={strings.TareaEnables}
					required
					placeholder={strings.TareaEnablesPlaceholder}
					value={queHabilita}
					className={invalid(issues.queHabilita, styles.multiline)}
					errorMessage={shown(issues.queHabilita)}
					onChange={(event) => setQueHabilita(event.target.value)}
				/>
				<Dropdown
					label={strings.IniciativaAreas}
					required
					multiple
					placeholder={strings.ObjetivoFormSelect}
					options={areaOptions}
					value={areaIds}
					className={invalid(issues.areas)}
					errorMessage={shown(issues.areas)}
					onChange={(value) => setAreaIds(toKeys(value))}
				/>
				<Dropdown
					label={strings.TareaPriority}
					options={prioridadOptions}
					value={prioridad}
					onChange={(value) => setPrioridad(toKey(value))}
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
				{saveFailed && <MessageBar type="error" message={permisoDenegado ? strings.PermisoDenegado : strings.TareaSaveError} />}
			</div>
			{isConfirmOpen && (
				<ConfirmacionModal
					title={tarea ? strings.SaveChanges : strings.TareaNew}
					message={tarea ? strings.TareaConfirmEdit : Utils.replaceAll(strings.TareaConfirmCreate, '{0}', responsable[0]?.name ?? '')}
					isSaving={isSaving}
					onAccept={save}
					onCancel={() => setIsConfirmOpen(false)}
				/>
			)}
		</Panel>
	);
};
