---
description: Crear o modificar código TypeScript con tipado seguro, constantes, precisión numérica y manejo de errores.
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript

## Configuración y tipado

- Respetá `tsconfig.json`, su `target`, sus bibliotecas y sus opciones. No generes sintaxis ni utilices APIs incompatibles con esa configuración.
- Evitá `any`.
- Preferí tipos concretos o `unknown` con el estrechamiento correspondiente.
- Evitá la sobreingeniería mediante tipos, genéricos o abstracciones desproporcionados para casos simples.
- Reutilizá los tipos, interfaces y contratos existentes siempre que representen correctamente el dominio y el caso de uso.

## Constantes y literales

- Buscá variables y constantes existentes antes de crear nuevas.
- Reutilizá una constante solamente si representa el mismo concepto, no solo el mismo valor.
- Evitá números, textos y demás literales mágicos.
- Mantené las constantes locales cerca de su uso.
- Mantené las constantes de dominio dentro de su módulo.
- Reservá `src/core/utils/Constants.ts` para constantes verdaderamente transversales.
- Creá `src/core/utils/Constants.ts` y su ruta únicamente cuando sea necesaria una constante transversal y no exista una ubicación equivalente.
- Centralizá estados, leyendas y correspondencias reutilizables mediante constantes, mapas tipados, enumeraciones o la estructura tipada apropiada.

## Nomenclatura

- Para código nuevo, usá:
  - `camelCase` para variables, funciones, métodos y propiedades.
  - `PascalCase` para componentes, clases, tipos, interfaces y enumeraciones.
  - `UPPER_SNAKE_CASE` para constantes compartidas e inmutables.
  - `snake_case` solamente para contratos externos que lo requieran.
- Respetá la convención existente cuando difiera de las anteriores y esté aplicada de forma consistente. Estas convenciones no habilitan renombrar identificadores ya existentes ni traducirlos.

## Precisión numérica

- Mitigá los errores de precisión de IEEE 754 cuando trabajes con valores decimales que requieran exactitud, como importes, cantidades o porcentajes.
- Utilizá la estrategia adecuada al dominio y compatible con el proyecto, como una librería decimal ya existente, unidades enteras mínimas o redondeo explícito en límites definidos.
- Evitá comparaciones estrictas entre resultados de operaciones de punto flotante.
- Advertí cuando una operación pueda sufrir pérdida de precisión y explicá la estrategia aplicada.
- No introduzcas una dependencia nueva para resolver la precisión sin autorización.

## Errores y logging

- No ocultes errores mediante bloques `try/catch` vacíos, falsos resultados exitosos, conversiones inseguras ni desactivaciones indiscriminadas de reglas de lint.
- Utilizá el mecanismo de logging existente en el proyecto.
- Si no existe uno aplicable, registrá con `console.error` solamente los errores significativos que requieran diagnóstico.
- Escribí mensajes de error claros y accionables, que indiquen qué operación falló y aporten contexto técnico no sensible. Evitá mensajes genéricos.
- No registres el mismo error en múltiples capas, ni los errores esperados del flujo normal, ni secretos, tokens, datos personales o payloads sensibles.
- Conservá el error original o su stack cuando sea seguro y útil para el diagnóstico.
- No utilices comentarios para justificar código confuso cuando el diseño o los nombres puedan expresar la intención con claridad.
