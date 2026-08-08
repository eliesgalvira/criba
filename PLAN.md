# Plan — vista de pájaro

> Actualizado 2026-08-08. La propuesta se presenta antes del 11-08 23:59; el mes de beca es 15-08 →
> 15-09.

## El objetivo

**Máxima claridad del concepto** — para nosotros y para cualquiera. La vara de medir de cada
decisión: ¿esto hace el Interaction Calculus más claro?

**El objetivo ambicioso que lo encarna: un motor de animación del Interaction Calculus en la web.**
Reducciones reales de Telar — no maquetas — con layout y animación de cada interacción, tocables. La
página entera se convierte en lentes sobre ese motor: el hero es el motor en ambiente, el sandbox de
reglas es el motor a cámara lenta, la carrera es el motor midiendo, el minador es el motor cribando.
Nada ilustrado que no esté ocurriendo.

## Qué está hecho (el prototipo de la propuesta)

- **Motores verificados** (21+ tests, paridad con kolmo): Telar (runtime IC), Peanito (DSL), Criba
  con Copenhague y Everett, explain/trace.
- **Hero**: telar vivo (maqueta visual), scroll hint de lanzadera.
- **Minador**: orillas con hilos texturizados (crear/mover/arrancar, fantasmas de generalización),
  pestañas de 7 reglas, worker con progreso, tres vistas del programa (traza / casos / cribador),
  editor de texto.
- **Carrera**: worker con contador real, presupuesto de paciencia explicado, tres regímenes honestos
  (completa / se rinde / ni cabe).
- **Etiqueta de honestidad**, ES/EN, React Doctor 100, textura de grano.

## Qué falta ANTES del martes 11 (propuesta)

1. **Hosting con URL pública** (GitHub Pages o similar; necesita repo remoto).
2. **El texto de la solicitud** (~250 palabras, claro y directo, con el link).
3. Pasada rápida de móvil + pulido de lo que salga al usarla.

## El mes de beca, semana a semana

**S1 (15–22 ago) — El motor de animación, primero.** Es la pieza de la que cuelga todo: layout de
redes reales de Telar + animación de cada interacción (APP-LAM, DUP-SUP…), API interna limpia para
que cualquier sección lo use. El hero pasa de maqueta a motor real esa misma semana. Deploy
continuo.

**S2 (22–29 ago) — Las lentes.** Sandbox de las reglas sobre el motor (pares activos tocables, cada
regla a cámara lenta — no existe en ningún sitio y es el hueco que la investigación identificó).
Carrera nueva con el concepto elegido (la tira que se pliega) y su versión con el motor debajo.

**S3 (29 ago–5 sep) — Profundidad y alcance.** Criba animada sobre las orillas + la vista visual del
programa («la lanzadera calculando»). Panel LLM-vs-minador. Copy completo bilingüe (evaluar General
Translation en build-time). Sección «qué NO puede» interactiva (la lección de Kolmogorov con el
ejemplo 3→12). Móvil y accesibilidad a fondo. SEO/OG.

**S4 (5–15 sep) — Pulido y entregable.** Craft final (animaciones, microcopy), rendimiento, y el
**deliverable de la beca**: hilo público + repo abierto + vídeo corto, coordinado con la ola de
Bend2 si ya ha salido. Buffer para lo que la realidad rompa.

## Ambiciones (si el mes da más de sí)

- Minador corriendo SOBRE Telar (collapser perezoso con cola de prioridad): la versión abierta del
  mecanismo de SupGen, en el navegador.
- Editor de redes tocable (dibujar una red y verla reducirse).
- Compartir funciones por URL (reto: «¿qué regla es esta?»).

## Rediseño de la carrera (concepto a decidir)

Menos texto, más evidencia: **la tira que se pliega**. El encargo es una tira de tela de 2^N
casillas. A la izquierda, el método clásico la recorre casilla a casilla (la tira desfila, el
contador vuela, no acaba). A la derecha, el telar la **pliega sobre sí misma N veces** — doblar en
vez de recorrer — y en N pliegues está hecho. «Doblar en vez de repasar» se entiende sin leer nada,
es literalmente lo que hace la auto-composición, y es tela. Los contadores reales se mantienen
debajo.
