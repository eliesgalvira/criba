// Criba — minar programas Peanito por ejemplos, con dos motores:
//
//   Copenhague: colapsa primero, observa después — aplana el árbol superpuesto
//     en un stream de programas concretos y los prueba universo a universo.
//
//   Everett: evalúa todos los universos a la vez — recorre el árbol con las
//     superposiciones dentro, decidiendo cada etiqueta con pereza; las ramas
//     comparten evaluación y un ejemplo que falla poda familias enteras.
//
// Port directo (verificado) de kolmo.py (Python) a TypeScript.

import {
  type Example,
  fits,
  Mat,
  Rec,
  Ret,
  run,
  show,
  size,
  Suc,
  Sup,
  type Term,
  Zero,
} from "./peanito.ts";

// ---------------------------------------------------------------------------
// Enumerador superpuesto
// ---------------------------------------------------------------------------

/** Árbol superpuesto finito con todos los programas de profundidad ≤ depth. */
export function enumerate(allowRec: boolean, depth: number): Term {
  if (depth <= 0) {
    const leaf = Sup(Ret, Zero);
    return allowRec ? Sup(Rec, leaf) : leaf;
  }
  const constructors = Sup(Zero, Suc(enumerate(allowRec, depth - 1)));
  const eliminators = Mat(enumerate(true, depth - 1), enumerate(true, depth - 1));
  const body = Sup(Ret, Sup(constructors, eliminators));
  return allowRec ? Sup(Rec, body) : body;
}

/** Igual, pero cada Sup lleva etiqueta única: Everett decide cada una UNA vez. */
export function enumerateLabeled(allowRec: boolean, depth: number, fresh: { n: number }): Term {
  const sup = (a: Term, b: Term) => Sup(a, b, fresh.n++);
  if (depth <= 0) {
    const leaf = sup(Ret, Zero);
    return allowRec ? sup(Rec, leaf) : leaf;
  }
  const constructors = sup(Zero, Suc(enumerateLabeled(allowRec, depth - 1, fresh)));
  const eliminators = Mat(
    enumerateLabeled(true, depth - 1, fresh),
    enumerateLabeled(true, depth - 1, fresh),
  );
  const body = sup(Ret, sup(constructors, eliminators));
  return allowRec ? sup(Rec, body) : body;
}

// ---------------------------------------------------------------------------
// Copenhague: collapse perezoso (diagonal justa) + prueba candidato a candidato
// ---------------------------------------------------------------------------

function* interleave(a: Generator<Term>, b: Generator<Term>): Generator<Term> {
  const gens = [a, b];
  while (gens.length) {
    for (let i = 0; i < gens.length; i++) {
      const r = gens[i]!.next();
      if (r.done) gens.splice(i--, 1);
      else yield r.value;
    }
  }
}

/** Producto Cantor-diagonal de dos streams; justo aunque sean enormes. */
function* pairs(agen: Generator<Term>, bgen: Generator<Term>): Generator<[Term, Term]> {
  const xs: Term[] = [];
  const ys: Term[] = [];
  let aDone = false;
  let bDone = false;
  for (let d = 0;; d++) {
    if (!aDone) {
      const r = agen.next();
      if (r.done) aDone = true;
      else xs.push(r.value);
    }
    if (!bDone) {
      const r = bgen.next();
      if (r.done) bDone = true;
      else ys.push(r.value);
    }
    for (let i = 0; i <= d; i++) {
      const j = d - i;
      if (i < xs.length && j < ys.length) yield [xs[i]!, ys[j]!];
    }
    if (aDone && bDone && d >= xs.length + ys.length - 2) return;
  }
}

/** Aplana un término superpuesto en sus programas concretos, con pereza. */
export function* collapse(term: Term): Generator<Term> {
  switch (term.t) {
    case "Ret":
    case "Rec":
    case "Zero":
      yield term;
      return;
    case "Suc":
      for (const b of collapse(term.body)) yield Suc(b);
      return;
    case "Mat":
      for (const [z, s] of pairs(collapse(term.zero), collapse(term.succ))) yield Mat(z, s);
      return;
    case "Sup":
      yield* interleave(collapse(term.left), collapse(term.right));
      return;
  }
}

export interface CopenhagueResult {
  prog: Term | null;
  tested: number;
}

/**
 * Camina el espacio colapsado buscando el programa mínimo que cumple los
 * ejemplos. Tras el primer acierto termina de barrer esa profundidad y se
 * queda con el más pequeño (garantía: size ≥ depth + 1 acota lo no visto).
 */
export function copenhague(examples: readonly Example[], limit = 50_000): CopenhagueResult {
  const seen = new Set<string>();
  let tested = 0;
  let best: { sz: number; prog: Term } | null = null;
  for (let depth = 0; depth < 12; depth++) {
    for (const p of collapse(enumerate(false, depth))) {
      const key = show(p);
      if (seen.has(key)) continue;
      seen.add(key);
      if (best && size(p) >= best.sz) continue;
      if (tested >= limit) return { prog: best?.prog ?? null, tested };
      tested++;
      if (fits(p, examples)) best = { sz: size(p), prog: p };
    }
    if (best) return { prog: best.prog, tested };
  }
  return { prog: null, tested };
}

// ---------------------------------------------------------------------------
// Everett: evaluación superpuesta con poda por ejemplo
// ---------------------------------------------------------------------------

type Env = Map<number, 0 | 1>;

export interface EverettStats {
  steps: number;
  depthFound: number | null;
  provenMinimal: boolean;
  budgetExhausted: boolean;
  familiesSurviving: number;
}

export interface EverettResult {
  prog: Term | null;
  stats: EverettStats;
}

class BudgetExhausted extends Error {}

/** Todas las extensiones de env bajo las que el árbol superpuesto lleva x a y. */
function check(
  prog: Term,
  x0: number,
  y: number,
  env0: Env,
  fuel0: number,
  stats: EverettStats,
  budget: number,
): Env[] {
  const out: Env[] = [];
  const work: [Term, number, number, Env, number][] = [[prog, x0, 0, env0, fuel0]];
  while (work.length) {
    let [t, cx, pend, env, fuel] = work.pop()!;
    inner: while (fuel > 0) {
      fuel--;
      stats.steps++;
      if (stats.steps > budget) throw new BudgetExhausted();
      switch (t.t) {
        case "Sup": {
          const c = env.get(t.label);
          if (c === undefined) {
            const right = new Map(env);
            right.set(t.label, 1);
            work.push([t.right, cx, pend, right, fuel]);
            env = new Map(env);
            env.set(t.label, 0);
            t = t.left;
          } else {
            t = c === 0 ? t.left : t.right;
          }
          continue;
        }
        case "Ret":
          if (cx + pend === y) out.push(env);
          break inner;
        case "Zero":
          if (pend === y) out.push(env);
          break inner;
        case "Rec":
          t = prog;
          continue;
        case "Suc":
          pend++;
          if (pend > y) break inner; // la salida ya supera el objetivo: poda
          t = t.body;
          continue;
        case "Mat":
          if (cx === 0) t = t.zero;
          else {
            cx--;
            t = t.succ;
          }
          continue;
      }
    }
    // fuel agotado → esta familia no demuestra el ejemplo: poda
  }
  return out;
}

/** Programa concreto mínimo consistente con las etiquetas decididas. */
function minCompletion(t: Term, env: Env): { sz: number; prog: Term } {
  switch (t.t) {
    case "Sup": {
      const c = env.get(t.label);
      if (c === 0) return minCompletion(t.left, env);
      if (c === 1) return minCompletion(t.right, env);
      const l = minCompletion(t.left, env);
      const r = minCompletion(t.right, env);
      return l.sz <= r.sz ? l : r;
    }
    case "Ret":
    case "Rec":
    case "Zero":
      return { sz: 1, prog: t };
    case "Suc": {
      const b = minCompletion(t.body, env);
      return { sz: 1 + b.sz, prog: Suc(b.prog) };
    }
    case "Mat": {
      const z = minCompletion(t.zero, env);
      const s = minCompletion(t.succ, env);
      return { sz: 1 + z.sz + s.sz, prog: Mat(z.prog, s.prog) };
    }
  }
}

/**
 * Busca evaluando el árbol superpuesto directamente contra los ejemplos.
 * stats.provenMinimal es true cuando la cota tamaño/profundidad cierra la
 * prueba de que no existe programa menor a ninguna profundidad.
 */
export function everett(
  examples: readonly Example[],
  maxDepth = 6,
  budget = 20_000_000,
): EverettResult {
  const stats: EverettStats = {
    steps: 0,
    depthFound: null,
    provenMinimal: false,
    budgetExhausted: false,
    familiesSurviving: 0,
  };
  let best: { sz: number; prog: Term } | null = null;
  try {
    for (let depth = 0; depth <= maxDepth; depth++) {
      const tree = enumerateLabeled(false, depth, { n: 0 });
      let survivors: Env[] = [new Map()];
      for (const [x, y] of examples) {
        const fuel = 4 * (x + 2) * (depth + 4) + y + 64;
        const next: Env[] = [];
        for (const env of survivors) next.push(...check(tree, x, y, env, fuel, stats, budget));
        survivors = next;
        if (!survivors.length) break;
      }
      for (const env of survivors) {
        const c = minCompletion(tree, env);
        if (!best || c.sz < best.sz) {
          best = c;
          stats.depthFound = depth;
        }
      }
      stats.familiesSurviving = survivors.length;
      if (best && best.sz <= depth + 2) {
        stats.provenMinimal = true;
        break;
      }
    }
  } catch (e) {
    if (e instanceof BudgetExhausted) stats.budgetExhausted = true;
    else throw e;
  }
  return { prog: best?.prog ?? null, stats };
}
