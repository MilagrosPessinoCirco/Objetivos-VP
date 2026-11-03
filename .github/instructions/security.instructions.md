---
description: Crear o modificar código aplicando los controles de AppScan, sanitización y navegación segura.
applyTo: "src/**/*.ts,src/**/*.tsx"
---

# Seguridad

## Cumplimiento y hallazgos

- Aplicá los controles concretos de seguridad que estén documentados en el proyecto para satisfacer el criterio global de cumplimiento de AppScan.
- Revisá los reportes, configuraciones, mitigaciones y patrones de seguridad existentes que sean relevantes antes de modificar un flujo alcanzado por AppScan.
- No inventes reglas específicas de AppScan cuando el repositorio no contenga el lineamiento o el reporte correspondiente. Informá esa limitación y mantené AppScan como validación externa obligatoria del deploy.
- No eludas, ocultes, silencies ni suprimas un hallazgo mediante desactivaciones, excepciones amplias o cambios que reduzcan la seguridad. Si parece ser un falso positivo, documentá la evidencia y solicitá confirmación antes de introducir una excepción.

## Entradas y contenido

- Validá y sanitizá las entradas no confiables en los límites del sistema mediante los mecanismos existentes y de acuerdo con el contexto de uso.
- No introduzcas `eval`, `new Function`, URLs con esquemas ejecutables ni inyección insegura de HTML.
- Evitá `dangerouslySetInnerHTML`. Si un requerimiento confirmado lo vuelve imprescindible, sanitizá el contenido mediante el mecanismo de sanitización ya presente en el proyecto, limitá su alcance y justificá técnicamente la decisión. No agregues una librería de sanitización nueva ni la configures por fuera de la utilidad centralizada.

## Navegación y URLs

- La utilidad centralizada de navegación del proyecto es la clase `Utils`, definida en `src/core/utils/Utils.ts` como `export default` y reexportada desde `src/core/utils/index.ts`.
- Utilizá esa utilidad para toda apertura o navegación programática:
  - `Utils.openInNewTab(url)` para abrir un nuevo contexto de navegación.
  - `Utils.openInSelfTab(url)` para reemplazar la ubicación actual.
  - `Utils.validateAndSanitizeUrl(url)` cuando necesites validar o sanitizar una URL sin navegar.
- Antes de importarla, verificá la ruta, la forma de exportación y los contratos reales de la clase, y respetá la convención de imports del repositorio. Si la utilidad o alguno de esos métodos no existe o difiere del contrato esperado, detenete y solicitá confirmación; no crees una implementación paralela.
- No utilices `window.open`, `window.location.assign`, `window.location.replace`, `history.pushState`, `location.reload` ni la creación manual de anclas para navegar desde componentes, hooks o servicios. Tampoco implementes lógica paralela de apertura, validación o sanitización de URLs fuera de la utilidad centralizada.
- Tratá exclusivamente la implementación interna de `Utils.openInNewTab`, `Utils.openInSelfTab` y `Utils.reloadPageByUrlCurrent` como excepción autorizada a la regla anterior y a la regla de acceso directo al DOM definida en `.github/instructions/spfx.instructions.md`. Esa excepción no habilita el uso irrestricto de APIs del navegador en otros métodos de la clase `Utils`, ni debe copiarse o replicarse en componentes, hooks o servicios.
- `Utils.reloadPageByUrlCurrent(url)` cambia la URL y recarga la página sin pasar por la validación y la sanitización centralizadas. No lo utilices como alternativa a `Utils.openInNewTab` ni a `Utils.openInSelfTab` para abrir enlaces. Utilizalo solamente cuando un requerimiento funcional confirmado exija actualizar la URL y recargar la página, y únicamente con una URL previamente validada y sanitizada mediante `Utils.validateAndSanitizeUrl`. Informá el caso en lugar de modificar el método por iniciativa propia.
- Diferenciá la apertura o navegación de documentos y enlaces de la navegación interna de una SPA. Si el proyecto utiliza un router y la ruta está administrada por él, y no debe abrirse un nuevo contexto de navegación, utilizá la API de ese router en lugar de forzar una recarga completa. Verificá antes si el proyecto realmente incorpora un router; no lo presupongas.
- No modifiques ni eludas la validación y sanitización de URLs, la lista de dominios confiables, la validación de protocolos, puertos y path traversal, la configuración de la librería de sanitización ni la protección `noopener noreferrer` sin autorización explícita y un análisis de seguridad previo.
- Si la utilidad rechaza una URL o un dominio requerido, detenete e informá el caso. No amplíes la lista de dominios confiables ni omitas la sanitización por iniciativa propia.
- No refactorices automáticamente la clase `Utils`, sus contratos ni sus tipos durante una tarea no relacionada. La regla de reutilización y preservación del código existente prevalece mientras la implementación sea compatible y segura.
- Construí URLs y query strings con APIs o helpers seguros y compatibles con el proyecto, evitando concatenaciones ambiguas de datos no confiables.

## Registro

- Al registrar un fallo de seguridad, aplicá las reglas de logging definidas en `.github/instructions/typescript.instructions.md` y no incluyas la URL completa rechazada ni el payload que la originó.
