---
name: data-source
description: "Genera de forma estandarizada la capa de datos (entidad, clase datasource, interfaz y hooks use<Lista>DataSource/useItem<Lista>DataSource) que conecta el proyecto SPFx con una lista de SharePoint. Usar cuando el programador pida generar el datasource de una lista, crear la entidad y el CRUD de una lista SPO, o agregar los hooks de una lista nueva. No usar para mail, adjuntos, ni para tipos de columna fuera de la tabla de mapeo soportada (metadatos administrados/taxonomía, ubicación, imagen moderna, resultado de flujo)."
---

# Generar datasource de una lista SharePoint

Genera la entidad, la clase datasource, su interfaz y los hooks `use<Lista>DataSource`/
`useItem<Lista>DataSource` para una lista de SharePoint, reutilizando los artefactos compartidos ya
existentes en el proyecto (`BaseEntity`, `IDatasource` genérico, `useDatasource`/`useItemDatasource`
genéricos) y creando `src/core/utils/Mappers.ts` solo si todavía no existe.

Esta skill no crea, modifica ni elimina listas, columnas ni datos reales de SharePoint. Tampoco despliega
nada. Solo genera código TypeScript local y valida que compile.

## Datos obligatorios

Pedir estos datos de a uno por vez, en este orden. No inferir ni inventar internal names, ni asumir que
el display name coincide con el internal name sin que el programador lo confirme.

1. **Nombre literal de la lista.** Se reutiliza tal cual (sin singularizar, sin pluralizar, sin traducir)
   para la carpeta, la entidad, la clase datasource, la interfaz, los hooks y la clave del enum `Lista`.
   Límite de 30 caracteres, sin espacios, en PascalCase.
2. **Campos de la lista**, en formato tabla `InternalName | Tipo`:

   | InternalName | Tipo |
   | --- | --- |
   | Ejemplo | Una línea de texto |

   Tipos soportados en esta versión: Una línea de texto, Varias líneas, Número, Fecha y hora, Sí/No,
   Elección, Elección múltiple, Búsqueda, Búsqueda múltiple, Persona o grupo, Persona o grupo múltiple,
   Hipervínculo. Un tipo fuera de esta lista (metadatos administrados/taxonomía, ubicación, imagen
   moderna, resultado de flujo, calculado no mapeado) se informa y se deja fuera de la entidad; no se
   inventa un mapeo.

   No hace falta pedir `Created`, `Modified`, `Author` ni `Editor`: siempre se incluyen por defecto en el
   `select`/`expand` del datasource y como propiedades de la entidad.

3. **Validación de convención**: si un internal name tiene espacios, no está en PascalCase o supera los
   30 caracteres, informarlo por el chat antes de generar código. No corregirlo por cuenta propia.
4. **Métodos opcionales**: preguntar antes de generar si la lista necesita orden (¿qué campo, qué
   dirección?), filtro de activos (¿qué campo booleano cuenta como activo?), valores distintos de algún
   campo, o `getFilteredItems()`. Ninguno de estos se genera si el programador no lo pide explícitamente.
   Si se piden, agregarlos a mano en la interfaz y la clase generadas después de correr el script (el
   script de esta versión solo resuelve el CRUD estándar; ver "Comportamiento").

## Ejecución

1. Ubicarse en la raíz del proyecto.
2. Armar un archivo `datasource-spec.json` temporal con esta forma, a partir de las respuestas del
   programador:

   ```json
   {
     "lista": "Guardias",
     "campos": [
       { "internalName": "Origen", "tipo": "Una línea de texto" },
       { "internalName": "Estado", "tipo": "Elección", "opciones": ["Pendiente", "Aprobado"] }
     ]
   }
   ```

3. Detectar si está disponible `pwsh` o `powershell`.
4. Ejecutar una sola vez:

   ```powershell
   & ".\.github\skills\data-source\scripts\generate-datasource.ps1" `
       -SpecPath "<ruta al datasource-spec.json temporal>"
   ```

Si el terminal actual no es PowerShell, invocar el ejecutable disponible con `-NoProfile
-ExecutionPolicy Bypass -File` y el mismo parámetro `-SpecPath`.

No reproducir manualmente la generación de archivos, el registro en el barrel de entidades ni la
actualización del enum `Lista`. El script es la fuente de verdad de ese trabajo.

## Comportamiento

El script se encarga de todo el proceso:

- Valida el spec: internal names sin espacios, en PascalCase, de hasta 30 caracteres; tipos dentro de la
  tabla de mapeo soportada. Un tipo no soportado se omite y se informa, nunca se inventa.
- Crea `src/core/utils/Mappers.ts` (con `IPersonValue`, `ILookupValue`, `IUrlValue` y los helpers de
  mapeo tolerante/estricto para choice) solamente si ese archivo todavía no existe en el proyecto. Si ya
  existe, lo respeta y no lo reescribe.
- Genera `src/core/entities/<Lista>.ts`: hereda de `BaseEntity` (que ya aporta `Id`/`Titulo`), declara
  `Created`, `Modified`, `Author`, `Editor` como propiedades propias, y el resto de los campos del spec
  en PascalCase, sin inicializador.
- Registra la entidad en `src/core/entities/index.ts`, sin duplicar la línea si ya existe.
- Genera la carpeta `src/core/api/<Lista>/` con `<Lista>DataSource.ts`, `I<Lista>DataSource.ts`,
  `use<Lista>DataSource.ts` y `useItem<Lista>DataSource.ts`. La clase datasource implementa el CRUD
  estándar (`getItems`, `add`, `edit`, `delete`, `getById`) con `top(5000)` en las consultas de
  colección y `select`/`expand` que siempre incluyen `Created`, `Modified`, `Author`, `Editor` además de
  los campos del spec. Los hooks reutilizan `useDatasource` genérico existente (`src/core/api/
  useDatasource.ts`), sin duplicar el reducer.
- Actualiza `src/core/utils/Constants.ts` con la regla exacta del enum `Lista`:
  - si no existe el enum, lo crea con la única entrada de esta lista;
  - si ya existe una entrada para esta lista, informa por el chat que no es la primera vez que se genera
    y corrige el formato de esa entrada sin tocar las demás;
  - si el enum existe pero falta esta entrada, la agrega al final sin reordenar ni tocar las existentes.
- Corre `npm run lint` y `npx heft build --clean` (los scripts reales de este proyecto; no usa Gulp).
- Guarda la salida detallada de los comandos en un log temporal y muestra en la terminal solo etapas,
  avisos y el resultado final.
- Nunca hace rollback automático ni crea commits.

Campos con tipo `Elección`/`Elección múltiple`: el script genera la lectura/escritura contra un enum del
mismo nombre que el campo, pero no inventa las opciones. Hay que declarar ese enum a mano, con las
opciones reales de la lista, antes de compilar; el script lo informa como aviso en el reporte final.

Métodos opcionales (orden, activos, valores distintos, `getFilteredItems()`) no están automatizados en
esta versión: si el programador los pidió, hay que agregarlos a mano en `I<Lista>DataSource.ts` y
`<Lista>DataSource.ts` después de la ejecución, siguiendo la firma y el estilo del resto de la clase.

## Validación

Solo declarar el proceso exitoso cuando:

- Se crearon los 5 archivos de la lista (`entities/<Lista>.ts` y los 4 de `api/<Lista>/`).
- `src/core/entities/index.ts` incluye la nueva entidad.
- `src/core/utils/Constants.ts` tiene la entrada correcta en el enum `Lista`.
- `npm run lint` terminó sin errores.
- `npx heft build --clean` terminó sin errores.

Si algún campo de elección quedó pendiente de declarar su enum, o algún tipo de columna quedó fuera por
no estar soportado, esto no invalida el resultado, pero debe quedar explícito en la entrega.

## Errores

Si el script termina con error:

- No intentar un rollback automático.
- No realizar un commit.
- No continuar con pasos posteriores.
- Informar al programador la etapa, el último comando ejecutado, el error original y la ruta del log
  completo.
- No mostrar ni reformular un mensaje de éxito.
- Indicar que el programador puede restaurar el estado anterior mediante Git.

## Entrega

Al finalizar, devolver íntegramente el informe emitido por el script, distinguiendo:

- Lista generada.
- Archivos creados y archivos modificados (incluye `Mappers.ts` si se creó, el barrel de entidades y
  `Constants.ts`).
- Campos omitidos por tipo no soportado, si los hubo.
- Avisos (enums de choice pendientes de completar a mano, entradas de enum `Lista` corregidas, etc.).
- Validaciones ejecutadas (`npm run lint`, `npx heft build --clean`) y su resultado.
- Métodos opcionales pedidos por el programador que quedaron pendientes de agregar a mano.

Solo declarar `Datasource generado sin errores.` cuando lint y build hayan finalizado correctamente.
