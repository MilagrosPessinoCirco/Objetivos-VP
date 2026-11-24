import * as React from 'react';

import { Button, Tooltip } from '../../../../../../core/ui/components';
import { FigmaIcon, colors, spacing, typography } from '../../../../../../core/ui/foundations';
import { Tarea } from '../../../../../../core/entities';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatDate } from '../../../Objetivo/objetivoUtils';
import { ICON_BUTTON_STYLE } from '../../../shared/iconButtonStyle';
import Field from '../../../shared/Field/Field';
import SectionBand from '../../../shared/SectionBand/SectionBand';

export interface ITareaComentarioProps {
	tarea: Tarea;
	onEdit?: () => void;
}

const EMPTY_STYLE: React.CSSProperties = {
	margin: 0,
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: typography.lineHeight[14],
	color: colors.neutral.textMuted
};

const TareaComentario: React.FC<ITareaComentarioProps> = ({ tarea, onEdit }) => {
	const editAction = onEdit && (
		<Tooltip content={strings.Edit}>
			<Button
				iconOnly
				variant="secondary"
				size="small"
				style={ICON_BUTTON_STYLE}
				iconLeft={<FigmaIcon name="editPrimary" />}
				aria-label={strings.Edit}
				onClick={onEdit}
			/>
		</Tooltip>
	);
	const meta = Utils.replaceAll(Utils.replaceAll(strings.IniciativaCommentMeta,
		'{0}', formatDate(tarea.ComentarioEjecutivoFecha)),
		'{1}', tarea.ComentarioEjecutivoAutor?.Title ?? '');

	return (
		<SectionBand title={strings.IniciativaCommentSection} action={editAction} collapsible defaultCollapsed>
			<div style={{ padding: `0 ${spacing.xs}` }}>
				{tarea.ComentarioEjecutivo
					? <Field label={meta} value={tarea.ComentarioEjecutivo} />
					: <p style={EMPTY_STYLE}>{strings.IniciativaCommentEmpty}</p>}
			</div>
		</SectionBand>
	);
};

export default TareaComentario;
