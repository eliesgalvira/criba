// Traductor de programas Peanito a pseudocódigo humano (ES/EN).
// La salida del minador nunca se muestra "en crudo" primero: esta receta
// legible es la capa principal; la notación del telar es la curiosidad final.
//
//   Mat(Zero, Suc(Suc(Rec)))  →   f(n):
//                                   si n = 0:
//                                     devuelve 0
//                                   si n = m + 1:
//                                     devuelve 2 + f(m)

import type { Term } from "./peanito.ts";

const VARS = ["n", "m", "k", "j", "i", "h"];

interface Words {
  ifZero: (v: string) => string;
  ifSucc: (v: string, w: string) => string;
  ret: (e: string) => string;
  addTo: (k: number) => string;
  fn: string;
}

const WORDS: Record<"es" | "en", Words> = {
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

type Rendered = { kind: "expr"; s: string } | { kind: "block"; lines: string[] };

function indent(lines: string[]): string[] {
  return lines.map((l) => "  " + l);
}

/**
 * v = nombre de la variable actual; isZero = estamos en una rama donde v vale 0
 * (ahí «la entrada» es literalmente 0 y se muestra como tal).
 */
function render(t: Term, v: string, depth: number, isZero: boolean, w: Words): Rendered {
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
      const r = render(inner, v, depth, isZero, w);
      if (r.kind === "expr") {
        return { kind: "expr", s: r.s === "0" ? String(k) : `${k} + ${r.s}` };
      }
      return { kind: "block", lines: [w.addTo(k), ...indent(r.lines)] };
    }
    case "Mat": {
      const next = VARS[Math.min(depth + 1, VARS.length - 1)]!;
      const zero = asBlock(render(t.zero, v, depth, true, w), w);
      const succ = asBlock(render(t.succ, next, depth + 1, false, w), w);
      return {
        kind: "block",
        lines: [w.ifZero(v), ...indent(zero), w.ifSucc(v, next), ...indent(succ)],
      };
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
  const body = asBlock(render(term, VARS[0]!, 0, false, w), w);
  return [`${w.fn}(${VARS[0]}):`, ...indent(body)].join("\n");
}
