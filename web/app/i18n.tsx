// i18n mínima de autor (ES/EN). GT se evaluará en build-time cuando el copy crezca.
//
// Principio de escritura (escalada): cada término técnico aparece solo después
// del agarre que lo hace natural. Primero la intuición, luego el nombre.
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
  honh2: string;
  hon: readonly (readonly [string, string])[];
  foot1: string;
  foot2: string;
}

const STRINGS: Record<Lang, Strings> = {
  es: {
    h1a: "Computar es tejer ",
    h1hilo: "hilos",
    h1b: " que se recombinan.",
    heroExplain:
      "Lo que se mueve ahí detrás no es un adorno: cada rombo es una máquina diminuta y cada hilo, una conexión. Cuando dos máquinas se tocan, se transforman según unas pocas reglas fijas — y de millones de esos toques sale cualquier cálculo que puedas imaginar.",
    h1sub:
      "El telar de Jacquard fue la primera máquina programable, hace doscientos años. Esta página va de un paradigma que vuelve a computar así: tejiendo.",
    hint: "desliza",
    minerh2: "Dale ejemplos. Recibe el programa.",
    minerIntro:
      "Tú das ejemplos de entrada y salida. La página encuentra sola el programa más corto que los cumple todos — probando todos los programas posibles a la vez. (Ese «a la vez» tiene nombre: superposición. El truco, más abajo.)",
    minersub: "Sin IA y sin trampa: lo que sale cumple tus ejemplos siempre, por construcción.",
    run: "Cribar el espacio de programas",
    running: "Cribando…",
    outidle: "Estos ejemplos dicen «el doble». Púlsalo — o inventa tu propia función.",
    foundHead: "El programa más corto que cumple tus ejemplos:",
    foundProven: "y está demostrado que no hay ninguna más corta",
    foundBest: "la más corta encontrada hasta donde exploramos",
    pieces: "piezas",
    foundIn: "encontrada en",
    sharedSteps: "pasos de trabajo, compartidos entre todos los candidatos",
    verify: "Y generaliza — mírala funcionar donde no diste ejemplos:",
    rawIntro: "Así se escribe en el idioma del telar:",
    rawLegend: "«0:» si es cero · «S» suma uno · «@» vuelve a empezar · «*» devuelve lo que quede",
    notfound:
      "Ningún programa, hasta donde exploramos, cumple esos ejemplos a la vez: o se contradicen, o piden algo que este mini-lenguaje no sabe decir — solo cuenta y repite. Antes que inventar, te lo dice.",
    addPair: "añadir ejemplo",
    editAsText: "✎ como números",
    presets: {
      doble: "el doble",
      mitad: "la mitad",
      mas3: "n + 3",
      parimpar: "¿par o impar?",
      triple: "el triple",
      mod3: "resto de ÷3",
    },
    delPair: "quitar ejemplo",
    raceh2: "El truco: compartir el trabajo.",
    racelead:
      "Un encargo deliberadamente absurdo: negar una afirmación 2^N veces seguidas. La forma clásica de computar — la de casi todo el software que usas — hace el trabajo de cada negación, una a una. El paradigma del telar se da cuenta de que casi todas las pasadas son idénticas… y las teje una sola vez. Mueve N y compara. Los dos contadores salen de ejecuciones reales, en tu navegador, ahora.",
    raceNote:
      "(Los expertos llaman a estos dos mundos «λ-cálculo» y «evaluación óptima de redes de interacción». Los nombres dan igual por ahora; la diferencia entre las dos columnas, no. Al método clásico le damos un presupuesto de paciencia de 10 millones de pasos: si lo agota, se rinde y te dice cuánto le faltaba.)",
    gorace: "Hacerlo de verdad",
    goraceRunning: "Tejiendo…",
    passes: "negaciones",
    naivelbl: "pasos, haciéndolo una a una (método clásico)",
    iclbl: "pasos, compartiendo el trabajo (el telar)",
    dnfNoteA: "agotó su paciencia — acabar costaría",
    dnfNoteB: "pasos",
    overA: "Ni siquiera pudo empezar: solo escribir el encargo son",
    overB:
      "piezas, una por negación — más que todo su presupuesto. El telar escribe ese mismo encargo con",
    overC: "dobleces.",
    honh2: "Etiqueta: lo que esta tela no es",
    hon: [
      [
        "No hace magia imposible.",
        " Cualquier resultado concreto lo puede reproducir un ordenador normal con un programa hecho a medida. Lo nuevo es que aquí sale solo, del mecanismo, sin que nadie le enseñe el truco.",
      ],
      [
        "No es más rápida para tu código de cada día.",
        " Un bucle en C hoy le gana. Su terreno es otro: buscar programas, invertir cálculos, demostrar cosas.",
      ],
      [
        "No es computación cuántica.",
        " Aquí «superposición» significa compartir estructura entre candidatos; no hay qubits.",
      ],
      [
        "El lienzo del fondo es una maqueta visual.",
        " Los números de la criba y de la comparación, en cambio, salen de ejecuciones reales en esta página.",
      ],
    ],
    foot1: "Prototipo — proyecto de divulgación sobre el Interaction Calculus de Victor Taelin.",
    foot2: "Todo el código es legible de arriba abajo: motor, criba y esta página.",
  },
  en: {
    h1a: "To compute is to weave ",
    h1hilo: "threads",
    h1b: " that recombine.",
    heroExplain:
      "What moves back there is not decoration: every diamond is a tiny machine and every thread, a connection. When two machines touch, they transform by a handful of fixed rules — and from millions of those touches comes any computation you can imagine.",
    h1sub:
      "The Jacquard loom was the first programmable machine, two hundred years ago. This page is about a paradigm that computes like that again: by weaving.",
    hint: "scroll",
    minerh2: "Give it examples. Get the program.",
    minerIntro:
      "You give input–output examples. The page finds, by itself, the shortest program that fits them all — trying every possible program at once. (That “at once” has a name: superposition. The trick, further down.)",
    minersub: "No AI and no tricks: what comes out fits your examples always, by construction.",
    run: "Sift the space of programs",
    running: "Sifting…",
    outidle: "These examples say “double it”. Press it — or invent your own function.",
    foundHead: "The shortest program that fits your examples:",
    foundProven: "and it is proven that no shorter one exists",
    foundBest: "the shortest found as far as we explored",
    pieces: "pieces",
    foundIn: "found in",
    sharedSteps: "steps of work, shared across all candidates",
    verify: "And it generalizes — watch it work where you gave no examples:",
    rawIntro: "This is how it is written in the loom's own language:",
    rawLegend: "“0:” if zero · “S” add one · “@” start over · “*” return what remains",
    notfound:
      "No program, as far as we explore, fits those examples at once: either they contradict each other, or they ask for something this mini-language cannot say — it only counts and repeats. Rather than invent, it tells you.",
    addPair: "add example",
    editAsText: "✎ as numbers",
    presets: {
      doble: "double",
      mitad: "half",
      mas3: "n + 3",
      parimpar: "odd or even?",
      triple: "triple",
      mod3: "remainder ÷3",
    },
    delPair: "remove example",
    raceh2: "The trick: sharing the work.",
    racelead:
      "A deliberately absurd job: negate a statement 2^N times in a row. The classic way of computing — the one behind almost all the software you use — does the work of each negation, one by one. The loom paradigm notices that almost every pass is identical… and weaves it once. Move N and compare. Both counters come from real executions, in your browser, now.",
    raceNote:
      "(Experts call these two worlds “λ-calculus” and “optimal evaluation of interaction nets”. The names don't matter yet; the difference between the two columns does. We give the classic method a patience budget of 10 million steps: if it runs out, it gives up and tells you how much was left.)",
    gorace: "Do it for real",
    goraceRunning: "Weaving…",
    passes: "negations",
    naivelbl: "steps, doing it one by one (the classic way)",
    iclbl: "steps, sharing the work (the loom)",
    dnfNoteA: "it ran out of patience — finishing would cost",
    dnfNoteB: "steps",
    overA: "It couldn't even start: just writing the job down takes",
    overB:
      "pieces, one per negation — more than its whole budget. The loom writes that same job with",
    overC: "foldings.",
    honh2: "Garment tag: what this cloth is not",
    hon: [
      [
        "It does no impossible magic.",
        " Any concrete result can be reproduced by a normal computer with a hand-tailored program. What's new is that here it falls out of the mechanism, with nobody teaching it the trick.",
      ],
      [
        "It is not faster at your everyday code.",
        " A C loop beats it today. Its home turf is different: searching for programs, inverting computations, proving things.",
      ],
      [
        "It is not quantum computing.",
        " Here “superposition” means sharing structure between candidates; there are no qubits.",
      ],
      [
        "The background canvas is a visual mock.",
        " The sieve and comparison numbers, however, come from real executions on this page.",
      ],
    ],
    foot1: "Prototype — an outreach project about Victor Taelin's Interaction Calculus.",
    foot2: "All the code is readable top to bottom: engine, sieve, and this page.",
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
