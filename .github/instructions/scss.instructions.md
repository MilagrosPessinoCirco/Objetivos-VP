---
description: Crear o modificar estilos SCSS reutilizables, encapsulados y compatibles con la tematización existente.
applyTo: "**/*.scss"
---

# SCSS

## Estructura y reutilización

- Respetá la estructura y la metodología SCSS existentes.
- Reutilizá variables, mixins, tokens de tema y estilos compartidos.
- No hardcodees colores hexadecimales cuando exista una variable o token aplicable.
- Evitá repetir tamaños, espaciados, tipografías, bordes y otros valores visuales comunes.
- Centralizá únicamente los estilos verdaderamente compartidos.
- Mantené los estilos específicos cerca de su componente.

## Selectores y encapsulamiento

- Evitá selectores excesivamente profundos.
- Evitá especificidad innecesaria.
- Evitá `!important` salvo justificación.
- Evitá estilos globales cuando puedan encapsularse.

## Tematización y artefactos

- Respetá el mecanismo de tematización de SPFx y las librerías instaladas.
- No crees un nuevo sistema de diseño si el proyecto ya posee uno.
- Tratá los tipados generados a partir de archivos `.module.scss` como artefactos de compilación: no los edites a mano ni los versiones si el repositorio los ignora.
