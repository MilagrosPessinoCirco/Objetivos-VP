export interface IPersonValue {
	Id: number;
	Title: string;
	EMail: string;
}

export interface ILookupValue {
	Id: number;
	Title: string;
}

export interface IUrlValue {
	Url: string;
	Description: string;
}

export function toPersonValue(value: any): IPersonValue | undefined {
	if (value == null) {
		return undefined;
	}

	return {
		Id: value.Id,
		Title: value.Title ?? '',
		EMail: value.EMail ?? ''
	};
}

export function toPersonValueArray(value: any): IPersonValue[] | undefined {
	if (value == null) {
		return undefined;
	}

	const items = Array.isArray(value) ? value : (value.results ?? []);
	return items.map((item: any) => toPersonValue(item)).filter((item: IPersonValue | undefined): item is IPersonValue => item != null);
}

export function toPersonIds(values: IPersonValue[] | undefined): number[] | undefined {
	if (values == null) {
		return undefined;
	}

	return values.map(value => value.Id);
}

export function toLookupValue(value: any): ILookupValue | undefined {
	if (value == null) {
		return undefined;
	}

	return {
		Id: value.Id,
		Title: value.Title ?? ''
	};
}

export function toLookupValueArray(value: any): ILookupValue[] | undefined {
	if (value == null) {
		return undefined;
	}

	const items = Array.isArray(value) ? value : (value.results ?? []);
	return items.map((item: any) => toLookupValue(item)).filter((item: ILookupValue | undefined): item is ILookupValue => item != null);
}

export function toUrlValue(value: any): IUrlValue | undefined {
	if (value == null) {
		return undefined;
	}

	return {
		Url: value.Url ?? '',
		Description: value.Description ?? ''
	};
}

export function toDateValue(value: any): Date | null | undefined {
	if (value == null) {
		return value;
	}

	return new Date(value);
}

/**
 * Lectura tolerante: si el valor no coincide con ninguna opción del enum, avisa por consola
 * y devuelve undefined en vez de fallar.
 */
export function toChoiceValue<TEnum extends Record<string, string>>(
	enumObject: TEnum,
	value: any,
	fieldName: string
): TEnum[keyof TEnum] | undefined {
	if (value == null) {
		return undefined;
	}

	const validValues = Object.values(enumObject);
	if (!validValues.includes(value)) {
		console.warn(`[Mappers] Valor de choice fuera de las opciones esperadas en '${fieldName}': '${value}'.`);
		return undefined;
	}

	return value as TEnum[keyof TEnum];
}

export function toChoiceValueArray<TEnum extends Record<string, string>>(
	enumObject: TEnum,
	value: any,
	fieldName: string
): Array<TEnum[keyof TEnum]> | undefined {
	if (value == null) {
		return undefined;
	}

	const items: any[] = Array.isArray(value) ? value : (value.results ?? []);
	const validValues = Object.values(enumObject);

	return items.filter(item => {
		if (!validValues.includes(item)) {
			console.warn(`[Mappers] Valor de choice fuera de las opciones esperadas en '${fieldName}': '${item}'.`);
			return false;
		}
		return true;
	});
}

/**
 * Escritura estricta: si el valor no coincide con ninguna opción del enum, falla.
 * A diferencia de la lectura, un valor inválido en escritura no debe guardarse en SharePoint en silencio.
 */
export function assertChoiceValue<TEnum extends Record<string, string>>(
	enumObject: TEnum,
	value: any,
	fieldName: string
): TEnum[keyof TEnum] {
	const validValues = Object.values(enumObject);
	if (!validValues.includes(value)) {
		throw new Error(`Valor de choice inválido para '${fieldName}': '${value}'.`);
	}

	return value as TEnum[keyof TEnum];
}
