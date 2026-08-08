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
  cta: string;
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
  delPair: string;
  raceh2: string;
  racelead: string;
  raceNote: string;
  gorace: string;
  passes: string;
  naivelbl: string;
  iclbl: string;
  dnfA: string;
  dnfB: string;
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
    cta: "Ver lo que sabe hacer",
    hint: "desliza",
    minerh2: "Dale ejemplos. Recibe la receta.",
    minerIntro:
      "Una función es una máquina de números: entra uno, sale otro. Lo normal es que un programador escriba la receta a mano. Aquí no. Tú das unos pocos ejemplos de entrada y salida, y la página encuentra sola la receta más corta que los cumple todos — probando el espacio entero de recetas posibles a la vez. (A ese «todas a la vez» se le llama superposición; el truco que lo hace posible lo verás un poco más abajo.)",
    minersub:
      "Sin inteligencia artificial y sin trampa: la receta encontrada cumple tus ejemplos siempre, por construcción.",
    run: "Cribar el espacio de recetas",
    running: "Cribando…",
    outidle:
      "Estos cuatro ejemplos dicen «el doble». Pulsa el botón — o cambia los números e inventa tu propia función.",
    foundHead: "La receta más corta que cumple tus ejemplos:",
    foundProven: "y está demostrado que no hay ninguna más corta",
    foundBest: "la más corta encontrada hasta donde exploramos",
    pieces: "piezas",
    foundIn: "encontrada en",
    sharedSteps: "pasos de trabajo, compartidos entre todos los candidatos",
    verify: "Y generaliza — mírala funcionar donde no diste ejemplos:",
    rawIntro: "Así se escribe en el idioma del telar:",
    rawLegend: "«0:» si es cero · «S» suma uno · «@» vuelve a empezar · «*» devuelve lo que quede",
    notfound:
      "No existe ninguna receta, hasta el tamaño que exploramos, que cumpla todos esos ejemplos a la vez. O se contradicen entre sí, o piden algo que este mini-lenguaje no sabe decir — solo sabe contar y repetir. Antes que inventarse una respuesta, esta página prefiere decírtelo.",
    addPair: "añadir ejemplo",
    delPair: "quitar ejemplo",
    raceh2: "El truco: compartir el trabajo.",
    racelead:
      "Un encargo deliberadamente absurdo: negar una afirmación 2^N veces seguidas. La forma clásica de computar — la de casi todo el software que usas — hace el trabajo de cada negación, una a una. El paradigma del telar se da cuenta de que casi todas las pasadas son idénticas… y las teje una sola vez. Mueve N y compara. Los dos contadores salen de ejecuciones reales, en tu navegador, ahora.",
    raceNote:
      "(Los expertos llaman a estos dos mundos «λ-cálculo» y «evaluación óptima de redes de interacción». Los nombres dan igual por ahora; la diferencia entre las dos columnas, no.)",
    gorace: "Hacerlo de verdad",
    passes: "negaciones",
    naivelbl: "pasos, haciéndolo una a una (método clásico)",
    iclbl: "pasos, compartiendo el trabajo (el telar)",
    dnfA: "se rinde: harían falta",
    dnfB: "pasos",
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
    cta: "See what it can do",
    hint: "scroll",
    minerh2: "Give it examples. Get the recipe.",
    minerIntro:
      "A function is a number machine: one goes in, another comes out. Normally a programmer writes the recipe by hand. Not here. You give a few input–output examples, and the page finds, by itself, the shortest recipe that fits them all — by trying the entire space of possible recipes at once. (That “all at once” is called a superposition; the trick that makes it possible is a bit further down.)",
    minersub:
      "No artificial intelligence and no tricks: the recipe found fits your examples always, by construction.",
    run: "Sift the space of recipes",
    running: "Sifting…",
    outidle:
      "These four examples say “double it”. Press the button — or change the numbers and invent your own function.",
    foundHead: "The shortest recipe that fits your examples:",
    foundProven: "and it is proven that no shorter one exists",
    foundBest: "the shortest found as far as we explored",
    pieces: "pieces",
    foundIn: "found in",
    sharedSteps: "steps of work, shared across all candidates",
    verify: "And it generalizes — watch it work where you gave no examples:",
    rawIntro: "This is how it is written in the loom's own language:",
    rawLegend: "“0:” if zero · “S” add one · “@” start over · “*” return what remains",
    notfound:
      "No recipe exists, up to the size we explore, that fits all those examples at once. Either they contradict each other, or they ask for something this mini-language cannot say — it only knows how to count and repeat. Rather than make up an answer, this page prefers to tell you.",
    addPair: "add example",
    delPair: "remove example",
    raceh2: "The trick: sharing the work.",
    racelead:
      "A deliberately absurd job: negate a statement 2^N times in a row. The classic way of computing — the one behind almost all the software you use — does the work of each negation, one by one. The loom paradigm notices that almost every pass is identical… and weaves it once. Move N and compare. Both counters come from real executions, in your browser, now.",
    raceNote:
      "(Experts call these two worlds “λ-calculus” and “optimal evaluation of interaction nets”. The names don't matter yet; the difference between the two columns does.)",
    gorace: "Do it for real",
    passes: "negations",
    naivelbl: "steps, doing it one by one (the classic way)",
    iclbl: "steps, sharing the work (the loom)",
    dnfA: "gives up: it would take",
    dnfB: "steps",
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
