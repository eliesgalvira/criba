// Telar — runtime del Interaction Calculus de Victor Taelin, en TypeScript.
// Port tipado del gist de referencia (ic.hs) y del spec del repo
// VictorTaelin/Interaction-Calculus. Un telar teje y recombina hilos:
// exactamente lo que hace la reducción con los cables de una interaction net.
//
// Términos:  Var | Era(*) | Lam(λx.b) | App(f a) | Sup &L{a,b} | Dup !&L{x,y}=v;b
// Variables afines y globales → sustitución = una escritura en un mapa global.

export type Name = number;

export type ICTerm =
  | { t: "Var"; n: Name }
  | { t: "Era" }
  | { t: "Lam"; n: Name; b: ICTerm }
  | { t: "App"; f: ICTerm; a: ICTerm }
  | { t: "Sup"; l: number; a: ICTerm; b: ICTerm }
  | { t: "Dup"; l: number; x: Name; y: Name; v: ICTerm; k: ICTerm };

export const Var = (n: Name): ICTerm => ({ t: "Var", n });
export const Era: ICTerm = { t: "Era" };
export const Lam = (n: Name, b: ICTerm): ICTerm => ({ t: "Lam", n, b });
export const App = (f: ICTerm, a: ICTerm): ICTerm => ({ t: "App", f, a });
export const Sup = (l: number, a: ICTerm, b: ICTerm): ICTerm => ({ t: "Sup", l, a, b });
export const Dup = (l: number, x: Name, y: Name, v: ICTerm, k: ICTerm): ICTerm => ({
  t: "Dup",
  l,
  x,
  y,
  v,
  k,
});

/** Estado de una máquina Telar: sustituciones, nombres frescos y contador. */
export class Telar {
  subst = new Map<Name, ICTerm>();
  private nextName = 0;
  interactions = 0;

  fresh(): Name {
    return this.nextName++;
  }

  /** Weak head normal form. Cada interacción del spec incrementa el contador. */
  whnf(term: ICTerm): ICTerm {
    for (;;) {
      switch (term.t) {
        case "Var": {
          const s = this.subst.get(term.n);
          if (s === undefined) return term;
          term = s;
          continue;
        }
        case "App": {
          const f = this.whnf(term.f);
          switch (f.t) {
            case "Lam": // APP-LAM (β)
              this.interactions++;
              this.subst.set(f.n, term.a);
              term = f.b;
              continue;
            case "Sup": { // APP-SUP
              this.interactions++;
              const c0 = this.fresh();
              const c1 = this.fresh();
              term = Dup(
                f.l,
                c0,
                c1,
                term.a,
                Sup(f.l, App(f.a, Var(c0)), App(f.b, Var(c1))),
              );
              continue;
            }
            case "Era": // APP-ERA
              this.interactions++;
              return Era;
            case "Dup": // APP-DUP (permutación)
              this.interactions++;
              term = Dup(f.l, f.x, f.y, f.v, App(f.k, term.a));
              continue;
            default:
              return App(f, term.a);
          }
        }
        case "Dup": {
          const v = this.whnf(term.v);
          switch (v.t) {
            case "Lam": { // DUP-LAM
              this.interactions++;
              const x0 = this.fresh();
              const x1 = this.fresh();
              const f0 = this.fresh();
              const f1 = this.fresh();
              this.subst.set(term.x, Lam(x0, Var(f0)));
              this.subst.set(term.y, Lam(x1, Var(f1)));
              this.subst.set(v.n, Sup(term.l, Var(x0), Var(x1)));
              term = Dup(term.l, f0, f1, v.b, term.k);
              continue;
            }
            case "Sup": { // DUP-SUP
              this.interactions++;
              if (term.l === v.l) {
                this.subst.set(term.x, v.a);
                this.subst.set(term.y, v.b);
                term = term.k;
              } else {
                const a0 = this.fresh();
                const a1 = this.fresh();
                const b0 = this.fresh();
                const b1 = this.fresh();
                this.subst.set(term.x, Sup(v.l, Var(a0), Var(b0)));
                this.subst.set(term.y, Sup(v.l, Var(a1), Var(b1)));
                term = Dup(term.l, a0, a1, v.a, Dup(term.l, b0, b1, v.b, term.k));
              }
              continue;
            }
            case "Era": // DUP-ERA
              this.interactions++;
              this.subst.set(term.x, Era);
              this.subst.set(term.y, Era);
              term = term.k;
              continue;
            case "Dup": // DUP-DUP (permutación)
              term = Dup(v.l, v.x, v.y, v.v, Dup(term.l, term.x, term.y, v.k, term.k));
              continue;
            default:
              return Dup(term.l, term.x, term.y, v, term.k);
          }
        }
        default:
          return term;
      }
    }
  }

  /** Forma normal completa (whnf recursivo). */
  normal(term: ICTerm): ICTerm {
    const q = this.whnf(term);
    switch (q.t) {
      case "Lam":
        return Lam(q.n, this.normal(q.b));
      case "App":
        return App(this.normal(q.f), this.normal(q.a));
      case "Sup":
        return Sup(q.l, this.normal(q.a), this.normal(q.b));
      case "Dup":
        return Dup(q.l, q.x, q.y, this.normal(q.v), this.normal(q.k));
      default:
        return q;
    }
  }
}

export function showIC(term: ICTerm, names = new Map<Name, string>()): string {
  const nm = (n: Name): string => {
    let s = names.get(n);
    if (!s) {
      const i = names.size;
      s = "abcdefghijklmnopqrstuvwxyz"[i % 26]! + (i >= 26 ? String(Math.floor(i / 26)) : "");
      names.set(n, s);
    }
    return s;
  };
  switch (term.t) {
    case "Var":
      return nm(term.n);
    case "Era":
      return "*";
    case "Lam":
      return `λ${nm(term.n)}.${showIC(term.b, names)}`;
    case "App":
      return `(${showIC(term.f, names)} ${showIC(term.a, names)})`;
    case "Sup":
      return `&${term.l}{${showIC(term.a, names)},${showIC(term.b, names)}}`;
    case "Dup":
      return `!&${term.l}{${nm(term.x)},${nm(term.y)}}=${showIC(term.v, names)}; ${
        showIC(term.k, names)
      }`;
  }
}

// ---------------------------------------------------------------------------
// La demo de fusión: not^(2^N) en O(N) interacciones
// ---------------------------------------------------------------------------

export interface FusionResult {
  /** "true" | "false" | otra forma normal */
  result: string;
  interactions: number;
}

/**
 * Aplica `not` 2^N veces a True mediante N auto-composiciones con DUPs.
 * El sharing hace el milagro: coste O(N), no O(2^N).
 */
export function fusionDemo(N: number): FusionResult {
  const m = new Telar();
  const f = m.fresh();
  const build = (k: number, src: ICTerm): ICTerm => {
    if (k === 0) return src;
    const a = m.fresh();
    const b = m.fresh();
    const x = m.fresh();
    return Dup(0, a, b, build(k - 1, src), Lam(x, App(Var(a), App(Var(b), Var(x)))));
  };
  const body = build(N, Var(f));
  const t = m.fresh();
  const fv = m.fresh();
  const True = Lam(t, Lam(fv, Var(t)));
  const nb = m.fresh();
  const nt = m.fresh();
  const nf = m.fresh();
  const Not = Lam(nb, Lam(nt, Lam(nf, App(App(Var(nb), Var(nf)), Var(nt)))));
  const nfm = m.normal(App(App(Lam(f, body), Not), True));
  // ¿λa.λb.a (true) o λa.λb.b (false)?
  let result = showIC(nfm);
  if (nfm.t === "Lam" && nfm.b.t === "Lam" && nfm.b.b.t === "Var") {
    result = nfm.b.b.n === nfm.n ? "true" : "false";
  }
  return { result, interactions: m.interactions };
}

/**
 * El mismo cómputo en λ-cálculo naive (una β cada vez), con presupuesto.
 * Devuelve null si lo agota — que es el punto.
 */
export function naiveDemo(
  N: number,
  budget = 2_000_000,
  onProgress?: (betas: number) => void,
): { betas: number } | null {
  type T = { t: "Var"; n: number } | { t: "Lam"; n: number; b: T } | { t: "App"; f: T; a: T };
  const V = (n: number): T => ({ t: "Var", n });
  const L = (n: number, b: T): T => ({ t: "Lam", n, b });
  const A = (f: T, a: T): T => ({ t: "App", f, a });
  let betas = 0;
  const sub = (t: T, n: number, v: T): T => {
    switch (t.t) {
      case "Var":
        return t.n === n ? v : t;
      case "Lam":
        return t.n === n ? t : L(t.n, sub(t.b, n, v));
      case "App":
        return A(sub(t.f, n, v), sub(t.a, n, v));
    }
  };
  const whnf = (t: T): T => {
    for (;;) {
      if (betas > budget) throw new BudgetOut();
      if (t.t === "App") {
        const f = whnf(t.f);
        if (f.t === "Lam") {
          betas++;
          if (onProgress && (betas & 131071) === 0) onProgress(betas);
          t = sub(f.b, f.n, t.a);
          continue;
        }
        return A(f, t.a);
      }
      return t;
    }
  };
  const normal = (t: T): T => {
    t = whnf(t);
    if (t.t === "Lam") return L(t.n, normal(t.b));
    if (t.t === "App") return A(normal(t.f), normal(t.a));
    return t;
  };
  class BudgetOut extends Error {}
  const True = L(0, L(1, V(0)));
  const Not = L(2, L(3, L(4, A(A(V(2), V(4)), V(3)))));
  let term = True;
  for (let i = 0; i < 2 ** N; i++) term = A(Not, term);
  try {
    normal(term);
    return { betas };
  } catch {
    return null;
  }
}
