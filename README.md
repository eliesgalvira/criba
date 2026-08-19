# Criba

> Proyecto cerrado y archivado (agosto de 2026). Fue el prototipo de una propuesta de mini-beca; la web sigue desplegada en [mihura.elies.site](https://mihura.elies.site/). El mes becado tomó otra dirección: software maleable y vivo, programación de objetos y LLMs. Se construyó asistido por IA y verificado a mano.

Minador de programas por superposiciones, sobre un runtime del **Interaction Calculus** de Victor
Taelin, y una web de divulgación que lo enseña en vivo.

Le das ejemplos entrada→salida (`f(1)=2, f(5)=10`) y **criba** el espacio de todos los programas
hasta quedarse con el mínimo que los cumple. El resultado es correcto por construcción respecto a
tus ejemplos, sin modelo, sin entrenamiento y sin alucinación, solo búsqueda con sharing óptimo.

## Los nombres

| Nombre         | Qué es                                   | Por qué                                                                                                                                                                                                                                               |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Criba**      | El proyecto y el minador                 | Cribar es lo que hace un minador: tamizar la grava para encontrar oro. Cada ejemplo entrada→salida es una malla que deja caer familias enteras de programas de golpe. Evoca la criba de Eratóstenes: búsqueda por eliminación con pedigrí matemático. |
| **Copenhague** | El motor clásico (`copenhague()`)        | Como la interpretación de Copenhague, colapsa primero y observa después, convirtiendo el árbol superpuesto en un stream de programas concretos que prueba universo a universo.                                                                        |
| **Everett**    | El motor superpuesto (`everett()`)       | Many-worlds: evalúa todos los universos a la vez, las ramas comparten estructura, las etiquetas mantienen cada mundo autoconsistente, y un ejemplo que falla poda mundos enteros de golpe.                                                            |
| **Peanito**    | El mini-lenguaje Nat→Nat que se mina     | Sus constructores son los axiomas de Peano en miniatura (cero, sucesor, match sobre predecesor, recursión). El diminutivo dice honestamente "lenguaje diminuto a propósito".                                                                          |
| **Telar**      | El runtime del Interaction Calculus (TS) | Un telar teje y recombina hilos, que es literalmente lo que hace la reducción con los cables de una interaction net. El telar de Jacquard fue la primera máquina programable. Teje la web: el fondo vivo del sitio corre sobre él.                    |

El sistema completo: **el Telar teje el espacio de todos los programas Peanito; Criba lo tamiza, con
Copenhague universo a universo y con Everett todos a la vez.**

Regla de uso: estos nombres identifican la implementación (repo, docs, demos). El copy de la web de
divulgación no se apoya en ellos salvo cuando sea relevante; el título público quedó en «Computar es
tejer · prototipo».

## Qué hay

- **`src/`**: el núcleo, TypeScript estricto sin dependencias, 30 tests:
  - `peanito.ts`: el DSL: términos, intérprete iterativo con fuel escalado, `fits`.
  - `criba.ts`: enumeración (etiquetada y sin etiquetar), colapso perezoso, Copenhague y Everett
    (con presupuesto de pasos, progreso y eventos de criba), `spaceAtDepth` (la recurrencia del
    tamaño del espacio, contrastada por test contra el conteo real).
  - `telar.ts`: runtime IC tipado (whnf/normal con contador de interacciones), la demo de fusión
    (`not^(2^N)` en O(N)) y el corredor clásico como **máquina de Krivine** (misma cuenta de betas
    que la sustitución textual, sin reventar la pila, verificado por test (`3·2^N`)).
  - `explain.ts` / `trace.ts`: las vistas pedagógicas del programa encontrado: bucle sin recursión,
    traza paso a paso, casos aplanados, pattern matching.
- **`web/`**: la página (React 19 + Base UI, bundle con Deno, sin servidor): el minador con las
  orillas de hilos, pestañas de reglas, cuatro vistas del programa, el telar en modal, la carrera
  clásico-contra-telar con contadores reales, ES/EN, panel de honestidad.
- **`lab/spike-ic.js`**: el spike de viabilidad original (2026-08-08): el evaluador IC portado del
  [gist de referencia de Taelin][ic-gist] computa `not^(2^1000)` en 12.004 interacciones / ~5 ms y
  resuelve SAT con booleanos superpuestos (n≤14, verificado contra fuerza bruta). Ya portado y
  tipado como `src/telar.ts`; se conserva como registro.
- Antecedente directo: **kolmo**, mini-minador en Python (dos motores, minimalidad verificada
  exhaustivamente) construido como ejercicio de aprendizaje del mecanismo.
- `PRODUCT.md` / `DESIGN.md` / `PLAN.md`: registro de producto, sistema de diseño («El Telar») y el
  plan del mes.

## Los límites, medidos

El espacio de programas se eleva al cuadrado con cada nivel de profundidad: 59k programas a
profundidad 3, **3,5×10⁹** a 4, **1,2×10¹⁹** a 5, **1,5×10³⁸** a 6. La web criba hasta **profundidad
5** con presupuesto de 50M de pasos porque ahí está el punto dulce medido: todo lo expresable de la
familia de reglas de las pestañas aparece en ≤5 (mod3, la más honda, en 222 ms); subir a 6
multiplica el coste ~30× (10 s) sin encontrar nada nuevo, y mod4 necesitaría profundidad 7, fuera
del alcance de un navegador. La perla: refutar n² (imposible en Peanito) contra los 10³⁸ programas
de profundidad 6 cuesta 486k pasos, la superposición compartiendo trabajo a través de 38 órdenes de
magnitud. El colapsador perezoso por cola de prioridad (el mecanismo de SupGen, que cambiaría el
tope de profundidad por presupuesto de paciencia) quedó apuntado en `PLAN.md` y sin construir: el
mes becado cambió de foco antes de empezarlo.

## Correr en local

```sh
deno task test    # los 30 tests del núcleo
deno task check   # tipos (src/ y web/app/)
deno task web     # bundle + servidor estático en :4508
```

Hosting: Vercel (`vercel.json` instala Deno y construye el bundle); CI en GitHub Actions verifica
tipos + tests + bundle en cada push.

## Fuentes primarias

- [Interaction Calculus (spec + impl. de referencia)](https://github.com/VictorTaelin/Interaction-Calculus)
- [Gist: IC mínimo en Haskell][ic-gist]
- [Gist: Accelerating Discrete Program Search with SUP Nodes](https://gist.github.com/VictorTaelin/7fe49a99ebca42e5721aa1a3bb32e278)
- [Lafont, _Interaction Combinators_ (1997)](https://www.sciencedirect.com/science/article/pii/S0890540197926432)
- [Asperti, _About the efficient reduction of lambda terms_](https://arxiv.org/abs/1701.04240)

[ic-gist]: https://gist.github.com/VictorTaelin/d3da31e6b8913aea1cf16e0b372ac830
