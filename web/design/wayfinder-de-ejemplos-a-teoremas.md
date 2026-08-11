# Wayfinder · «De ejemplos a teoremas»

Sección nueva de la web. Va justo antes de la etiqueta de honestidad, que hace de
cierre de todo. Cuatro estaciones; el lector llega sabiendo ya qué es el minador
(lo tocó en la portada) y sabiendo de sobra que el código de un LLM no trae
garantías: no se le explica nada de eso.

## Estación 1 · La grieta de los ejemplos

**La idea.** Los ejemplos son una especificación incompleta: dos ejemplos, muchos
programas. La honestidad va antes que la promesa grande.

**El interactivo (real, ya funciona hoy).** El caso `f(1)=2, f(5)=8`: el lector
lo escribe, sale el programa que no acaba en los pares con su fila honesta
(«solo prometió cumplir tus ejemplos»), añade `f(0)=1` y ve morir al programa
tramposo en directo. Cada ejemplo es una malla más fina. La lección 3→12 de
Kolmogorov vive aquí.

**Cómo funciona el minador por dentro** (explicación en llano, sin jerga de
implementación; borrador para pulir):

> El minador no prueba programas de uno en uno. Construye un solo árbol donde
> están todos los programas posibles del mini-lenguaje a la vez, con los trozos
> que comparten guardados una sola vez. Cada ejemplo se ejecuta una única vez
> sobre ese árbol entero, y donde el resultado no cuadra se poda la rama
> completa, llevándose de golpe a toda la familia de programas que dependía de
> ella. Lo que sobrevive a todos los ejemplos se desempaqueta, y de ahí se
> queda el más pequeño.

## Estación 2 · De ejemplos a teoremas

**La idea.** Una prueba es «un unit test sobre infinitos inputs» (Taelin). Esta
estación se hace bien o no se hace: es la que da nombre a la sección.

**La escalera**, tres peldaños del mismo concepto, cada uno con más alcance:

1. `f(1) = 2` — un caso. Garantiza un punto.
2. `f(x, y) = f(y, x)` probado sobre mil pares — una propiedad testeada.
   Garantiza mil puntos.
3. `∀x, y: f(x, y) = f(y, x)` con prueba — un teorema. Garantiza todos los
   puntos que existirán jamás, por un argumento matemático, no por repetición.

**La escena que lo hace humano**: la sala cerrada. Le dices al asistente «que
nadie entre en esta sala sin la llave». El asistente escribe la spec como
teorema sobre todos los estados posibles del juego, y el compilador no acepta
el código hasta que existe la prueba de que ningún estado la viola. Si meses
después alguien añade un dash que atraviesa paredes, el compilador lo rechaza
solo: el teorema sigue de guardia.

**Declaración honesta**: Peanito no tiene tipos ni checker; este peldaño es lo
que hace Bend2 (mismo algoritmo de verificación que Lean). Se cuenta, no se
demuestra aquí.

## Estación 3 · El mismo cribador, otra presa

**La idea.** Cómo funciona SupGen: superpone todos los candidatos compartiendo
la estructura común, los aplica a la vez contra la restricción, y colapsa con
una cola de prioridad que saca primero los más cortos. La clave que une la
sección: **apuntado a ejemplos mina programas; apuntado a un teorema mina
pruebas**. Es el «StockFish para teoremas»: cuando el LLM se atasca en un
sub-lema, llama al minador como quien llama a la calculadora.

**Estado**: expositivo hoy; el colapsador perezoso por cola de prioridad es la
ambición del mes (PLAN.md), así que puede acabar siendo demo real.

## Estación 4 · El contraste final

**La idea.** La tabla de dos mundos, sin decir «perfecto» hasta la última frase.

- Mundo LLM: genera plausible, nadie verifica, tú te lees el código.
- Mundo spec: el humano mantiene la spec (cien veces más corta que el código),
  la IA genera código y prueba, y el verificador no se deja engañar.

Entonces sí: código perfecto, con el asterisco en la misma frase: perfecto
respecto a la spec, y si la spec está mal, el teorema demostrado no te salva.
Cierre honesto: SupGen es cerrado y Bend2 está por salir; esta página enseña el
mecanismo, en abierto y a escala de juguete.

## Fuentes (de los volcados de Taelin)

- «Fast Discrete Program Search» (ago 2024): superposición + colapso, sub-1
  interacción por candidato.
- Colapso por cola de prioridad (gist SUP Nodes, ago 2024).
- La sala cerrada y «the LLM writes the specs» (jul 2025).
- «Proofs are just unit tests on infinitely many inputs» (jun 2025).
- NeoGen como «StockFish for theorems» / calculadora de razonamiento (jun 2025).
- Specs 100x más cortas que el código; «vibe coding without doom loops»
  (feb-jun 2026).
