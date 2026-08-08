// Traductor de programas Peanito a pseudocódigo humano (ES/EN).
// La salida del minador nunca se muestra "en crudo" primero: esta versión
// legible es la capa principal; la notación del telar es la curiosidad final.
//
// Sin variables inventadas: los match anidados sobre el predecesor se aplanan
// a casos directos sobre n («si n = 2», «si n ≥ 3», «f(n − 3)»). La notación
// de pattern-matching (si n = m + 1) es jeroglífico para quien no programa
// en funcional — y este texto es para quien no programa en funcional.
//
//   Mat(Zero, Mat(Suc Zero, Mat(SS Zero, Rec)))  →   f(n):
//                                                      si n = 0: devuelve 0
//                                                      si n = 1: devuelve 1
//                                                      si n = 2: devuelve 2
//                                                      si n ≥ 3: devuelve f(n − 3)

import type { Term } from "./peanito.ts";

interface Words {
  eq: (d: number) => string;
  ge: (d: number) => string;
  ret: (e: string) => string;
  addTo: (k: number) => string;
  fn: string;
  n: string;
}

const WORDS: Record<"es" | "en", Words> = {
  es: {
    eq: (d) => `si n = ${d}:`,
    ge: (d) => `si n ≥ ${d}:`,
    ret: (e) => `devuelve ${e}`,
    addTo: (k) => `suma ${k} a lo que salga de:`,
    fn: "f",
    n: "n",
  },
  en: {
    eq: (d) => `if n = ${d}:`,
    ge: (d) => `if n ≥ ${d}:`,
    ret: (e) => `return ${e}`,
    addTo: (k) => `add ${k} to the result of:`,
    fn: "f",
    n: "n",
  },
};

type Rendered = { kind: "expr"; s: string } | { kind: "block"; lines: string[] };

function indent(lines: string[]): string[] {
  return lines.map((l) => "  " + l);
}

/** El valor actual a profundidad d: n, n − d, o 0 exacto en rama de cero. */
function value(d: number, isZero: boolean, w: Words): string {
  if (isZero) return "0";
  return d === 0 ? w.n : `${w.n} − ${d}`;
}

function render(t: Term, d: number, isZero: boolean, w: Words): Rendered {
  switch (t.t) {
    case "Ret":
      return { kind: "expr", s: value(d, isZero, w) };
    case "Rec":
      return { kind: "expr", s: `${w.fn}(${value(d, isZero, w)})` };
    case "Zero":
      return { kind: "expr", s: "0" };
    case "Suc": {
      let k = 0;
      let inner: Term = t;
      while (inner.t === "Suc") {
        k++;
        inner = inner.body;
      }
      const r = render(inner, d, isZero, w);
      if (r.kind === "expr") {
        return { kind: "expr", s: r.s === "0" ? String(k) : `${k} + ${r.s}` };
      }
      return { kind: "block", lines: [w.addTo(k), ...indent(r.lines)] };
    }
    case "Mat": {
      // en una rama de cero el valor ES 0: solo su rama de cero puede ocurrir
      if (isZero) return render(t.zero, d, true, w);
      const lines: string[] = [
        w.eq(d),
        ...indent(asBlock(render(t.zero, d, true, w), w)),
      ];
      if (t.succ.t === "Mat") {
        // el siguiente match refina los casos: sus condiciones ya bastan
        const sub = render(t.succ, d + 1, false, w);
        lines.push(...(sub as { lines: string[] }).lines);
      } else {
        lines.push(w.ge(d + 1), ...indent(asBlock(render(t.succ, d + 1, false, w), w)));
      }
      return { kind: "block", lines };
    }
    case "Sup":
      throw new Error("explain() espera un programa concreto (sin Sup)");
  }
}

function asBlock(r: Rendered, w: Words): string[] {
  return r.kind === "expr" ? [w.ret(r.s)] : r.lines;
}

/** Pseudocódigo humano, multilínea. */
export function explain(term: Term, lang: "es" | "en"): string {
  const w = WORDS[lang];
  const body = asBlock(render(term, 0, false, w), w);
  return [`${w.fn}(${w.n}):`, ...indent(body)].join("\n");
}

// ---------------------------------------------------------------------------
// Vista «como el cribador»: pattern-matching con variables frescas (m, k, j…).
// Es la forma nativa en que Peanito piensa — se ofrece como tercera vista,
// con nota, para quien quiera asomarse a la maquinaria.
// ---------------------------------------------------------------------------

const PVARS = ["n", "m", "k", "j", "i", "h"];

interface PWords {
  ifZero: (v: string) => string;
  ifSucc: (v: string, w: string) => string;
  ret: (e: string) => string;
  addTo: (k: number) => string;
  fn: string;
}

const PWORDS: Record<"es" | "en", PWords> = {
  es: {
    ifZero: (v) => `si ${v} = 0:`,
    ifSucc: (v, w) => `si ${v} = ${w} + 1:`,
    ret: (e) => `devuelve ${e}`,
    addTo: (k) => `suma ${k} a lo que salga de:`,
    fn: "f",
  },
  en: {
    ifZero: (v) => `if ${v} = 0:`,
    ifSucc: (v, w) => `if ${v} = ${w} + 1:`,
    ret: (e) => `return ${e}`,
    addTo: (k) => `add ${k} to the result of:`,
    fn: "f",
  },
};

function prender(t: Term, vi: number, isZero: boolean, w: PWords): Rendered {
  const v = PVARS[Math.min(vi, PVARS.length - 1)]!;
  switch (t.t) {
    case "Ret":
      return { kind: "expr", s: isZero ? "0" : v };
    case "Rec":
      return { kind: "expr", s: `${w.fn}(${isZero ? "0" : v})` };
    case "Zero":
      return { kind: "expr", s: "0" };
    case "Suc": {
      let k = 0;
      let inner: Term = t;
      while (inner.t === "Suc") {
        k++;
        inner = inner.body;
      }
      const r = prender(inner, vi, isZero, w);
      if (r.kind === "expr") {
        return { kind: "expr", s: r.s === "0" ? String(k) : `${k} + ${r.s}` };
      }
      return { kind: "block", lines: [w.addTo(k), ...indent(r.lines)] };
    }
    case "Mat": {
      const next = PVARS[Math.min(vi + 1, PVARS.length - 1)]!;
      const zero = pblock(prender(t.zero, vi, true, w), w);
      const succ = pblock(prender(t.succ, vi + 1, false, w), w);
      return {
        kind: "block",
        lines: [w.ifZero(v), ...indent(zero), w.ifSucc(v, next), ...indent(succ)],
      };
    }
    case "Sup":
      throw new Error("explainPatterns() espera un programa concreto (sin Sup)");
  }
}

function pblock(r: Rendered, w: PWords): string[] {
  return r.kind === "expr" ? [w.ret(r.s)] : r.lines;
}

/** La vista de pattern-matching (m, k, j…): así piensa el cribador. */
export function explainPatterns(term: Term, lang: "es" | "en"): string {
  const w = PWORDS[lang];
  const body = pblock(prender(term, 0, false, w), w);
  return [`${w.fn}(${PVARS[0]}):`, ...indent(body)].join("\n");
}
