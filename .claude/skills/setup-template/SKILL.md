---
name: setup-template
description: "Inicializa un template SPFx existente para un sitio nuevo: actualiza nombre y GUID de solución, genera una webpart React para SharePoint Online, elimina las webparts de ejemplo, incorpora navegación base, contexto de usuario, configuración de correo y estilos globales, y valida el resultado. Usar cuando el programador solicite hacer el setup inicial completo de un proyecto basado en este template."
---

# Setup de template SPFx

Ejecutar esta skill únicamente sobre un proyecto SPFx existente. No utilizarla para agregar una segunda webpart a un proyecto ya configurado ni para modificar una webpart existente.

## Datos obligatorios

Antes de ejecutar comandos, obtener estos tres datos:

1. **Nombre de la solución o sitio.** No asumir prefijos ni reutilizar nombres de ejemplos. Si falta, solicitarlo.
2. **Nombre de la webpart.** Debe representar el nombre base en PascalCase. Si falta, solicitarlo.
3. **URL del sitio de SharePoint.** Debe ser la URL absoluta `https` del sitio, sin query string. Si falta, solicitarla.

Solicitar solamente los datos que falten y hacerlo de a uno por vez, en ese orden. No iniciar el generador de Microsoft en modo interactivo.

No inventar, completar ni corregir la URL del sitio: usar exactamente la que indique el programador. No derivarla del nombre de la solución ni de ejemplos previos.

El script normaliza el nombre de solución para los destinos técnicos: convierte espacios y `_` en `-`, compacta guiones consecutivos y elimina guiones iniciales o finales. También evita duplicar el sufijo `WebPart` en el nombre de la webpart.

Desde la URL recibida, el script deriva el nombre del ambiente tomando el segmento posterior a la última `/` y arma la configuración de depuración `Manifests <ambiente>`.

## Ejecución obligatoria

1. Ubicarse en la raíz del proyecto.
2. Detectar si está disponible `pwsh` o `powershell`.
3. Ejecutar una sola vez:

```powershell
& ".\.github\skills\setup-template\scripts\setup-template.ps1" `
    -SolutionName "<nombre solicitado>" `
    -WebPartName "<nombre de webpart>" `
    -SiteUrl "<URL del sitio solicitada>"
```

Si el terminal actual no es PowerShell, invocar el ejecutable disponible con `-NoProfile -ExecutionPolicy Bypass -File` y los mismos parámetros.

No reproducir manualmente los reemplazos, la generación del GUID ni el scaffolding que realiza el script. Los scripts y assets de esta skill son la fuente de verdad.

## Comportamiento esperado

El script debe encargarse de todo el proceso:

- Validar el proyecto, las versiones detectadas y la compilación inicial.
- Instalar dependencias con `npm ci` solamente si falta `node_modules`.
- Obtener el nombre y el GUID anteriores desde la configuración real del proyecto.
- Aplicar un único GUID nuevo, en minúsculas, en todas las ubicaciones autorizadas.
- Reemplazar el nombre anterior solo en los archivos autorizados y respetar el casing de cada aparición.
- Generar la webpart mediante el generador oficial de Microsoft, en modo no interactivo, para React y SharePoint Online.
- Crear primero la nueva webpart y eliminar después únicamente `src/webparts/helloWorld` y `src/webparts/template`, si existen.
- Conservar cualquier otra webpart.
- Instalar `react-router-dom` compatible si falta; no actualizar automáticamente una versión incompatible.
- Aplicar el scaffolding estándar, los archivos de estilos administrados por esta skill y la configuración de correo.
- Agregar a `.vscode/launch.json` una única configuración `Manifests <ambiente>` construida con la URL recibida y el puerto y el esquema declarados en `config/serve.json`, conservando las configuraciones existentes y su formato.
- Ejecutar `lint` cuando exista y `build`; no ejecutar pruebas automatizadas.
- No crear commits ni exigir que el working tree esté limpio.

## Errores e inconsistencias

Si el script termina con error:

- No intentar un rollback automático.
- No realizar un commit.
- No continuar con pasos posteriores.
- Informar al programador la etapa, el comando, el error original y los archivos alcanzados por la ejecución.
- No mostrar ni reformular un mensaje de éxito.
- Indicar que el programador puede restaurar el estado anterior mediante Git.

No ampliar el alcance del reemplazo para resolver una inconsistencia. En particular, no reemplazar automáticamente nombres o GUID fuera de los archivos autorizados por el script.

## Entrega

Al finalizar correctamente, devolver íntegramente el informe emitido por el script. Debe distinguir:

- Nombre anterior, solicitado, normalizado, aplicado en minúsculas y aplicado en mayúsculas.
- Nombre solicitado y nombre aplicado de la webpart.
- GUID anterior y nuevo de la solución.
- GUID generado por Microsoft para la webpart.
- URL de sitio solicitada y aplicada, ambiente detectado, nombre de la configuración de depuración y URL de depuración resultante.
- Archivos creados, modificados y eliminados.
- Cantidades de reemplazos.
- Validaciones ejecutadas.
- Configuraciones funcionales pendientes de `Roles`, `ROLE_PRIORITY`, `URL sendEmail` y `API KEY sendEmail`.

Solo declarar `Setup del template finalizado sin errores.` cuando todas las validaciones hayan finalizado correctamente.
