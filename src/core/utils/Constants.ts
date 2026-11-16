//Cambiar AZURE_URL en base a donde se coloque la url de la azure function publicada, lista de configuración, archivo de configuración, variable de entorno etc...
export const AZURE_URL:string = 'http://localhost:7071'; //Solo a modo de ejemplo

export const AZURE_ERROR:string = 'AzureError';
export const AZURE_API:string = 'api';

export const EMAIL_SUBJECT:string = 'Nuevo Item Creado';
export const EMAIL_BODY:string = 'Se ha creado un nuevo item con el siguiente detalle:\n\nID: {Id}\nTítulo: {Titulo}';

export enum Lista {
	Palanca = "Palanca",
	Vicepresidencia = "Vicepresidencia",
	Departamento = "Departamento",
	Gerencia = "Gerencia",
	Area = "Area",
	Objetivo = "Objetivo",
	Usuario = "Usuario",
	Iniciativa = "Iniciativa",
	ComentarioIniciativa = "Comentario iniciativa",
	ResultadoClave = "Resultado clave",
	Tarea = "Tarea",
	AvanceTarea = "Avance tarea",
	Riesgo = "Riesgo",
	PresupuestoTarea = "Presupuesto tarea",
	Decision = "Decision",
	ComentarioResultadoClave = "Comentario resultado clave"
}

export enum Duracion {
	Anual = "Anual",
	Plurianual = "Plurianual",
	Permanente = "Permanente"
}

export enum Estado {
	NoIniciada = "No iniciada",
	EnCurso = "En curso",
	FinalizadoCumplido = "Finalizado cumplido",
	FinalizadoIncumplido = "Finalizado incumplido"
}

export enum Rol {
	Administrador = "Administrador",
	CargadorObjetivo = "Cargador objetivo",
	Usuario = "Usuario",
	Visualizador = "Visualizador"
}

export enum EstadoIniciativa {
	NoIniciada = "No iniciada",
	EnCurso = "En curso",
	Frenada = "Frenada",
	Finalizada = "Finalizada",
	Cancelada = "Cancelada"
}

export enum TipoMedicion {
	Cantidad = "Cantidad",
	Porcentaje = "Porcentaje",
	Moneda = "Moneda",
	Indicador = "Indicador"
}

export enum Prioridad {
	Alta = "Alta",
	Media = "Media",
	Baja = "Baja"
}

export enum EstadoTarea {
	NoIniciada = "No iniciada",
	EnCurso = "En curso",
	Frenada = "Frenada",
	Finalizada = "Finalizada",
	Cancelada = "Cancelada"
}

export enum EstadoRiesgo {
	Activo = "Activo",
	Escalado = "Escalado",
	Resuelto = "Resuelto"
}

export const VP_RRII_NOMBRE: string = 'VP RRII';
