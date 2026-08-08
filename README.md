# Criba

> ⚠️ SLOP WARNING: proyecto en construcción, asistido por IA, verificado a mano.

Minador de programas por superposiciones, sobre un runtime del **Interaction Calculus** de Victor
Taelin — y una web de divulgación que lo enseña en vivo.

Le das ejemplos entrada→salida (`f(1)=2, f(5)=8`) y **criba** el espacio de todos los programas
hasta quedarse con el mínimo que los cumple. Correcto por construcción respecto a tus ejemplos: no
hay modelo, no hay entrenamiento, no hay alucinación — hay búsqueda con sharing óptimo.

## Los nombres

| Nombre         | Qué es                                   | Por qué                                                                                                                                                                                                                                               |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Criba**      | El proyecto y el minador                 | Cribar es lo que hace un minador: tamizar la grava para encontrar oro. Cada ejemplo entrada→salida es una malla que deja caer familias enteras de programas de golpe. Evoca la criba de Eratóstenes: búsqueda por eliminación con pedigrí matemático. |
| **Copenhague** | El motor clásico (`search()`)            | Como la interpretación de Copenhague: colapsa primero y observa después — colapsa el árbol superpuesto en un stream de programas concretos y los prueba universo a universo.                                                                          |
| **Everett**    | El motor superpuesto (`sup_search()`)    | Many-worlds: evalúa todos los universos a la vez, las ramas comparten estructura, las etiquetas mantienen cada mundo autoconsistente, y un ejemplo que falla poda mundos enteros de golpe. Copenhague se rinde en profundidad 4; Everett llega a 7.   |
| **Peanito**    | El mini-lenguaje Nat→Nat que se mina     | Sus constructores son los axiomas de Peano en miniatura (cero, sucesor, match sobre predecesor, recursión). El diminutivo dice honestamente "lenguaje diminuto a propósito".                                                                          |
| **Telar**      | El runtime del Interaction Calculus (TS) | Un telar teje y recombina hilos — literalmente lo que hace la reducción con los cables de una interaction net. El telar de Jacquard fue la primera máquina programable. Teje la web: el fondo vivo del sitio corre sobre él.                          |

El sistema completo: **el Telar teje el espacio de todos los programas Peanito; Criba lo tamiza —
con Copenhague universo a universo, con Everett todos a la vez.**

Regla de uso: estos nombres identifican la implementación (repo, docs, demos). El copy de la web de
divulgación no se apoya en ellos salvo cuando sea relevante; el título público de la web está
pendiente de decisión.

## Estado

- `lab/spike-ic.js` — spike de viabilidad (2026-08-08), verificado: el evaluador IC portado del
  [gist de referencia de Taelin][ic-gist] computa `not^(2^1000)` en 12.004 interacciones / ~5 ms (el
  λ-cálculo naive muere en 2^16), y resuelve SAT con booleanos superpuestos (n≤14, verificado contra
  fuerza bruta). JavaScript plano; será portado a TypeScript tipado como `src/telar.ts`.
- Antecedente directo: [kolmo](../../Sandbox/kolmo) — mini-minador en Python (dos motores,
  minimalidad verificada exhaustivamente) construido como ejercicio de aprendizaje del mecanismo.
- Diseño de la web: pendiente (dirección: obra de arte viva sobre la estética de los interaction
  combinators — los diagramas _son_ la interfaz).

## Stack

- **Deno** (runtime, tests, fmt, lint, bundle). TypeScript estricto, cero dependencias en el núcleo:
  el código es el artefacto de divulgación y debe poder leerse de arriba abajo.
- Web estática: un HTML + el bundle. Sin servidores.

## Fuentes primarias

- [Interaction Calculus (spec + impl. de referencia)](https://github.com/VictorTaelin/Interaction-Calculus)
- [Gist: IC mínimo en Haskell][ic-gist]
- [Gist: Accelerating Discrete Program Search with SUP Nodes](https://gist.github.com/VictorTaelin/7fe49a99ebca42e5721aa1a3bb32e278)
- [Lafont, _Interaction Combinators_ (1997)](https://www.sciencedirect.com/science/article/pii/S0890540197926432)
- [Asperti, _About the efficient reduction of lambda terms_](https://arxiv.org/abs/1701.04240)

[ic-gist]: https://gist.github.com/VictorTaelin/d3da31e6b8913aea1cf16e0b372ac830
