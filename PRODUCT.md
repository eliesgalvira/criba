# Product

## Register

brand

## Users

Gente tech-curiosa que llega desde un hilo de Twitter/X (el "simcluster" hispanohablante primero; el
círculo anglosajón de Taelin/Bend2 después). Programadores que conocen máquinas de Turing y quizá
algo de λ-cálculo, pero que nunca han oído hablar de interaction nets. Llegan con 60 segundos de
atención prestada; el trabajo es convertirlos en 15 minutos de asombro. Audiencia secundaria: el
evaluador de la mini-beca (lee la propuesta, abre el link, decide en 2 minutos si esto va en serio).

Bilingüe ES/EN con toggle; el copy nace en español (identidad: nadie divulga esto en español) y se
espeja en inglés (alcance: el campo vive en inglés).

## Product Purpose

Una sola página-experiencia que enseña, con demos vivas corriendo en el navegador, que el coste de
computar no es una propiedad de la matemática sino del modelo de computación elegido. Portada y
clímax: el minador de programas (das ejemplos entrada→salida, te devuelve el programa mínimo que los
cumple — correcto por construcción, sin modelo, sin entrenamiento). Debajo, capas de profundidad: el
espacio superpuesto colapsando en vivo, la carrera de reducción (naive vs sharing), las reglas de
interacción, y un panel de honestidad con lo que el paradigma NO es. Éxito = alguien que interactúa
un minuto y sale pensando "no hemos rascado ni la punta del iceberg de la computación".

Detrás hay una implementación con nombres propios (Criba, Copenhague, Everett, Peanito, Telar) que
el copy público no usa salvo que sea relevante.

## Brand Personality

Asombro riguroso. Tres palabras: **vivo, honesto, artesanal**. La web es una obra de arte cuyo
material es computación real: nada de vídeos ni GIFs de reducciones — las reducciones ocurren de
verdad, sobre el runtime propio, delante del usuario. El tono del copy es el de alguien que acaba de
entender algo hermoso y te lo enseña sin venderte nada: entusiasmo con los caveats en la misma
frase. Se permite lo lúdico (el minador invita a jugar) pero nunca lo infantil.

## Anti-references

- **Hype-slop de AI Twitter**: claims sin demo, números de benchmark sin metodología, "esto lo
  cambia todo". La credibilidad es el activo; cada afirmación fuerte lleva su demo o su caveat al
  lado.
- **Landing SaaS**: hero-metric, grids de cards idénticas, gradientes decorativos, testimonios. Esto
  no vende nada.
- **Web de paper académico**: PDF con CSS, muros de texto, notación sin puente. La precisión sí; la
  aridez no.
- **Visualización críptica** (tipo chemlambda/quinegraphs): animaciones hipnóticas que nadie
  entiende. Todo lo que se mueve debe poder explicarse tocando.

## Design Principles

1. **El material es computación viva.** Los diagramas no ilustran: son la interfaz. Toda animación
   de reducción es una reducción real del runtime, con su contador de trabajo visible. Si no puede
   correr de verdad, no se muestra.
2. **Tocar antes que leer.** Cada concepto se puede manipular antes (o mientras) se explica. El
   texto acompaña a la interacción, nunca la sustituye.
3. **La honestidad es estética.** Los límites y caveats no van en letra pequeña: son parte del
   contenido y del diseño, con el mismo cuidado tipográfico que las maravillas.
4. **Profundidad por capas, no por páginas.** Un scroll; quien quiera 60 segundos tiene 60 segundos;
   quien quiera el mecanismo entero lo despliega sin salir.
5. **Legible hasta el código fuente.** La promesa "el paradigma cabe en 150 líneas que puedes leer"
   se extiende al sitio: sin frameworks pesados, sin dependencias opacas; ver-fuente es parte de la
   experiencia.

## Accessibility & Inclusion

- Contraste AA (≥4.5:1 cuerpo) en ambos temas si hay más de uno.
- `prefers-reduced-motion`: obligatorio y de primera clase — el sitio es animación-intensivo, así
  que cada pieza viva necesita un estado estático digno (el fotograma final + contador, no un
  hueco).
- Las demos no dependen del color solo (pares activos marcados por forma/brillo además de tono).
- Bilingüe real: `lang` correcto por idioma, toggle accesible por teclado.
