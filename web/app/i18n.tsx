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
  parh2: string;
  parIntro: string;
  parStep1: string;
  parStep2: string;
  parStep3: string;
  parCap1head: string;
  parCap1: string;
  parCap2head: string;
  parCap2: string;
  parCap3head: string;
  parCap3: string;
  parLegend: readonly (readonly [string, string])[];
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
    parh2: "Regular e irregular: la forma del trabajo.",
    parIntro:
      "Repartir un cálculo entre muchos núcleos solo es fácil si sabes su forma antes de empezar. Ahí está la línea que separa lo que una GPU devora de lo que se le atraganta. Toca cada paso.",
    parStep1: "1 · La rejilla",
    parStep2: "2 · La grieta",
    parStep3: "3 · El árbol",
    parCap1head: "Paralelismo regular.",
    parCap1:
      "La misma operación sobre una rejilla de datos. Sabes cuántas celdas hay y que todas hacen lo mismo, así que la máquina las reparte en rebanadas iguales y las estampa de un golpe. Esto es lo que tu GPU hace de maravilla: millones de celdas idénticas, a la vez.",
    parCap2head: "Basta un «si» para partirla.",
    parCap2:
      "Cuando cada celda elige su camino según su dato, una máquina en formación cerrada no puede hacer las dos ramas a la vez: las hace por turnos, con la mitad de las celdas paradas en cada pasada. En una GPU esto llega a costar treinta veces más.",
    parCap3head: "El árbol: paralelismo irregular.",
    parCap3:
      "Llevado al extremo, el trabajo deja de ser una rejilla. Es un árbol que nace del propio cálculo: cada nodo decide sobre la marcha cuántas ramas engendra, unas mueren enseguida y otras estallan. Nadie sabe su forma ni su tamaño hasta desplegarlo. Aquí la rejilla se atasca, y aquí es donde vive el telar del fondo: teje el árbol según crece.",
    parLegend: [
      ["frontera", "trabajo disponible ahora"],
      ["recién hecho", "acaba de reducirse"],
      ["parado", "esperando su turno"],
    ],
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
        " Los números de la criba y de la carrera, en cambio, salen de ejecuciones reales en tu navegador.",
      ],
    ],
    foot1: "Prototipo: un proyecto de divulgación sobre el Interaction Calculus.",
    foot2a: "Nada de esto existiría sin ",
    foot2link: "HVM y Bend",
    foot2b:
      ", el trabajo abierto de Victor Taelin, ni sin los interaction combinators de Yves Lafont (1997).",
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
    parh2: "Regular and irregular: the shape of the work.",
    parIntro:
      "Splitting a computation across many cores is only easy if you know its shape before you start. That is the line between what a GPU devours and what jams it. Tap through each step.",
    parStep1: "1 · The grid",
    parStep2: "2 · The crack",
    parStep3: "3 · The tree",
    parCap1head: "Regular parallelism.",
    parCap1:
      "The same operation over a grid of data. You know how many cells there are and that they all do the same thing, so the machine splits them into equal slices and stamps them in one blow. This is what your GPU does beautifully: millions of identical cells, all at once.",
    parCap2head: "One «if» is enough to crack it.",
    parCap2:
      "When each cell picks its path from its data, a machine marching in lockstep cannot do both branches at once: it does them in turns, with half the cells idle on each pass. On a GPU this can cost thirty times more.",
    parCap3head: "The tree: irregular parallelism.",
    parCap3:
      "Taken to the extreme, the work stops being a grid. It is a tree born from the computation itself: every node decides on the fly how many branches it spawns, some die at once and others burst open. Nobody knows its shape or size until it unfolds. Here the grid jams, and here is where the background loom lives: it weaves the tree as it grows.",
    parLegend: [
      ["frontier", "work available now"],
      ["just done", "just reduced"],
      ["idle", "waiting its turn"],
    ],
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
        " The sieve and race numbers, though, come from real executions in your browser.",
      ],
    ],
    foot1: "Prototype: an outreach project about the Interaction Calculus.",
    foot2a: "None of this would exist without ",
    foot2link: "HVM and Bend",
    foot2b: ", Victor Taelin's open work, or Yves Lafont's interaction combinators (1997).",
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
