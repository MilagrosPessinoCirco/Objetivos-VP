# Research: Avance de la iniciativa por interpolación

No quedaron puntos "NEEDS CLARIFICATION" en el contexto técnico. Las decisiones de negocio las confirmó el usuario antes de la spec.

## R1 · Fuente de la regla

- **Decision**: interpolación lineal por tramos de las columnas T ("% Cumplimiento") y U ("% Cumplimiento proyectado") del Excel `Seguimiento Objetivos MKT.xlsx`, con tope de 100 % en el aporte.
- **Rationale**: es la fórmula que describe el mail del usuario de la VP RRII. El mismo mail pide limitar el cumplimiento individual al 100 % antes de consolidar, y el usuario lo confirmó.
- **Alternatives considered**:
  - Escalones fijos (0/60/80/100): el usuario lo propuso primero y después lo descartó a favor de la interpolación.
  - `mín(valor ÷ máximo, 100 %)`, como la hoja "Avance Iniciativas" del Excel y la regla vigente de la 006: es la que se reemplaza.

Fórmula de la columna T (para un valor R y los umbrales O, P y Q):

```text
SI(R < O; 0; SI(R < P; 0,6 + (R − O) / (P − O) × 0,2; SI(R < Q; 0,8 + (R − P) / (Q − P) × 0,2; R / Q)))
```

La aplicación reemplaza la última rama, `R / Q`, por 100 %.

## R2 · Pesos de los resultados clave

- **Decision**: partes iguales (RF-08 sin cambios).
- **Rationale**: lo confirmó el usuario. El Excel también usa partes iguales (1/3 por resultado clave en la columna "Peso Res Clave").
- **Alternatives considered**: peso cargado por resultado clave, como menciona el mail. Requeriría una columna nueva y cambios en el formulario; queda registrado en "2.3 No incluye" de la spec funcional.

## R3 · Avance proyectado

- **Decision**: se calcula para la iniciativa y el objetivo, pero no se muestra.
- **Rationale**: la spec funcional (§5) pide calcular real y proyectado, y el prototipo v5 muestra un solo dato "Avance". Lo confirmó el usuario.
- **Alternatives considered**: mostrarlo en el detalle de la iniciativa o del objetivo, que se desvía del prototipo.

## R4 · Precisión numérica

- **Decision**: el aporte interpolado se normaliza con `normalizeAvance` (6 decimales), como el resto de los cálculos de `resultadoClaveUtils.ts`, y el redondeo a entero queda solo para mostrar (`formatAvance`).
- **Rationale**: evita que un valor como 0,8 + 0,1 (fracciones binarias) produzca un 89,99999… que se colorea distinto de 90. Reutiliza el mecanismo existente sin dependencias nuevas.
- **Alternatives considered**: una librería decimal (descartada: no hay una en el proyecto y no hace falta).
