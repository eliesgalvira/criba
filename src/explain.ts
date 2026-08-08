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

// ---------------------------------------------------------------------------
// Vista «instrucciones»: SIN recursión. Todo programa Peanito es exactamente
// «apunta al total y repite con un n más pequeño», así que se puede contar
// como un bucle de instrucciones — la forma más llana que existe.
// ---------------------------------------------------------------------------

interface LWords {
  start: string;
  repeat: string;
  eq: (d: number) => string;
  ge: (d: number) => string;
  stop: string;
  addTotal: (e: string) => string;
  again: (e: string) => string;
  result: string;
  resultIs: (e: string) => string;
  and: string;
}

const LWORDS: Record<"es" | "en", LWords> = {
  es: {
    start: "empieza: total = 0",
    repeat: "repite:",
    eq: (d) => `si n = ${d}`,
    ge: (d) => `si n ≥ ${d}`,
    stop: "párate",
    addTotal: (e) => `suma ${e} al total`,
    again: (e) => `otra vez con n = ${e}`,
    result: "al pararte, el resultado es el total",
    resultIs: (e) => `el resultado es ${e}, tal cual`,
    and: "y",
  },
  en: {
    start: "start: total = 0",
    repeat: "repeat:",
    eq: (d) => `if n = ${d}`,
    ge: (d) => `if n ≥ ${d}`,
    stop: "stop",
    addTotal: (e) => `add ${e} to the total`,
    again: (e) => `again with n = ${e}`,
    result: "when you stop, the result is the total",
    resultIs: (e) => `the result is ${e}, as is`,
    and: "and",
  },
};

/** La acción de una hoja: qué sumar y si parar o repetir. */
function leafAction(t: Term, d: number, isZero: boolean, w: LWords): string {
  let k = 0;
  let inner: Term = t;
  while (inner.t === "Suc") {
    k++;
    inner = inner.body;
  }
  const val = isZero ? "0" : d === 0 ? "n" : `n − ${d}`;
  const adds: string[] = [];
  if (k > 0) adds.push(String(k));
  let tail: string;
  switch (inner.t) {
    case "Zero":
      tail = w.stop;
      break;
    case "Ret":
      if (!isZero) adds.push(val);
      tail = w.stop;
      break;
    case "Rec":
      tail = w.again(val);
      break;
    default:
      throw new Error("hoja inesperada");
  }
  const parts: string[] = [];
  if (adds.length) parts.push(w.addTotal(adds.join(" + ")));
  parts.push(tail);
  return parts.join(` ${w.and} `);
}

function lrender(t: Term, d: number, isZero: boolean, w: LWords): string[] {
  if (isZero && t.t === "Mat") return lrender(t.zero, d, true, w);
  if (t.t !== "Mat") return [leafAction(t, d, isZero, w)];
  const lines: string[] = [`${w.eq(d)} → ${lrender(t.zero, d, true, w).join("; ")}`];
  if (t.succ.t === "Mat") lines.push(...lrender(t.succ, d + 1, false, w));
  else lines.push(`${w.ge(d + 1)} → ${lrender(t.succ, d + 1, false, w).join("; ")}`);
  return lines;
}

/** Pseudocódigo sin recursión: bucle de apuntar y repetir. */
export function explainLoop(term: Term, lang: "es" | "en"): string {
  const w = LWORDS[lang];
  if (term.t !== "Mat") {
    // sin casos no hay bucle: es una fórmula directa
    const a = leafAction(term, 0, false, w);
    if (a === w.stop) return w.resultIs("0");
    if (!a.includes(w.again("n"))) {
      const m = a.replace(` ${w.and} ${w.stop}`, "").replace(w.addTotal(""), "");
      // «suma X al total y párate» sin bucle = el resultado es X
      const expr = a.startsWith(w.addTotal("").slice(0, 4))
        ? a.slice(a.indexOf(" ") + 1).replace(` al total ${w.and} ${w.stop}`, "")
          .replace(` to the total ${w.and} ${w.stop}`, "")
        : m;
      return w.resultIs(expr);
    }
  }
  const body = lrender(term, 0, false, w);
  return [w.start, w.repeat, ...body.map((l) => "  " + l), w.result].join("\n");
}
