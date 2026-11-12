import * as React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button, Dropdown, Input, Multiline, SpinButton, Switch } from '../../../../../core/ui/components';
import { MessageBar, Panel, Picker, Spinner, Surface } from '../../../../../core/ui/patterns';
import { FigmaIcon, colors, spacing, typography } from '../../../../../core/ui/foundations';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import { Departamento, Gerencia, Objetivo, Palanca, Vicepresidencia } from '../../../../../core/entities';
import { Duracion, Estado } from '../../../../../core/utils/Constants';
import { ILookupValue } from '../../../../../core/utils/Mappers';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { PALANCAS_PATH, PALANCA_QUERY_PARAM, getObjetivoPath } from '../../ObjetivosVp/routes';
import SectionBand from '../../shared/SectionBand/SectionBand';
import { PAGE_TITLE_STYLE } from '../../shared/pageTitleStyle';
import { formatObjetivoId, fromDateInput, isNotFoundError, isVpRrii, toDateInput } from '../objetivoUtils';
import NombreAyuda from './NombreAyuda/NombreAyuda';
import useObjetivoFormMasters from './useObjetivoFormMasters';
import styles from './ObjetivoForm.module.scss';

type LoadError = 'notFound' | 'error';

export interface IObjetivoFormBodyProps {
	vps: Vicepresidencia[];
	departamentos: Departamento[];
	gerencias: Gerencia[];
	palancas: Palanca[];
	initialPalancaId?: number;
	objetivo?: Objetivo;
	panel?: boolean;
	onSave: (objetivo: Objetivo) => Promise<void>;
	onCancel: () => void;
}

interface INamed {
	Id?: number;
	Nombre?: string;
}

const WEIGHT_MIN = 0;
const WEIGHT_MAX = 100;
const NAME_MAX_LENGTH = 255;
const NAME_INPUT_ID = 'objetivo-nombre';

const LABEL_STYLE: React.CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: 1,
	fontWeight: typography.weight.semibold,
	color: colors.neutral.text
};

const SUBTITLE_STYLE: React.CSSProperties = {
	display: 'block',
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: typography.lineHeight[14],
	fontWeight: typography.weight.regular,
	color: colors.neutral.textMuted
};

const REQUIRED_STYLE: React.CSSProperties = { ...LABEL_STYLE, color: colors.semantic.error };

const ERROR_STYLE: React.CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	color: colors.semantic.error
};

const toOptions = (items: INamed[]): Array<{ key: string; text: string }> =>
	items.map((item) => ({ key: String(item.Id), text: item.Nombre ?? '' }));

const toKey = (value: string | string[]): string => (Array.isArray(value) ? value[0] : value);

const findLookup = (items: INamed[], key: string): ILookupValue | undefined => {
	const found = items.filter((item) => String(item.Id) === key)[0];
	return found ? { Id: found.Id as number, Title: found.Nombre ?? '' } : undefined;
};

const toEnumValue = <T extends string>(values: T[], key: string): T | undefined => values.filter((value) => value === key)[0];

const parseWeight = (value: string): number | undefined => {
	const weight = Number(value);
	return value.trim() === '' || !isFinite(weight) ? undefined : weight;
};

export const ObjetivoFormBody: React.FC<IObjetivoFormBodyProps> = ({ vps, departamentos, gerencias, palancas, initialPalancaId, objetivo, panel, onSave, onCancel }) => {
	const isEdit = objetivo !== undefined;
	const initialPalanca = objetivo?.Palanca?.Id ?? palancas.filter((palanca) => palanca.Id === initialPalancaId && palanca.Activa === true)[0]?.Id;

	const [vpId, setVpId] = React.useState<string>(objetivo?.VP ? String(objetivo.VP.Id) : '');
	const [departamentoId, setDepartamentoId] = React.useState<string>(objetivo?.Departamento ? String(objetivo.Departamento.Id) : '');
	const [gerenciaId, setGerenciaId] = React.useState<string>(objetivo?.Gerencia ? String(objetivo.Gerencia.Id) : '');
	const [nombre, setNombre] = React.useState<string>(objetivo?.Nombre ?? '');
	const [descripcion, setDescripcion] = React.useState<string>(objetivo?.Descripcion ?? '');
	const [estado, setEstado] = React.useState<Estado>(objetivo?.Estado ?? Estado.NoIniciada);
	const [palancaId, setPalancaId] = React.useState<string>(initialPalanca === undefined ? '' : String(initialPalanca));
	const [duracion, setDuracion] = React.useState<Duracion | ''>(objetivo?.Duracion ?? '');
	const [peso, setPeso] = React.useState<string>(objetivo?.Peso === undefined ? '' : String(objetivo.Peso));
	const [esDeVp, setEsDeVp] = React.useState<boolean>(objetivo?.EsDeVp === true);
	const [fechaInicio, setFechaInicio] = React.useState<string>(toDateInput(objetivo?.FechaInicio));
	const [fechaCompromiso, setFechaCompromiso] = React.useState<string>(toDateInput(objetivo?.FechaCompromiso));
	const [submitted, setSubmitted] = React.useState<boolean>(false);
	const [isSaving, setIsSaving] = React.useState<boolean>(false);
	const [saveFailed, setSaveFailed] = React.useState<boolean>(false);

	const selectedVp = vps.filter((vp) => String(vp.Id) === vpId)[0];
	const isRrii = isVpRrii(selectedVp?.Nombre);

	const vpOptions = toOptions(vps.filter((vp) => vp.Activo === true || String(vp.Id) === vpId));
	const departamentoOptions = toOptions(departamentos);
	const gerenciaOptions = toOptions(gerencias.filter((gerencia) => String(gerencia.Departamento?.Id) === departamentoId));
	const palancaOptions = toOptions(palancas.filter((palanca) => palanca.Activa === true || String(palanca.Id) === palancaId));
	const duracionOptions = Object.values(Duracion).map((value) => ({ key: value, text: value }));
	const estadoOptions = Object.values(Estado).map((value) => ({ key: value, text: value }));

	const pesoValue = parseWeight(peso);
	const weightIssue = peso.trim() === ''
		? strings.RequiredField
		: pesoValue === undefined || pesoValue < WEIGHT_MIN || pesoValue > WEIGHT_MAX ? strings.ObjetivoWeightRange : undefined;
	const commitmentIssue = fechaCompromiso === ''
		? strings.RequiredField
		: fechaInicio !== '' && fechaCompromiso < fechaInicio ? strings.ObjetivoDateOrder : undefined;

	const issues = {
		vp: vpId === '' ? strings.RequiredField : undefined,
		departamento: departamentoId === '' ? strings.RequiredField : undefined,
		gerencia: gerenciaId === '' ? strings.RequiredField : undefined,
		nombre: nombre.trim() === '' ? strings.RequiredField : undefined,
		descripcion: descripcion.trim() === '' ? strings.RequiredField : undefined,
		palanca: isRrii && palancaId === '' ? strings.RequiredField : undefined,
		duracion: isRrii && duracion === '' ? strings.RequiredField : undefined,
		peso: isRrii ? weightIssue : undefined,
		fechaInicio: isRrii && fechaInicio === '' ? strings.RequiredField : undefined,
		fechaCompromiso: isRrii ? commitmentIssue : undefined
	};
	const hasIssues = Object.values(issues).some((issue) => issue !== undefined);
	const shown = (issue: string | undefined): string | undefined => (submitted ? issue : undefined);

	const title = isEdit
		? Utils.replaceAll(strings.ObjetivoFormEditTitle, '{0}', formatObjetivoId(objetivo?.Id))
		: strings.ObjetivoFormNewTitle;

	const onDepartamentoChange = (value: string | string[]): void => {
		setDepartamentoId(toKey(value));
		setGerenciaId('');
	};

	const save = async (): Promise<void> => {
		setSubmitted(true);
		if (hasIssues) {
			return;
		}
		const toSave = new Objetivo();
		toSave.Id = objetivo?.Id;
		toSave.Nombre = nombre.trim();
		toSave.Descripcion = descripcion.trim();
		toSave.VP = findLookup(vps, vpId);
		toSave.Departamento = findLookup(departamentos, departamentoId);
		toSave.Gerencia = findLookup(gerencias, gerenciaId);
		toSave.Estado = estado;
		toSave.EsDeVp = esDeVp;
		if (isRrii) {
			toSave.Palanca = findLookup(palancas, palancaId);
			toSave.Duracion = duracion === '' ? undefined : duracion;
			toSave.Peso = pesoValue;
			toSave.FechaInicio = fromDateInput(fechaInicio);
			toSave.FechaCompromiso = fromDateInput(fechaCompromiso);
		}
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

	const gridClass = panel ? styles.gridPanel : styles.grid;
	const renderSection = (sectionTitle: string, children: React.ReactNode): React.ReactNode => panel
		? <SectionBand title={sectionTitle}>{children}</SectionBand>
		: <Surface variant="outline" padding="comfortable" header={sectionTitle}>{children}</Surface>;
	const renderGeneral = (children: React.ReactNode): React.ReactNode => panel
		? children
		: <Surface variant="outline" padding="comfortable" header={strings.ObjetivoFormGeneralSection}>{children}</Surface>;

	const content = (
		<>
			{renderGeneral((
				<div className={styles.section} style={{ gap: spacing.lg }}>
					<div className={gridClass} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
						<Dropdown
							label={strings.ObjetivoFormVp}
							required
							placeholder={strings.ObjetivoFormSelect}
							options={vpOptions}
							value={vpId}
							disabled={isEdit}
							errorMessage={shown(issues.vp)}
							onChange={(value) => setVpId(toKey(value))}
						/>
						<Dropdown
							label={strings.ObjetivoFormDepartment}
							required
							placeholder={strings.ObjetivoFormSelect}
							options={departamentoOptions}
							value={departamentoId}
							errorMessage={shown(issues.departamento)}
							onChange={onDepartamentoChange}
						/>
						<Dropdown
							label={strings.ObjetivoFormManagement}
							required
							placeholder={strings.ObjetivoFormSelect}
							options={gerenciaOptions}
							value={gerenciaId}
							errorMessage={shown(issues.gerencia)}
							onChange={(value) => setGerenciaId(toKey(value))}
						/>
						<Switch
							label={strings.ObjetivoFormVpObjective}
							labelPosition="top"
							textOff
							active={esDeVp}
							onChange={setEsDeVp}
						/>
					</div>
					<div className={styles.nameField} style={{ gap: spacing.xs }}>
						<div className={styles.nameLabel} style={{ gap: spacing.xs }}>
							<label htmlFor={NAME_INPUT_ID} style={LABEL_STYLE}>{strings.ObjetivoFormName}</label>
							<span style={REQUIRED_STYLE}>*</span>
							<NombreAyuda />
						</div>
						<Input
							id={NAME_INPUT_ID}
							required
							maxLength={NAME_MAX_LENGTH}
							placeholder={strings.ObjetivoFormNamePlaceholder}
							value={nombre}
							errorMessage={shown(issues.nombre)}
							onChange={(event) => setNombre(event.target.value)}
						/>
					</div>
					<Multiline
						className={styles.multiline}
						label={strings.ObjetivoFormDescription}
						required
						placeholder={strings.ObjetivoFormDescriptionPlaceholder}
						value={descripcion}
						errorMessage={shown(issues.descripcion)}
						onChange={(event) => setDescripcion(event.target.value)}
					/>
					<div className={gridClass} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
						<Dropdown
							label={strings.ObjetivoFormStatus}
							required
							options={estadoOptions}
							value={estado}
							onChange={(value) => setEstado(toEnumValue(Object.values(Estado), toKey(value)) ?? estado)}
						/>
					</div>
				</div>
			))}
			{isRrii && renderSection(strings.ObjetivoFormPlanningSection, (
				<div className={styles.section} style={{ gap: spacing.lg }}>
					<div className={gridClass} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
						<Dropdown
							label={strings.ObjetivoFormLever}
							required
							placeholder={strings.ObjetivoFormSelect}
							options={palancaOptions}
							value={palancaId}
							errorMessage={shown(issues.palanca)}
							onChange={(value) => setPalancaId(toKey(value))}
						/>
						<Dropdown
							label={strings.ObjetivoFormDuration}
							required
							placeholder={strings.ObjetivoFormSelect}
							options={duracionOptions}
							value={duracion}
							errorMessage={shown(issues.duracion)}
							onChange={(value) => setDuracion(toEnumValue(Object.values(Duracion), toKey(value)) ?? '')}
						/>
						<SpinButton
							className={styles.weight}
							label={strings.ObjetivoFormWeight}
							placeholder={strings.ObjetivoFormWeightPlaceholder}
							required
							min={WEIGHT_MIN}
							max={WEIGHT_MAX}
							value={peso}
							errorMessage={shown(issues.peso)}
							onChange={(event) => setPeso(event.target.value)}
						/>
					</div>
					<div className={panel ? styles.gridPair : styles.grid} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
						<div className={styles.field} style={{ gap: spacing.xs }}>
							<Picker
								mode="date"
								label={strings.ObjetivoFormStartDate}
								required
								value={fechaInicio}
								onChange={setFechaInicio}
							/>
							{shown(issues.fechaInicio) && <span role="alert" style={ERROR_STYLE}>{issues.fechaInicio}</span>}
						</div>
						<div className={styles.field} style={{ gap: spacing.xs }}>
							<Picker
								mode="date"
								label={strings.ObjetivoFormCommitmentDate}
								required
								value={fechaCompromiso}
								onChange={setFechaCompromiso}
							/>
							{shown(issues.fechaCompromiso) && <span role="alert" style={ERROR_STYLE}>{issues.fechaCompromiso}</span>}
						</div>
					</div>
				</div>
			))}
			{saveFailed && <MessageBar type="error" message={strings.ObjetivoSaveError} />}
		</>
	);

	if (panel) {
		// El Panel del Design System tipa title como string, pero Fluent renderiza cualquier nodo en el encabezado.
		const newTitle = (
			<>
				{strings.ObjetivoNew}
				<span style={SUBTITLE_STYLE}>{strings.ObjetivoFormSubtitle}</span>
			</>
		) as unknown as string;
		return (
			<Panel
				open
				className={styles.panel}
				title={isEdit ? title : newTitle}
				onClose={onCancel}
				primaryAction={<Button variant="secondary" onClick={onCancel}>{strings.Cancel}</Button>}
				secondaryAction={<Button variant="primary" disabled={isSaving} onClick={save}>{strings.Save}</Button>}
			>
				<div className={styles.panelContent} style={{ gap: spacing.lg, paddingRight: spacing.lg }}>
					{content}
				</div>
			</Panel>
		);
	}

	return (
		<div className={styles.form} style={{ gap: spacing.lg }}>
			<div className={styles.header} style={{ gap: spacing.md }}>
				<Button variant="secondary" size="small" iconLeft={<FigmaIcon name="arrowCircle" />} onClick={onCancel}>
					{strings.Back}
				</Button>
				<h1 style={PAGE_TITLE_STYLE}>{title}</h1>
			</div>
			{content}
			<div className={styles.footer} style={{ gap: spacing.lg }}>
				<Button variant="secondary" onClick={onCancel}>
					{strings.Cancel}
				</Button>
				<Button variant="primary" disabled={isSaving} onClick={save}>
					{strings.Save}
				</Button>
			</div>
		</div>
	);
};

const ObjetivoForm: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const objetivoId = Number(id);
	const isEdit = id !== undefined;
	const isValidId = Number.isInteger(objetivoId) && objetivoId > 0;
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const masters = useObjetivoFormMasters();
	const [objetivoState, , addItem, editItem, , getById] = useObjetivoDataSource();
	const [objetivoError, setObjetivoError] = React.useState<LoadError | undefined>(undefined);

	React.useEffect(() => {
		setObjetivoError(undefined);
		if (!isEdit) {
			return;
		}
		if (!isValidId) {
			setObjetivoError('notFound');
			return;
		}
		getById(objetivoId).catch((error: unknown) => setObjetivoError(isNotFoundError(error) ? 'notFound' : 'error'));
	}, [objetivoId]);

	const initialPalancaId = Number(searchParams.get(PALANCA_QUERY_PARAM));
	const cancelPath = isEdit && isValidId ? getObjetivoPath(objetivoId) : PALANCAS_PATH;

	const save = async (toSave: Objetivo): Promise<void> => {
		if (isEdit) {
			await editItem(toSave);
			navigate(getObjetivoPath(objetivoId), { state: { toast: Utils.replaceAll(strings.ObjetivoUpdated, '{0}', toSave.Nombre ?? '') } });
			return;
		}
		const created = await addItem(toSave);
		navigate(getObjetivoPath(created.Id as number), { state: { toast: Utils.replaceAll(strings.ObjetivoCreated, '{0}', toSave.Nombre ?? '') } });
	};

	const objetivo = isEdit && objetivoState.item?.Id === objetivoId ? objetivoState.item : undefined;

	if (objetivoError === 'notFound') {
		return <MessageBar type="error" message={strings.ObjetivoNotFound} />;
	}
	if (objetivoError === 'error') {
		return <MessageBar type="error" message={strings.ObjetivoLoadError} />;
	}
	if (masters.error) {
		return <MessageBar type="error" message={strings.ObjetivoFormLoadError} />;
	}
	if (!masters.ready || (isEdit && !objetivo)) {
		return <Spinner />;
	}

	return (
		<div style={{ padding: spacing.xl }}>
			<ObjetivoFormBody
				key={objetivoId}
				vps={masters.vps}
				departamentos={masters.departamentos}
				gerencias={masters.gerencias}
				palancas={masters.palancas}
				initialPalancaId={initialPalancaId > 0 ? initialPalancaId : undefined}
				objetivo={objetivo}
				onSave={save}
				onCancel={() => navigate(cancelPath)}
			/>
		</div>
	);
};

export default ObjetivoForm;
