// Traza de un programa Peanito sobre un número concreto: la representación
// más novata de todas. No explica la regla — la enseña corriendo, que es como
// la didáctica de programación introduce la recursión (primero trazar, luego
// abstraer). Cada paso es «con v: apunta +a y sigue con v′»; al final, la
// cuenta de lo apuntado.

import type { Term } from "./peanito.ts";

export interface TraceStep {
  /** valor al entrar en esta pasada */
  v: number;
  /** cuánto apunta esta pasada (sucesores acumulados) */
  add: number;
  /** con qué valor sigue (null = esta pasada termina) */
  next: number | null;
  /** si termina: el valor base que devuelve (además de lo apuntado) */
  base?: number;
}

export interface Trace {
  steps: TraceStep[];
  total: number;
}

/** null si el programa diverge o la traza excede maxSteps pasadas. */
export function trace(prog: Term, n: number, maxSteps = 24): Trace | null {
  const steps: TraceStep[] = [];
  let v = n;
  let total = 0;
  for (let s = 0; s <= maxSteps; s++) {
    let t: Term = prog;
    let x = v;
    let add = 0;
    let fuel = 10_000;
    inner: while (fuel-- > 0) {
      switch (t.t) {
        case "Ret":
          steps.push({ v, add, next: null, base: x });
          total += add + x;
          return { steps, total };
        case "Zero":
          steps.push({ v, add, next: null, base: 0 });
          total += add;
          return { steps, total };
        case "Suc":
          add++;
          t = t.body;
          continue;
        case "Mat":
          if (x === 0) t = t.zero;
          else {
            x--;
            t = t.succ;
          }
          continue;
        case "Rec":
          steps.push({ v, add, next: x });
          total += add;
          v = x;
          break inner;
        case "Sup":
          throw new Error("trace() espera un programa concreto (sin Sup)");
      }
    }
    if (fuel <= 0) return null;
  }
  return null;
}

/** Un número de entrada ilustrativo: traza corta pero con chicha (2–6 pasadas). */
export function pickTraceInput(prog: Term, candidates: number[]): number | null {
  let fallback: number | null = null;
  for (const n of candidates) {
    const tr = trace(prog, n);
    if (!tr) continue;
    if (fallback === null) fallback = n;
    if (tr.steps.length >= 2 && tr.steps.length <= 6) return n;
  }
  return fallback;
}
