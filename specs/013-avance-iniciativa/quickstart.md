# Quickstart: validar el avance por interpolación

## Prerrequisitos

- Rama `013-avance-iniciativa`, dependencias instaladas.
- Autorización para editar resultados clave en las listas del sitio de **desarrollo** (no productivo).

## 1. Compilación

```bash
npm run build
```

Esperado: lint y build sin errores.

## 2. Workbench

```bash
npm start
```

Abrir el workbench hospedado del sitio de desarrollo con el webpart `objetivosVp`.

## 3. Escenarios

Con una iniciativa de un objetivo de la VP RRII que tenga **un solo** resultado clave con mínimo 8, meta 10 y máximo 12, cargar el valor actual desde "Seguimiento del resultado clave" y mirar el avance del encabezado del detalle de la iniciativa y la columna Avance de la bandeja. Ver la tabla de verdad en [contracts/calculo-avance.md](./contracts/calculo-avance.md).

| Valor actual | Avance esperado | Color | Cumplim. en la tabla | Estado |
|---|---|---|---|---|
| (vacío) | 0 % | rojo | — | Sin dato |
| 7 | 0 % | rojo | 58 % | No cumple |
| 8 | 60 % | amarillo | 67 % | Mínimo |
| 9 | 70 % | amarillo | 75 % | Mínimo |
| 10 | 80 % | verde | 83 % | Meta |
| 11 | 90 % | verde | 92 % | Meta |
| 12 | 100 % | verde | 100 % | Máximo |
| 15 | 100 % | verde | 125 % | Máximo |

Escenarios adicionales:

1. Iniciativa con dos resultados clave que aportan 90 % y 100 %: avance 95 %, verde (spec, historia 1, escenario 8).
2. Iniciativa con un resultado clave en 15 y otro en 7 (mismos umbrales): avance 50 %, rojo (escenario 9).
3. Objetivo con iniciativas de 95 % y 70 % más una cancelada: avance 83 % en la bandeja de objetivos, el detalle del objetivo y la palanca (historia 2).
4. Ninguna pantalla muestra un dato nuevo de avance proyectado y la tabla de resultados clave no cambia de columnas (FR-010, SC-004).

## 4. Al terminar

Restaurar los valores originales de los resultados clave usados en la prueba.
