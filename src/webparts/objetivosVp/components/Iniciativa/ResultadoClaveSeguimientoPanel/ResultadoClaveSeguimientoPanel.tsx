import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Input, Multiline } from '../../../../../core/ui/components';
import { MessageBar, Panel } from '../../../../../core/ui/patterns';
import { colors, spacing, typography } from '../../../../../core/ui/foundations';
import useComentarioResultadoClaveDataSource from '../../../../../core/api/ComentarioResultadoClave/useComentarioResultadoClaveDataSource';
import useComentariosResultadoClave from '../../../../../core/api/ComentarioResultadoClave/useComentariosResultadoClave';
import useResultadoClaveDataSource from '../../../../../core/api/ResultadoClave/useResultadoClaveDataSource';
import { ComentarioResultadoClave, ResultadoClave } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import Field from '../../shared/Field/Field';
import { buildPanelTitle } from '../../shared/panelTitle';
import { formatDate } from '../../Objetivo/objetivoUtils';
import {
	RESULTADO_CLAVE_MAX_LENGTH,
	formatResultadoClaveId,
	formatResultadoClaveNumero,
	getLengthIssue,
	parseNumero
} from '../resultadoClaveUtils';
import styles from '../IniciativaForm/IniciativaForm.module.scss';

export interface IResultadoClaveSeguimientoPanelProps {
	resultado: ResultadoClave;
	onSaved: (resultado: ResultadoClave) => void;
	onCancel: () => void;
}

interface ISeguimientoIssues {
	actual?: string;
	proyectado?: string;
	fuente?: string;
	evidencia?: string;
	comentario?: string;
}

const VALUE_SEPARATOR = ' · ';
const NUMBER_STEP = 'any';

const LAST_COMMENT_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	color: colors.neutral.textMuted
};

const numeroToText = (valor: number | null | undefined): string => (valor === undefined || valor === null ? '' : String(valor));

const getNumeroIssue = (texto: string, required: boolean): string | undefined => {
	if (texto.trim() === '') {
		return required ? strings.RequiredField : undefined;
	}
	return parseNumero(texto) === undefined ? strings.ResultadoClaveNotNumber : undefined;
};

const getEvidenciaIssue = (texto: string): string | undefined => {
	const valor = texto.trim();
	if (valor === '') {
		return undefined;
	}
	if (Utils.validateAndSanitizeUrl(valor) === '') {
		return strings.ResultadoClaveInvalidLink;
	}
	return getLengthIssue(valor, RESULTADO_CLAVE_MAX_LENGTH.evidencia);
};

const ResultadoClaveSeguimientoPanel: React.FC<IResultadoClaveSeguimientoPanelProps> = ({ resultado, onSaved, onCancel }) => {
	const [, , addComentario] = useComentarioResultadoClaveDataSource();
	const [, , , editResultado] = useResultadoClaveDataSource();
	const comentarios = useComentariosResultadoClave(resultado.Id);
	const ultimo: ComentarioResultadoClave | undefined = comentarios.items[0];

	const [actual, setActual] = React.useState<string>(numeroToText(resultado.ValorActual));
	const [proyectado, setProyectado] = React.useState<string>(numeroToText(resultado.ValorProyectado));
	const [fuente, setFuente] = React.useState<string>(resultado.Fuente ?? '');
	const [evidencia, setEvidencia] = React.useState<string>(resultado.Evidencia?.Url ?? '');
	const [comentarioEditado, setComentarioEditado] = React.useState<string | undefined>(undefined);
	const [comentarioRegistrado, setComentarioRegistrado] = React.useState<string | undefined>(undefined);
	const [submitted, setSubmitted] = React.useState<boolean>(false);
	const [isSaving, setIsSaving] = React.useState<boolean>(false);
	const [saveFailed, setSaveFailed] = React.useState<boolean>(false);

	const ultimoTexto = ultimo?.Comentario ?? '';
	const comentario = comentarioEditado ?? ultimoTexto;
	const yaRegistrado = comentarioRegistrado ?? ultimoTexto.trim();

	const issues: ISeguimientoIssues = {
		actual: getNumeroIssue(actual, false),
		proyectado: getNumeroIssue(proyectado, true),
		fuente: getLengthIssue(fuente, RESULTADO_CLAVE_MAX_LENGTH.fuente),
		evidencia: getEvidenciaIssue(evidencia),
		comentario: getLengthIssue(comentario, RESULTADO_CLAVE_MAX_LENGTH.comentario)
	};
	const hasIssues = Object.values(issues).some((issue) => issue !== undefined);
	const shown = (issue: string | undefined): string | undefined => (submitted ? issue : undefined);
	const invalid = (issue: string | undefined, extra?: string): string | undefined =>
		[shown(issue) ? styles.invalid : undefined, extra].filter(Boolean).join(' ') || undefined;

	const title = buildPanelTitle(strings.ResultadoClaveTrackPanelTitle, `${formatResultadoClaveId(resultado.Id)}${VALUE_SEPARATOR}${resultado.Nombre ?? ''}`);
	const unidadTipo = `${resultado.UnidadMedida ?? ''}${VALUE_SEPARATOR}${resultado.TipoMedicion ?? ''}`;
	const rango = [resultado.Minimo, resultado.Meta, resultado.Maximo].map(formatResultadoClaveNumero).join(VALUE_SEPARATOR);
	const ultimoMeta = ultimo
		? Utils.replaceAll(Utils.replaceAll(strings.ResultadoClaveLastComment, '{0}', formatDate(ultimo.Created)), '{1}', ultimo.Author?.Title ?? '')
		: undefined;

	const save = async (): Promise<void> => {
		setSubmitted(true);
		if (hasIssues) {
			return;
		}
		setIsSaving(true);
		setSaveFailed(false);
		try {
			const texto = comentario.trim();
			if (texto !== '' && texto !== yaRegistrado) {
				const nuevo = new ComentarioResultadoClave();
				nuevo.ResultadoClave = { Id: resultado.Id as number, Title: resultado.Nombre ?? '' };
				nuevo.Comentario = texto;
				await addComentario(nuevo);
				setComentarioRegistrado(texto);
			}
			const evidenciaUrl = evidencia.trim() === '' ? '' : Utils.validateAndSanitizeUrl(evidencia.trim());
			const seguimiento = Object.assign(new ResultadoClave(), {
				Id: resultado.Id,
				ValorActual: actual.trim() === '' ? null : parseNumero(actual),
				ValorProyectado: parseNumero(proyectado),
				Fuente: fuente.trim() === '' ? null : fuente.trim(),
				Evidencia: evidenciaUrl === '' ? null : { Url: evidenciaUrl, Description: '' }
			});
			await editResultado(seguimiento);
			onSaved(Object.assign(new ResultadoClave(), resultado, seguimiento));
		}
		catch {
			setSaveFailed(true);
			setIsSaving(false);
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
				<Button variant="primary" disabled={isSaving} onClick={save}>
					{strings.Save}
				</Button>
			}
		>
			<div className={styles.panelContent} style={{ gap: spacing.lg, paddingRight: spacing.lg }}>
				<div className={styles.gridPair} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
					<Field label={strings.ResultadoClaveTrackUnitType} value={unidadTipo} />
					<Field label={strings.ResultadoClaveTrackRange} value={rango} />
				</div>
				<div className={styles.gridPair} style={{ columnGap: spacing.lg, rowGap: spacing.md }}>
					<Input
						type="number"
						step={NUMBER_STEP}
						label={strings.ResultadoClaveFieldCurrent}
						value={actual}
						className={invalid(issues.actual)}
						errorMessage={shown(issues.actual)}
						onChange={(event) => setActual(event.target.value)}
					/>
					<Input
						type="number"
						step={NUMBER_STEP}
						label={strings.ResultadoClaveFieldProjected}
						required
						value={proyectado}
						className={invalid(issues.proyectado)}
						errorMessage={shown(issues.proyectado)}
						onChange={(event) => setProyectado(event.target.value)}
					/>
				</div>
				<Input
					label={strings.ResultadoClaveFieldSource}
					placeholder={strings.ResultadoClaveFieldSourcePlaceholder}
					value={fuente}
					className={invalid(issues.fuente)}
					errorMessage={shown(issues.fuente)}
					onChange={(event) => setFuente(event.target.value)}
				/>
				<Input
					type="url"
					label={strings.ResultadoClaveFieldEvidence}
					placeholder={strings.ResultadoClaveFieldEvidencePlaceholder}
					value={evidencia}
					className={invalid(issues.evidencia)}
					errorMessage={shown(issues.evidencia)}
					onChange={(event) => setEvidencia(event.target.value)}
				/>
				<div className={styles.field} style={{ gap: spacing.xs }}>
					<Multiline
						label={strings.ResultadoClaveFieldComment}
						placeholder={strings.ResultadoClaveFieldCommentPlaceholder}
						value={comentario}
						disabled={comentarios.isLoading}
						className={invalid(issues.comentario, styles.multiline)}
						errorMessage={shown(issues.comentario)}
						onChange={(event) => setComentarioEditado(event.target.value)}
					/>
					{ultimoMeta && <span style={LAST_COMMENT_STYLE}>{ultimoMeta}</span>}
				</div>
				{saveFailed && <MessageBar type="error" message={strings.ResultadoClaveSaveError} />}
			</div>
		</Panel>
	);
};

export default ResultadoClaveSeguimientoPanel;
