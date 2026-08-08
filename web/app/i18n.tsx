// i18n mínima de autor (ES/EN). GT se evaluará en build-time cuando el copy crezca.
import { createContext, useContext } from "react";

export type Lang = "es" | "en";

export interface Strings {
  h1a: string;
  h1hilo: string;
  h1b: string;
  h1sub: string;
  cta: string;
  hint: string;
  minerh2: string;
  minersub: string;
  run: string;
  running: string;
  outidle: string;
  found: string;
  foundProven: string;
  foundBest: string;
  nodes: string;
  steps: string;
  notfound: string;
  verify: string;
  addPair: string;
  delPair: string;
  raceh2: string;
  racelead: string;
  gorace: string;
  naivelbl: string;
  iclbl: string;
  dnf: string;
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
    h1sub:
      "El telar de Jacquard fue la primera máquina programable. Doscientos años después, un paradigma teje programas — y esta tela se está tejiendo ahora, en tu navegador.",
    cta: "Dame 60 segundos ↓",
    hint: "desliza",
    minerh2: "Dale ejemplos. Recibe el programa.",
    minersub:
      "Sin modelo. Sin entrenamiento. Correcto por construcción. Corre entero en tu navegador.",
    run: "Cribar el espacio de programas",
    running: "Cribando…",
    outidle: "La salida aparecerá aquí — prueba con f(n) = 2n, o inventa la tuya.",
    found: "Programa mínimo hallado",
    foundProven: "minimalidad probada",
    foundBest: "el menor encontrado",
    nodes: "nodos",
    steps: "pasos de evaluación compartidos",
    notfound:
      "No hay ningún programa (hasta profundidad 5) que cumpla esos ejemplos. O son inconsistentes, o la función no es expresable en este mini-lenguaje — que solo sabe de recursión estructural. Honestidad ante todo.",
    verify: "Comprobación fuera de los ejemplos:",
    addPair: "añadir ejemplo",
    delPair: "quitar ejemplo",
    raceh2: "El mismo cómputo, dos telas.",
    racelead:
      "Aplicar «not» 2^N veces a «true». El λ-cálculo clásico repite cada pasada; el cálculo de interacciones comparte la trama, y el coste cae de exponencial a lineal. Los dos números salen de ejecuciones reales, aquí, ahora.",
    gorace: "Tejer 2^N pasadas",
    naivelbl: "β-reducciones · λ-cálculo naive",
    iclbl: "interacciones · cálculo de interacciones",
    dnf: "no termina (presupuesto agotado)",
    honh2: "Etiqueta: lo que esta tela no es",
    hon: [
      [
        "No computa lo incomputable.",
        " Misma clase de Church-Turing; cambia el coste, no el poder.",
      ],
      [
        "No es más rápida en tu código de cada día.",
        " Hoy, un bucle en C le gana. La ventaja vive en lo simbólico: buscar, invertir, demostrar.",
      ],
      ["No es cuántica.", " Las «superposiciones» comparten estructura; no hay qubits ni magia."],
      [
        "El lienzo del fondo es una maqueta visual.",
        " Los números del minador y de la carrera, en cambio, salen de ejecuciones reales en esta página.",
      ],
    ],
    foot1: "Prototipo — proyecto de divulgación sobre el Interaction Calculus de Victor Taelin.",
    foot2: "Todo el código es legible de arriba abajo: motor, minador y esta página.",
  },
  en: {
    h1a: "To compute is to weave ",
    h1hilo: "threads",
    h1b: " that recombine.",
    h1sub:
      "The Jacquard loom was the first programmable machine. Two hundred years later, a paradigm weaves programs — and this cloth is being woven right now, in your browser.",
    cta: "Give me 60 seconds ↓",
    hint: "scroll",
    minerh2: "Give it examples. Get the program.",
    minersub: "No model. No training. Correct by construction. Runs entirely in your browser.",
    run: "Sift the space of programs",
    running: "Sifting…",
    outidle: "Output will appear here — try f(n) = 2n, or invent your own.",
    found: "Minimal program found",
    foundProven: "minimality proven",
    foundBest: "smallest found",
    nodes: "nodes",
    steps: "shared evaluation steps",
    notfound:
      "No program (up to depth 5) fits those examples. Either they are inconsistent, or the function is not expressible in this mini-language — which only knows structural recursion. Honesty first.",
    verify: "Checking beyond your examples:",
    addPair: "add example",
    delPair: "remove example",
    raceh2: "The same computation, two cloths.",
    racelead:
      "Apply “not” 2^N times to “true”. Classic λ-calculus repeats every pass; the interaction calculus shares the weft, and the cost drops from exponential to linear. Both numbers come from real runs, here, now.",
    gorace: "Weave 2^N passes",
    naivelbl: "β-reductions · naive λ-calculus",
    iclbl: "interactions · interaction calculus",
    dnf: "does not finish (budget exhausted)",
    honh2: "Garment tag: what this cloth is not",
    hon: [
      [
        "It does not compute the uncomputable.",
        " Same Church-Turing class; the cost changes, not the power.",
      ],
      [
        "It is not faster at your everyday code.",
        " Today, a C loop beats it. The advantage lives in the symbolic: searching, inverting, proving.",
      ],
      ["It is not quantum.", " “Superpositions” share structure; no qubits, no magic."],
      [
        "The background canvas is a visual mock.",
        " The miner and race numbers, however, come from real executions on this page.",
      ],
    ],
    foot1: "Prototype — an outreach project about Victor Taelin's Interaction Calculus.",
    foot2: "All the code is readable top to bottom: engine, miner, and this page.",
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
