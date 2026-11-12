import * as React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button, Dropdown, Input, Multiline, SpinButton, Switch } from '../../../../../core/ui/components';
import { MessageBar, Picker, Spinner, Surface } from '../../../../../core/ui/patterns';
import { FigmaIcon, colors, spacing, typography } from '../../../../../core/ui/foundations';
import useDepartamentoDataSource from '../../../../../core/api/Departamento/useDepartamentoDataSource';
import useGerenciaDataSource from '../../../../../core/api/Gerencia/useGerenciaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import usePalancaDataSource from '../../../../../core/api/Palanca/usePalancaDataSource';
import useVicepresidenciaDataSource from '../../../../../core/api/Vicepresidencia/useVicepresidenciaDataSource';
import { Departamento, Gerencia, Objetivo, Palanca, Vicepresidencia } from '../../../../../core/entities';
import { Duracion, Estado } from '../../../../../core/utils/Constants';
import { ILookupValue } from '../../../../../core/utils/Mappers';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { PALANCAS_PATH, PALANCA_QUERY_PARAM, getObjetivoPath } from '../../ObjetivosVp/routes';
import { PAGE_TITLE_STYLE } from '../../shared/pageTitleStyle';
import { formatObjetivoId, fromDateInput, isNotFoundError, isVpRrii, toDateInput } from '../objetivoUtils';
import NombreAyuda from './NombreAyuda/NombreAyuda';
import styles from './ObjetivoForm.module.scss';

type LoadError = 'notFound' | 'error';

interface IObjetivoFormBodyProps {
	vps: Vicepresidencia[];
	departamentos: Departamento[];
	gerencias: Gerencia[];
	palancas: Palanca[];
	initialPalancaId?: number;
	objetivo?: Objetivo;
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

const ObjetivoFormBody: React.FC<IObjetivoFormBodyProps> = ({ vps, departamentos, gerencias, palancas, initialPalancaId, objetivo, onSave, onCancel }) => {
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
		if (isRrii) {
			toSave.Palanca = findLookup(palancas, palancaId);
			toSave.Duracion = duracion === '' ? undefined : duracion;
			toSave.Peso = pesoValue;
			toSave.EsDeVp = esDeVp;
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

	return (
		<div className={styles.form} style={{ gap: spacing.lg }}>
			<div className={styles.header} style={{ gap: spacing.md }}>
				<Button variant="secondary" size="small" iconLeft={<FigmaIcon name="arrowCircle" />} onClick={onCancel}>
					{strings.Back}
				</Button>
				<h1 style={PAGE_TITLE_STYLE}>{title}</h1>
			</div>
			<Surface variant="outline" padding="comfortable" header={strings.ObjetivoFormGeneralSection}>
				<div className={styles.section} style={{ gap: spacing.lg }}>
					<div className={styles.grid} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
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
					</div>
					<div className={styles.nameRow} style={{ gap: spacing.xs }}>
						<div className={styles.grow}>
							<Input
								label={strings.ObjetivoFormName}
								required
								maxLength={NAME_MAX_LENGTH}
								placeholder={strings.ObjetivoFormNamePlaceholder}
								value={nombre}
								errorMessage={shown(issues.nombre)}
								onChange={(event) => setNombre(event.target.value)}
							/>
						</div>
						<NombreAyuda />
					</div>
					<Multiline
						label={strings.ObjetivoFormDescription}
						required
						placeholder={strings.ObjetivoFormDescriptionPlaceholder}
						value={descripcion}
						errorMessage={shown(issues.descripcion)}
						onChange={(event) => setDescripcion(event.target.value)}
					/>
					<div className={styles.grid} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
						<Dropdown
							label={strings.ObjetivoFormStatus}
							required
							options={estadoOptions}
							value={estado}
							onChange={(value) => setEstado(toEnumValue(Object.values(Estado), toKey(value)) ?? estado)}
						/>
					</div>
				</div>
			</Surface>
			{isRrii && (
				<Surface variant="outline" padding="comfortable" header={strings.ObjetivoFormPlanningSection}>
					<div className={styles.section} style={{ gap: spacing.lg }}>
						<div className={styles.grid} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
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
								label={strings.ObjetivoFormWeight}
								required
								min={WEIGHT_MIN}
								max={WEIGHT_MAX}
								value={peso}
								errorMessage={shown(issues.peso)}
								onChange={(event) => setPeso(event.target.value)}
							/>
						</div>
						<div className={styles.grid} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
							<Switch
								label={strings.ObjetivoFormVpObjective}
								labelPosition="top"
								active={esDeVp}
								onChange={setEsDeVp}
							/>
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
				</Surface>
			)}
			{saveFailed && <MessageBar type="error" message={strings.ObjetivoSaveError} />}
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
	const [vpState, getVps] = useVicepresidenciaDataSource();
	const [departamentoState, getDepartamentos] = useDepartamentoDataSource();
	const [gerenciaState, getGerencias] = useGerenciaDataSource();
	const [palancaState, getPalancas] = usePalancaDataSource();
	const [objetivoState, , addItem, editItem, , getById] = useObjetivoDataSource();
	const [mastersReady, setMastersReady] = React.useState<boolean>(false);
	const [objetivoError, setObjetivoError] = React.useState<LoadError | undefined>(undefined);

	React.useEffect(() => {
		setObjetivoError(undefined);
		Promise.all([getVps(), getDepartamentos(), getGerencias(), getPalancas()]).then(() => setMastersReady(true));
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
	const hasMastersError = vpState.error || departamentoState.error || gerenciaState.error || palancaState.error;

	if (objetivoError === 'notFound') {
		return <MessageBar type="error" message={strings.ObjetivoNotFound} />;
	}
	if (objetivoError === 'error') {
		return <MessageBar type="error" message={strings.ObjetivoLoadError} />;
	}
	if (hasMastersError) {
		return <MessageBar type="error" message={strings.ObjetivoFormLoadError} />;
	}
	if (!mastersReady || (isEdit && !objetivo)) {
		return <Spinner />;
	}

	return (
		<div style={{ padding: spacing.xl }}>
			<ObjetivoFormBody
				key={objetivoId}
				vps={vpState.items}
				departamentos={departamentoState.items}
				gerencias={gerenciaState.items}
				palancas={palancaState.items}
				initialPalancaId={initialPalancaId > 0 ? initialPalancaId : undefined}
				objetivo={objetivo}
				onSave={save}
				onCancel={() => navigate(cancelPath)}
			/>
		</div>
	);
};

export default ObjetivoForm;
