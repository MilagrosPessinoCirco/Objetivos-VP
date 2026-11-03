//Cambiar AZURE_URL en base a donde se coloque la url de la azure function publicada, lista de configuración, archivo de configuración, variable de entorno etc...
export const AZURE_URL:string = 'http://localhost:7071'; //Solo a modo de ejemplo

export const AZURE_ERROR:string = 'AzureError';
export const AZURE_API:string = 'api';

export const EMAIL_SUBJECT:string = 'Nuevo Item Creado';
export const EMAIL_BODY:string = 'Se ha creado un nuevo item con el siguiente detalle:\n\nID: {Id}\nTítulo: {Titulo}';