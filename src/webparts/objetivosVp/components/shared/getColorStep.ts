import { colorScales } from '../../../../core/ui/foundations';
import type { IColorScaleStep } from '../../../../core/ui/foundations';

export const getColorStep = (group: string, scale: string): IColorScaleStep => {
	const step = colorScales
		.filter((colorGroup) => colorGroup.name === group)
		.reduce<IColorScaleStep[]>((steps, colorGroup) => steps.concat(colorGroup.steps), [])
		.filter((colorStep) => colorStep.scale === scale)[0];

	if (!step) {
		throw new Error(`No se encontró el paso de color "${scale}" del grupo "${group}" en colorScales.`);
	}

	return step;
};
