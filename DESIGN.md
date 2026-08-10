# Design — «El Telar»

Dirección elegida (2026-08-08) entre tres exploraciones (`web/design/`). Referencias: tejidos de
Anni Albers, tarjetas del telar de Jacquard, tinte índigo. Estrategia de color: **drenched** — la
superficie ES el índigo; la calidez la llevan los hilos y acentos, nunca el fondo.

## Tokens

```css
:root {
  --indigo: oklch(0.26 0.055 265); /* fondo principal (tela teñida) */
  --indigo-deep: oklch(0.21 0.05 265); /* secciones hundidas / paneles */
  --thread: oklch(0.90 0.025 85); /* tinta principal (lino), 11.6:1 sobre índigo */
  --thread-dim: oklch(0.78 0.04 85); /* texto secundario, 7.8:1 (cursiva pequeña sobre oscuro pide margen) */
  --madder: oklch(0.58 0.16 28); /* rubia: acción, urgencia, lo "naive" */
  --mustard: oklch(0.78 0.12 85); /* mostaza: resultado, acierto, lo "IC" */
}
```

Reglas de uso: texto sobre rellenos saturados (madder, botones) siempre en `--thread` (blanco
cálido), nunca oscuro. Mostaza como relleno lleva texto `--indigo-deep` (es pálido, L 0.78).

## Tipografía

- **Solway** (400/500/700/800): titulares, botones, código Peanito, cifras. Slab "tejido", carácter
  artesanal.
- **Alegreya** (400/500/700 + itálica): cuerpo. Humanista española, cálida, excelente en textos
  largos. Itálica para subtítulos y meta.
- Escala fluida con `clamp()`; h1 ≤ 4.6rem; cuerpo 1.1rem / 1.68.

## Motivos

- **Orillos** (selvage): bandas tejidas repeating-linear-gradient en los bordes superior/inferior
  del hero — el marco de la pieza.
- **Urdimbre**: hilos verticales tenues (`oklch(0.32 0.05 265 / 0.5)`) como textura de fondo del
  lienzo vivo.
- **Hilos**: los cables de la net son líneas onduladas (trama); los agentes, rombos de lanzadera; el
  par activo, nudo rubia.
- **Etiqueta de prenda**: el panel de honestidad como etiqueta cosida (borde dashed).

## Motion

- El lienzo del telar es la única animación continua (reducción real sobre Telar en la versión
  final; contador visible).
- **Scroll hint obligatorio en el hero**: el lienzo a viewport completo no invita a bajar por sí
  solo — un hilo/chevron descendente con micro-animación (ease-out, ciclo lento), que desaparece al
  primer scroll.
- `prefers-reduced-motion`: lienzo pausado en fotograma real + leyenda; scroll hint estático (flecha
  sin ciclo).
- Sin reveals uniformes por sección; las transiciones sirven al contenido (contadores que cuentan,
  hilos que se tensan al cribar).

## Componentes

- **Bench del minador**: marco de doble borde lino; ejemplos como fichas; botón "Cribar" en rubia;
  salida con programa Peanito en Solway y meta en itálica.
- **Contadores**: cifras Solway 800, tabulares; naive en rubia / IC en mostaza; barras de "tela
  tejida" como visualización de trabajo.
- **Toggle ES/EN**: fijo arriba-derecha, mostaza el activo.

## Textura (técnica apuntada, aún sin aplicar)

Grano estilo t3code (`apps/web/src/index.css` de ese repo): SVG inline como data-URI con
`feTurbulence type='fractalNoise' baseFrequency='0.9'
numOctaves='4' stitchTiles='stitch'`, rect a
opacidad ~0.035, usado como `background-image` POR ENCIMA del `background-color` de cada superficie
que opta (utility), nunca como capa global. Si algún día el índigo pide textura de tela, es así — no
con degradados que tapen el telar.
