---
description: Crear o modificar componentes y hooks React respetando accesibilidad y la arquitectura existente.
applyTo: "**/*.tsx,src/**/hooks/**/*.ts,src/**/use*.ts"
---

# React

## Versión y librerías

- Respetá la versión real de React y las librerías de UI instaladas.
- Utilizá componentes funcionales y hooks cuando sean compatibles con la versión y las convenciones del proyecto.

## Composición y estructura

- Creá componentes pequeños, cohesivos y con responsabilidades claras.
- Reutilizá componentes, hooks, tipos y patrones existentes.
- Evitá componentes monolíticos.
- Aplicá composición y principios de Atomic Design solamente cuando sean compatibles con la arquitectura existente y aporten valor.
- No impongas Atomic Design, carpetas, niveles ni componentes artificiales por encima de la estructura existente.

## Estado y efectos

- Minimizá el uso de `useEffect`.
- Utilizá `useEffect` únicamente para sincronización con sistemas externos o efectos reales.
- No utilices `useEffect` para calcular estado derivado que pueda resolverse durante el renderizado o mediante eventos.
- Evitá estados duplicados o derivados innecesariamente.
- No introduzcas memoización, hooks personalizados ni abstracciones sin una necesidad demostrable.

## Contratos y accesibilidad

- Mantené contratos de propiedades claros.
- Favorecé la accesibilidad mediante etiquetas, roles y navegación por teclado.
