import * as React from 'react';

import { Button, Dropdown, Input, Multiline, SpinButton, Switch } from '../../../../../core/ui/components';
import { MessageBar, Panel, Picker } from '../../../../../core/ui/patterns';
import { colors, spacing, typography } from '../../../../../core/ui/foundations';
import { Departamento, Gerencia, Objetivo, Palanca, Vicepresidencia } from '../../../../../core/entities';
import { Duracion, Estado } from '../../../../../core/utils/Constants';
import { ILookupValue } from '../../../../../core/utils/Mappers';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { buildPanelTitle } from '../../shared/panelTitle';
import SectionBand from '../../shared/SectionBand/SectionBand';
import { formatObjetivoId, fromDateInput, isVpRrii, toDateInput } from '../objetivoUtils';
import NombreAyuda from './NombreAyuda/NombreAyuda';
import styles from './ObjetivoForm.module.scss';

export interface IObjetivoFormBodyProps {
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
const NAME_INPUT_ID = 'objetivo-nombre';

const LABEL_STYLE: React.CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: 1,
	fontWeight: typography.weight.semibold,
	color: colors.neutral.text
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

export const ObjetivoFormBody: React.FC<IObjetivoFormBodyProps> = ({ vps, departamentos, gerencias, palancas, initialPalancaId, objetivo, onSave, onCancel }) => {
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

	const title = buildPanelTitle(
		isEdit ? Utils.replaceAll(strings.ObjetivoFormEditTitle, '{0}', formatObjetivoId(objetivo?.Id)) : strings.ObjetivoNew,
		isEdit ? objetivo?.Nombre : strings.ObjetivoFormSubtitle
	);

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

	const renderSection = (sectionTitle: string, children: React.ReactNode): React.ReactNode => (
		<SectionBand title={sectionTitle}>{children}</SectionBand>
	);

	const content = (
		<>
			{(
				<div className={styles.section} style={{ gap: spacing.lg }}>
					<div className={styles.gridPanel} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
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
					<div className={styles.gridPanel} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
						<Dropdown
							label={strings.ObjetivoFormStatus}
							required
							options={estadoOptions}
							value={estado}
							onChange={(value) => setEstado(toEnumValue(Object.values(Estado), toKey(value)) ?? estado)}
						/>
					</div>
				</div>
			)}
			{isRrii && renderSection(strings.ObjetivoFormPlanningSection, (
				<div className={styles.section} style={{ gap: spacing.lg }}>
					<div className={styles.gridPanel} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
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
					<div className={styles.gridPair} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
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

	return (
		<Panel
			open
			className={styles.panel}
			title={title}
			onClose={onCancel}
			primaryAction={<Button variant="secondary" onClick={onCancel}>{strings.Cancel}</Button>}
			secondaryAction={<Button variant="primary" disabled={isSaving} onClick={save}>{isEdit ? strings.SaveChanges : strings.Save}</Button>}
		>
			<div className={styles.panelContent} style={{ gap: spacing.lg, paddingRight: spacing.lg }}>
				{content}
			</div>
		</Panel>
	);
};
