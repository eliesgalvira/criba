// i18n mínima de autor (ES/EN). GT se evaluará en build-time cuando el copy crezca.
//
// Principio de escritura (escalada): cada término técnico aparece solo después
// del agarre que lo hace natural. Primero la intuición, luego el nombre.
// Regla de casa: nunca em-dash; puntúa con coma, dos puntos o paréntesis.
import { createContext, useContext } from "react";

export type Lang = "es" | "en";

export interface Strings {
  h1a: string;
  h1hilo: string;
  h1b: string;
  heroExplain: string;
  h1sub: string;
  hint: string;
  minerh2: string;
  minerIntro: string;
  minersub: string;
  run: string;
  running: string;
  outidle: string;
  foundHead: string;
  foundProven: string;
  foundBest: string;
  pieces: string;
  foundIn: string;
  sharedSteps: string;
  verify: string;
  rawIntro: string;
  rawLegend: string;
  notfound: string;
  addPair: string;
  editAsText: string;
  presets: Record<string, string>;
  viewLoop: string;
  viewTrace: string;
  viewCases: string;
  viewPatterns: string;
  patternsNote: string;
  trHead: string;
  trJot: string;
  trFollow: string;
  trFollowOnly: string;
  trEnd: string;
  trTotal: string;
  trJotted: string;
  delPair: string;
  raceh2: string;
  racelead: string;
  raceNote: string;
  gorace: string;
  goraceRunning: string;
  passes: string;
  naivelbl: string;
  iclbl: string;
  dnfNoteA: string;
  dnfNoteB: string;
  overA: string;
  overB: string;
  overC: string;
  shapeh2: string;
  shapeIntro: string;
  shapeStep1: string;
  shapeStep2: string;
  shapeStep3: string;
  shapeCap1head: string;
  shapeCap1: string;
  shapeCap2head: string;
  shapeCap2: string;
  shapeCap3head: string;
  shapeCap3: string;
  shapeLegendGrid: readonly (readonly [string, string, string])[];
  shapeLegendSplit: readonly (readonly [string, string, string])[];
  shapeLegendTree: readonly (readonly [string, string, string])[];
  parh2: string;
  parIntro: string;
  parStep1: string;
  parStep2: string;
  parStep3: string;
  parStep4: string;
  parCap1head: string;
  parCap1: string;
  parCap2head: string;
  parCap2: string;
  parCap3head: string;
  parCap3: string;
  parCap4head: string;
  parCap4: string;
  parPctLabel: string;
  cpuh2: string;
  cpuIntro: string;
  cpuStep1: string;
  cpuStep2: string;
  cpuStep3: string;
  cpuCap1head: string;
  cpuCap1: string;
  cpuCap2head: string;
  cpuCap2: string;
  cpuCap3head: string;
  cpuCap3: string;
  cpuStep4: string;
  cpuCap4head: string;
  cpuCap4: string;
  cpuPctLabel: string;
  honh2: string;
  hon: readonly (readonly [string, string])[];
  foot1: string;
  foot2a: string;
  foot2link: string;
  foot2b: string;
}

const STRINGS: Record<Lang, Strings> = {
  es: {
    h1a: "Computar es tejer ",
    h1hilo: "hilos",
    h1b: " que se recombinan.",
    heroExplain:
      "En la animación del fondo, cada rombo es una máquina diminuta y cada hilo, una conexión. Cuando dos máquinas se tocan, se transforman según unas pocas reglas fijas, y de millones de esos toques sale cualquier cálculo que puedas imaginar.",
    h1sub:
      "El telar de Jacquard fue la primera máquina programable, hace doscientos años. Esta página va de un paradigma que vuelve a computar así: tejiendo.",
    hint: "desliza",
    minerh2: "Piensa una regla, enlaza entradas con salidas y recibe el programa.",
    minerIntro:
      "La página encuentra sola el programa más corto que cumple todos tus enlaces, probando todos los programas posibles a la vez. (Ese «a la vez» tiene nombre: superposición. El truco, más abajo.)",
    minersub: "Sin IA y sin trampa: lo que sale cumple tus ejemplos siempre, por construcción.",
    run: "Cribar el espacio de programas",
    running: "Cribando…",
    outidle: "Estos ejemplos dicen «el doble». Púlsalo, o inventa tu propia función.",
    foundHead: "El programa más corto que cumple tus ejemplos:",
    foundProven: "y está demostrado que no hay ninguna más corta",
    foundBest: "la más corta encontrada hasta donde exploramos",
    pieces: "piezas",
    foundIn: "encontrada en",
    sharedSteps: "pasos de trabajo, compartidos entre todos los candidatos",
    verify: "Y generaliza: mírala funcionar donde no diste ejemplos:",
    rawIntro: "Así se escribe en el idioma del telar:",
    rawLegend: "«0:» si es cero · «S» suma uno · «@» vuelve a empezar · «*» devuelve lo que quede",
    notfound:
      "Ningún programa, hasta donde exploramos, cumple esos ejemplos a la vez: o se contradicen, o piden algo que este mini-lenguaje no sabe decir (solo cuenta y repite). Antes que inventar, te lo dice.",
    addPair: "añadir ejemplo",
    editAsText: "con notación de función f(x) = y",
    presets: {
      doble: "doble",
      mitad: "mitad",
      mas3: "n + 3",
      parimpar: "¿par o impar?",
      triple: "triple",
      mod3: "resto ÷3",
      resta2: "resta 2",
    },
    viewLoop: "instrucciones",
    viewTrace: "en marcha",
    viewCases: "por casos",
    viewPatterns: "como el cribador",
    patternsNote:
      "(así piensa el cribador por dentro: «si n = m + 1» significa «si n es el siguiente de algún m»)",
    trHead: "Míralo funcionar con n =",
    trJot: "apunta",
    trFollow: "y sigue con",
    trFollowOnly: "sigue con",
    trEnd: "termina con",
    trTotal: "total",
    trJotted: "lo apuntado",
    delPair: "quitar ejemplo",
    raceh2: "El truco: compartir el trabajo.",
    racelead:
      "Un encargo deliberadamente absurdo: negar una afirmación 2^N veces seguidas. La forma clásica de computar, la de casi todo el software que usas, hace el trabajo de cada negación, una a una. El paradigma del telar se da cuenta de que casi todas las pasadas son idénticas… y las teje una sola vez. Mueve N y compara. Los dos contadores salen de ejecuciones reales, en tu navegador, ahora.",
    raceNote:
      "(Los expertos llaman a estos dos mundos «λ-cálculo» y «evaluación óptima de redes de interacción». Los nombres dan igual por ahora; la diferencia entre las dos columnas, no. Al método clásico le damos un presupuesto de paciencia de 10 millones de pasos: si lo agota, se rinde y te dice cuánto le faltaba.)",
    gorace: "Hacerlo de verdad",
    goraceRunning: "Tejiendo…",
    passes: "negaciones",
    naivelbl: "pasos, haciéndolo una a una (método clásico)",
    iclbl: "pasos, compartiendo el trabajo (el telar)",
    dnfNoteA: "agotó su paciencia: acabar costaría",
    dnfNoteB: "pasos",
    overA: "Ni siquiera pudo empezar: solo escribir el encargo son",
    overB:
      "piezas, una por negación, más que todo su presupuesto. El telar escribe ese mismo encargo con",
    overC: "dobleces.",
    shapeh2: "Regular e irregular: la forma del trabajo.",
    shapeIntro:
      "Repartir un cálculo entre muchos núcleos solo es fácil si sabes su forma antes de empezar. Ahí está la línea que separa lo que una GPU devora de lo que se le atraganta. Toca cada paso.",
    shapeStep1: "1 · La rejilla",
    shapeStep2: "2 · La grieta",
    shapeStep3: "3 · El árbol",
    shapeCap1head: "Paralelismo regular.",
    shapeCap1:
      "La misma operación sobre una rejilla de datos. Como la forma se conoce antes de empezar, la rejilla se corta en rebanadas iguales, una por máquina, y cada golpe estampa la tanda entera a la vez. Esto es lo que tu GPU hace de maravilla: millones de datos idénticos, al mismo compás.",
    shapeCap2head: "Basta un «si» para partirla.",
    shapeCap2:
      "Cuando cada dato elige su camino según su valor, las máquinas en formación cerrada no pueden estampar las dos ramas a la vez: una pasada para la rama A, otra para la B, con los datos de la otra rama parados. En una GPU esto llega a costar treinta veces más.",
    shapeCap3head: "El árbol: paralelismo irregular.",
    shapeCap3:
      "Llevado al extremo, el trabajo deja de ser una rejilla. Es un árbol que nace del propio cálculo: cada nodo decide sobre la marcha cuántas ramas engendra, unas mueren enseguida y otras estallan. Nadie sabe su forma ni su tamaño hasta desplegarlo. Aquí la rejilla se atasca, y de esto vive el telar del fondo: teje el árbol según crece.",
    shapeLegendGrid: [
      ["thread", "máquina", "una por rebanada; baja al estampar"],
      ["sq-mustard", "dato estampado", "toda la tanda de un golpe"],
    ],
    shapeLegendSplit: [
      ["sq-mustard", "dato de la rama A", "se estampa en esta pasada"],
      ["sq-madder", "dato de la rama B", "a la pasada siguiente"],
      ["sq-hollow", "dato parado", "esperando el turno de su rama"],
    ],
    shapeLegendTree: [
      ["madder", "frontera", "trabajo disponible ahora"],
      ["mustard", "recién hecho", "acaba de decidir sus ramas"],
      ["thread", "asentado", "ya decidió; sostiene el árbol"],
      ["fade", "podado", "la rama muere y se descose"],
    ],
    parh2: "Una GPU por dentro.",
    parIntro:
      "Cada fila es uno de los 32 carriles de la máquina; cada columna que entra por la derecha, un ciclo de reloj. Celda encendida: ese carril trabajó. Hueco: parado. Recorre los cuatro pasos mirando el porcentaje.",
    parStep1: "1 · Su terreno",
    parStep2: "2 · Un «si»",
    parStep3: "3 · Trabajo vivo",
    parStep4: "4 · El telar",
    parCap1head: "El terreno de la GPU:",
    parCap1:
      "la misma operación sobre millones de datos. Tela cerrada, ciclo tras ciclo. Nada en el mundo hace esto mejor.",
    parCap2head: "Su debilidad:",
    parCap2:
      "los 32 carriles van en formación, todos la misma instrucción a la vez. Si un «si» parte los datos en dos ramas, ejecuta una rama por pasada y la otra mitad del silicio espera. Pagas toda la máquina; trabaja la mitad.",
    parCap3head: "Y su límite:",
    parCap3:
      "trabajo que nace y muere durante el propio cálculo. La GPU solo sabe avanzar por tandas en formación: lanza un lote, espera al más lento, hueco, y vuelta a empezar. Ningún carril puede tomar faena nueva a mitad de tanda.",
    parCap4head: "Otra arquitectura:",
    parCap4:
      "el mismo trabajo, sin formación. Cada carril toma una tarea en cuanto existe, sobre la marcha. Esto una GPU no lo puede hacer; así reparte una red de interacciones, como el telar del fondo. Compara el porcentaje con el paso 3: esa diferencia es este proyecto.",
    parPctLabel: "del silicio trabajando, medido sobre la tela que ves",
    cpuh2: "Y una CPU por dentro.",
    cpuIntro:
      "La otra máquina de tu ordenador. Un núcleo velocísimo (izquierda), la memoria lejos (derecha) y una despensa diminuta a su lado: la cache. Abajo, su tela de un solo carril: celda, ciclo computando; hueco, ciclo esperando.",
    cpuStep1: "1 · La cadena",
    cpuStep2: "2 · La memoria lejos",
    cpuStep3: "3 · La caza de punteros",
    cpuCap1head: "El terreno de la CPU:",
    cpuCap1:
      "una cadena de dependencias: cada paso necesita el anterior. Todo cabe en el núcleo. Sin viajes. Un paso por ciclo; nada lo hace más rápido.",
    cpuCap2head: "El peaje:",
    cpuCap2:
      "los datos viven lejos y cada uno viaja. (Tiene nombre: el cuello de botella de von Neumann.) La CPU apuesta por la localidad: lees en orden, un solo viaje trae la fila entera a la despensa. La apuesta acierta.",
    cpuCap3head: "La apuesta falla:",
    cpuCap3:
      "un grafo salta por la memoria sin orden. Cada salto, un viaje; la despensa no sirve; el núcleo espera. Recorrer grafos es el peor caso de la CPU. Y es justo lo que hace esta página al emular el telar.",
    cpuStep4: "4 · Sin distancia",
    cpuCap4head: "El sueño del telar:",
    cpuCap4:
      "¿y si cada casilla de memoria supiera computar? El dato no viaja: la máquina está donde está el dato, y el mismo grafo salta de vecina en vecina, un paso por ciclo. Este chip no existe todavía. Es lo que una red de interacciones le pide al silicio, y el fondo de este proyecto.",
    cpuPctLabel: "de los ciclos computando; el resto, esperando a la memoria",
    honh2: "Lo que este paradigma no es",
    hon: [
      [
        "No hace magia imposible.",
        " Cualquier resultado que veas aquí lo puede reproducir un ordenador normal con un programa hecho a medida. Lo nuevo es que aquí sale solo, del mecanismo, sin que nadie le enseñe el truco.",
      ],
      [
        "No es más rápida para tu código de cada día.",
        " Un bucle en C hoy le gana, y por mucho. No es mala suerte: los chips actuales llevan cincuenta años afinándose para una cosa muy concreta, números puestos en fila y leídos en orden. Esta tela computa reescribiendo un grafo, y sobre esos chips cada puntada cuesta cientos de ciclos donde una suma cuesta uno. Juega de visitante, en un estadio construido para el rival.",
      ],
      [
        "No convierte en paralelo lo secuencial.",
        " Su paralelismo de serie es real: dos zonas independientes del tejido avanzan a la vez, sin turnos y sin pisarse. Pero si cada paso necesita el resultado del anterior, no hay nada que repartir, ni aquí ni en ninguna máquina. Su terreno es el paralelismo irregular: cálculos que se ramifican sin patrón, justo donde se atascan las GPUs, que están hechas para repetir la misma operación sobre millones de datos idénticos.",
      ],
      [
        "Todavía no tiene telar propio.",
        " Todo esto corre emulado sobre chips pensados para otra cosa. Ya hay quien intenta construir el chip nativo, con memoria y cálculo viviendo en la misma celda para que los datos no viajen. Si llega, no jubilará a tu CPU ni a tu GPU: sería una tercera pieza, para los problemas que a las otras dos se les dan mal.",
      ],
      [
        "No es computación cuántica.",
        " Aquí «superposición» significa compartir estructura entre candidatos parecidos; no hay qubits ni física exótica.",
      ],
      [
        "El lienzo del fondo es una maqueta visual.",
        " Los números de la criba y de la carrera salen de ejecuciones reales en tu navegador; los porcentajes de la GPU y de la CPU se miden de verdad, pero sobre cargas de trabajo simuladas.",
      ],
    ],
    foot1: "Prototipo: un proyecto de divulgación sobre el Interaction Calculus.",
    foot2a: "Nada de esto existiría sin ",
    foot2link: "HVM y Bend",
    foot2b:
      ", el trabajo abierto de Victor Taelin y HOC, ni sin los interaction combinators de Yves Lafont (1997).",
  },
  en: {
    h1a: "To compute is to weave ",
    h1hilo: "threads",
    h1b: " that recombine.",
    heroExplain:
      "In the background animation, every diamond is a tiny machine and every thread, a connection. When two machines touch, they transform by a handful of fixed rules, and from millions of those touches comes any computation you can imagine.",
    h1sub:
      "The Jacquard loom was the first programmable machine, two hundred years ago. This page is about a paradigm that computes like that again: by weaving.",
    hint: "scroll",
    minerh2: "Think of a rule, link inputs to outputs, get the program.",
    minerIntro:
      "The page finds, by itself, the shortest program that fits all your links, trying every possible program at once. (That “at once” has a name: superposition. The trick, further down.)",
    minersub: "No AI and no tricks: what comes out fits your examples always, by construction.",
    run: "Sift the space of programs",
    running: "Sifting…",
    outidle: "These examples say “double it”. Press it, or invent your own function.",
    foundHead: "The shortest program that fits your examples:",
    foundProven: "and it is proven that no shorter one exists",
    foundBest: "the shortest found as far as we explored",
    pieces: "pieces",
    foundIn: "found in",
    sharedSteps: "steps of work, shared across all candidates",
    verify: "And it generalizes: watch it work where you gave no examples:",
    rawIntro: "This is how it is written in the loom's own language:",
    rawLegend: "“0:” if zero · “S” add one · “@” start over · “*” return what remains",
    notfound:
      "No program, as far as we explore, fits those examples at once: either they contradict each other, or they ask for something this mini-language cannot say (it only counts and repeats). Rather than invent, it tells you.",
    addPair: "add example",
    editAsText: "with function notation f(x) = y",
    presets: {
      doble: "double",
      mitad: "half",
      mas3: "n + 3",
      parimpar: "odd or even?",
      triple: "triple",
      mod3: "mod 3",
      resta2: "minus 2",
    },
    viewLoop: "instructions",
    viewTrace: "running",
    viewCases: "by cases",
    viewPatterns: "as the sifter",
    patternsNote:
      "(this is how the sifter thinks inside: “if n = m + 1” means “if n is the successor of some m”)",
    trHead: "Watch it run with n =",
    trJot: "jot down",
    trFollow: "and carry on with",
    trFollowOnly: "carry on with",
    trEnd: "finish with",
    trTotal: "total",
    trJotted: "what was jotted",
    delPair: "remove example",
    raceh2: "The trick: sharing the work.",
    racelead:
      "A deliberately absurd job: negate a statement 2^N times in a row. The classic way of computing, the one behind almost all the software you use, does the work of each negation, one by one. The loom paradigm notices that almost every pass is identical… and weaves it once. Move N and compare. Both counters come from real executions, in your browser, now.",
    raceNote:
      "(Experts call these two worlds “λ-calculus” and “optimal evaluation of interaction nets”. The names don't matter yet; the difference between the two columns does. We give the classic method a patience budget of 10 million steps: if it runs out, it gives up and tells you how much was left.)",
    gorace: "Do it for real",
    goraceRunning: "Weaving…",
    passes: "negations",
    naivelbl: "steps, doing it one by one (the classic way)",
    iclbl: "steps, sharing the work (the loom)",
    dnfNoteA: "it ran out of patience: finishing would cost",
    dnfNoteB: "steps",
    overA: "It couldn't even start: just writing the job down takes",
    overB:
      "pieces, one per negation, more than its whole budget. The loom writes that same job with",
    overC: "foldings.",
    shapeh2: "Regular and irregular: the shape of the work.",
    shapeIntro:
      "Splitting a computation across many cores is only easy if you know its shape before you start. That is the line between what a GPU devours and what jams it. Tap through each step.",
    shapeStep1: "1 · The grid",
    shapeStep2: "2 · The crack",
    shapeStep3: "3 · The tree",
    shapeCap1head: "Regular parallelism.",
    shapeCap1:
      "The same operation over a grid of data. Since the shape is known before starting, the grid is cut into equal slices, one per machine, and every blow stamps the whole batch at once. This is what your GPU does beautifully: millions of identical data points, on the same beat.",
    shapeCap2head: "One «if» is enough to crack it.",
    shapeCap2:
      "When each data point picks its path from its value, machines marching in lockstep cannot stamp both branches at once: one pass for branch A, another for branch B, with the other branch's data standing idle. On a GPU this can cost thirty times more.",
    shapeCap3head: "The tree: irregular parallelism.",
    shapeCap3:
      "Taken to the extreme, the work stops being a grid. It is a tree born from the computation itself: every node decides on the fly how many branches it spawns, some die at once and others burst open. Nobody knows its shape or size until it unfolds. Here the grid jams, and this is what the background loom lives on: it weaves the tree as it grows.",
    shapeLegendGrid: [
      ["thread", "machine", "one per slice; it drops as it stamps"],
      ["sq-mustard", "stamped data", "the whole batch in one blow"],
    ],
    shapeLegendSplit: [
      ["sq-mustard", "branch A data", "stamped on this pass"],
      ["sq-madder", "branch B data", "on the next pass"],
      ["sq-hollow", "idle data", "waiting for its branch's turn"],
    ],
    shapeLegendTree: [
      ["madder", "frontier", "work available now"],
      ["mustard", "just done", "just decided its branches"],
      ["thread", "settled", "already decided; holds the tree up"],
      ["fade", "pruned", "the branch dies and is unstitched"],
    ],
    parh2: "Inside a GPU.",
    parIntro:
      "Each row is one of the machine's 32 lanes; each column entering from the right, one clock cycle. Lit cell: that lane worked. Gap: idle. Walk the four steps watching the percentage.",
    parStep1: "1 · Its home turf",
    parStep2: "2 · One «if»",
    parStep3: "3 · Living work",
    parStep4: "4 · The loom",
    parCap1head: "The GPU's home turf:",
    parCap1:
      "the same operation over millions of data points. Closed cloth, cycle after cycle. Nothing in the world does this better.",
    parCap2head: "Its weakness:",
    parCap2:
      "the 32 lanes march in formation, all running the same instruction at once. If an «if» splits the data into two branches, it runs one branch per pass while the other half of the silicon waits. You pay for the whole machine; half of it works.",
    parCap3head: "And its limit:",
    parCap3:
      "work that is born and dies during the computation itself. The GPU can only advance in formation, batch by batch: launch a lot, wait for the slowest, gap, start again. No lane can pick up new work mid-batch.",
    parCap4head: "Another architecture:",
    parCap4:
      "the same work, without the formation. Each lane picks up a task the moment it exists, on the fly. A GPU cannot do this; this is how an interaction net distributes work, like the background loom. Compare the percentage with step 3: that difference is this project.",
    parPctLabel: "of the silicon working, measured over the cloth you see",
    cpuh2: "And a CPU inside.",
    cpuIntro:
      "The other machine in your computer. One blazing core (left), memory far away (right), and a tiny pantry next to it: the cache. Below, its single-lane cloth: cell, cycle computing; gap, cycle waiting.",
    cpuStep1: "1 · The chain",
    cpuStep2: "2 · Memory far away",
    cpuStep3: "3 · Pointer chasing",
    cpuCap1head: "The CPU's home turf:",
    cpuCap1:
      "a chain of dependencies: every step needs the previous one. Everything fits in the core. No trips. One step per cycle; nothing does it faster.",
    cpuCap2head: "The toll:",
    cpuCap2:
      "data lives far away and every datum travels. (It has a name: the von Neumann bottleneck.) The CPU bets on locality: read in order and a single trip brings the whole row into the pantry. The bet pays off.",
    cpuCap3head: "The bet fails:",
    cpuCap3:
      "a graph jumps through memory without order. Every jump, a trip; the pantry is useless; the core waits. Walking graphs is the CPU's worst case. And it is exactly what this page does when it emulates the loom.",
    cpuStep4: "4 · No distance",
    cpuCap4head: "The loom's dream:",
    cpuCap4:
      "what if every memory cell could compute? Data never travels: the machine is where the data is, and the same graph hops neighbor to neighbor, one step per cycle. This chip does not exist yet. It is what an interaction net asks of silicon, and the undercurrent of this project.",
    cpuPctLabel: "of the cycles computing; the rest, waiting for memory",
    honh2: "What this paradigm is not",
    hon: [
      [
        "It does no impossible magic.",
        " Any result you see here can be reproduced by a normal computer with a hand-tailored program. What's new is that here it falls out of the mechanism, with nobody teaching it the trick.",
      ],
      [
        "It is not faster at your everyday code.",
        " A C loop beats it today, by a lot. That is not bad luck: today's chips have spent fifty years being tuned for one very specific thing, numbers laid out in a row and read in order. This cloth computes by rewriting a graph, and on those chips every stitch costs hundreds of cycles where an addition costs one. It plays away, in a stadium built for the other team.",
      ],
      [
        "It does not make sequential things parallel.",
        " Its built-in parallelism is real: independent regions of the fabric advance at the same time, no turns, no stepping on each other. But when every step needs the result of the one before, there is nothing to hand out, not here and not on any machine. Its home turf is irregular parallelism: computations that branch without a pattern, exactly where GPUs get stuck, built as they are to repeat one operation over millions of identical items.",
      ],
      [
        "It has no loom of its own yet.",
        " All of this runs emulated on chips designed for something else. People are already trying to build the native chip, with memory and computation living in the same cell so data never travels. If it arrives, it will not retire your CPU or your GPU: it would be a third piece, for the problems the other two are bad at.",
      ],
      [
        "It is not quantum computing.",
        " Here “superposition” means sharing structure between similar candidates; no qubits, no exotic physics.",
      ],
      [
        "The background canvas is a visual mock.",
        " The sieve and race numbers come from real executions in your browser; the GPU and CPU percentages are genuinely measured, but over simulated workloads.",
      ],
    ],
    foot1: "Prototype: an outreach project about the Interaction Calculus.",
    foot2a: "None of this would exist without ",
    foot2link: "HVM and Bend",
    foot2b:
      ", the open work of Victor Taelin and HOC, or Yves Lafont's interaction combinators (1997).",
  },
};

export const LangContext = createContext<{ lang: Lang; t: Strings }>({
  lang: "es",
  t: STRINGS.es,
});

export function useT(): { lang: Lang; t: Strings } {
  return useContext(LangContext);
}

export function stringsFor(lang: Lang): Strings {
  return STRINGS[lang];
}
