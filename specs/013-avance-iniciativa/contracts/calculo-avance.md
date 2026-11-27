# Contrato: cálculo de avance (`resultadoClaveUtils.ts`)

Módulo: `src/webparts/objetivosVp/components/Iniciativa/resultadoClaveUtils.ts`. Todas las funciones son puras y devuelven porcentajes sin redondear entre 0 y 100.

## Exportadas que no cambian de firma

| Función | Firma | Cambio de comportamiento |
|---|---|---|
| `getAvanceIniciativa` | `(resultados: ResultadoClave[]) => number` | El aporte de cada resultado clave pasa a ser el de FR-001 con `ValorActual`. |
| `getAvanceObjetivo` | `(objetivoId: number \| undefined, iniciativas: Iniciativa[], resultados: ResultadoClave[]) => number` | Ninguno propio; cambia porque usa el avance real de la iniciativa. |
| `getCumplimiento` | `(resultado: ResultadoClave) => number` | Ninguno. Sigue siendo valor actual ÷ máximo y ya no lo usa el avance. |
| `getEstadoResultadoClave` | `(resultado: ResultadoClave) => EstadoResultadoClave` | Ninguno. |

## Exportadas nuevas

| Función | Firma | Comportamiento |
|---|---|---|
| `getAvanceIniciativaProyectado` | `(resultados: ResultadoClave[]) => number` | Como `getAvanceIniciativa`, con `ValorProyectado`. |
| `getAvanceObjetivoProyectado` | `(objetivoId: number \| undefined, iniciativas: Iniciativa[], resultados: ResultadoClave[]) => number` | Como `getAvanceObjetivo`, con el avance proyectado de cada iniciativa. |

## Tabla de verdad del aporte (mínimo 8, meta 10, máximo 12)

| Valor | Aporte |
|---|---|
| sin valor | 0 |
| 7 | 0 |
| 8 | 60 |
| 9 | 70 |
| 10 | 80 |
| 11 | 90 |
| 12 | 100 |
| 15 | 100 |

Umbrales iguales: con mínimo = meta = 10 y máximo 12, el valor 10 aporta 80; con meta = máximo = 12, el valor 12 aporta 100.
