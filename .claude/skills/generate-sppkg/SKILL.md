---
name: generate-sppkg
description: "Genera localmente el archivo .sppkg de producción de un proyecto SPFx para su despliegue manual mediante App Catalog. Usar cuando el programador solicite generar el sppkg, preparar el paquete para catálogo, ir por catálogo o realizar un despliegue manual por catálogo. Esta skill solamente genera el paquete; nunca lo sube ni lo despliega."
---

# Generar paquete SPPKG

Generar el archivo `.sppkg` de producción correspondiente al proyecto SPFx actual.

Esta skill solamente prepara el paquete local. No debe conectarse, subir archivos ni desplegar soluciones en ningún App Catalog o tenant de SharePoint.

## Ejecución

Ubicarse en la raíz del proyecto y ejecutar el script mediante un proceso de PowerShell con `ExecutionPolicy Bypass`.

Preferir `pwsh` cuando esté disponible:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File ".claude/skills/generate-sppkg/scripts/generate-sppkg.ps1"
```

Si `pwsh` no está disponible, utilizar:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".claude/skills/generate-sppkg/scripts/generate-sppkg.ps1"
```

Si ninguno de los dos ejecutables está disponible, detenerse e informar el error.

No ejecutar manualmente los comandos de Gulp o Heft. El script es la fuente de verdad del proceso.

## Comportamiento

El script debe:

- Detectar automáticamente si el proyecto utiliza Gulp o Heft.
- Detenerse si encuentra señales contradictorias de ambos toolchains.
- Ejecutar `npm ci` únicamente cuando no exista `node_modules`.
- Obtener la ubicación del paquete desde `config/package-solution.json`.
- Eliminar exclusivamente el `.sppkg` anterior definido por esa configuración.
- No modificar la versión de la solución.
- No modificar código fuente ni configuración funcional.
- Guardar la salida detallada de los comandos en un archivo de log temporal.
- Mostrar en la terminal solamente las etapas, los errores y el resultado final.

### Proyectos Gulp

Ejecutar exactamente:

```text
gulp clean
gulp bundle --ship
gulp package-solution --ship
```

### Proyectos Heft

Ejecutar `heft clean` cuando el comando esté disponible y luego:

```text
npx heft build --production
npx heft package-solution --production
```

## Validación

Solo declarar el proceso exitoso cuando:

- Se haya creado un `.sppkg` nuevo.
- El archivo no esté vacío.
- Pueda abrirse como paquete ZIP.
- Contenga `AppManifest.xml`.

Si ocurre un error, eliminar cualquier `.sppkg` parcial, detener el proceso e informar:

- Etapa que falló.
- Último comando ejecutado.
- Error recibido.
- Ruta del log completo.

## Respuesta

Devolver únicamente el informe compacto emitido por el script.

No reproducir la salida completa de Gulp, Heft o `npm ci`, salvo que el programador solicite expresamente revisar el log.

No afirmar que el paquete fue desplegado. La salida de esta skill es solamente un archivo local preparado para su posterior carga manual en el App Catalog.
