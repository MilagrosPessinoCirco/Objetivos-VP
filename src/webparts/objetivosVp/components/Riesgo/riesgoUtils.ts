import type { ChipColor } from '../../../../core/ui/patterns';
import { RiesgoRegla } from '../../../../core/api/Riesgo/riesgoReglas';
import { EstadoRiesgo } from '../../../../core/utils/Constants';
import * as strings from 'ObjetivosVpWebPartStrings';

const RIESGO_ID_PREFIX = 'RSK-';
const ID_MIN_DIGITS = 2;

export const formatRiesgoId = (id: number | undefined): string =>
	id === undefined ? '' : `${RIESGO_ID_PREFIX}${String(id).padStart(ID_MIN_DIGITS, '0')}`;

export const getEstadoRiesgoChipColor = (estado: EstadoRiesgo | undefined): ChipColor => {
	switch (estado) {
		case EstadoRiesgo.Activo:
			return 'warning';
		case EstadoRiesgo.Escalado:
			return 'danger';
		case EstadoRiesgo.Resuelto:
			return 'success';
		default:
			return 'neutral';
	}
};

export const getEstadoRiesgoLabel = (estado: EstadoRiesgo | undefined): string => {
	switch (estado) {
		case EstadoRiesgo.Activo:
			return strings.RiesgoStateActive;
		case EstadoRiesgo.Escalado:
			return strings.RiesgoStateEscalated;
		case EstadoRiesgo.Resuelto:
			return strings.RiesgoStateResolved;
		default:
			return '';
	}
};

export const getRiesgoRuleMessage = (regla: RiesgoRegla): string => {
	switch (regla) {
		case RiesgoRegla.DescripcionRequerida:
		case RiesgoRegla.DecisionRequerida:
		case RiesgoRegla.FechaLimiteRequerida:
			return strings.RequiredField;
		case RiesgoRegla.FechaLimiteAnterior:
			return strings.RiesgoDueDatePast;
		default:
			return strings.RiesgoRuleError;
	}
};
