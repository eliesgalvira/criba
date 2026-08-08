// Peanito — el mini-lenguaje Nat→Nat que Criba mina.
// Sus constructores son los axiomas de Peano en miniatura:
//
//   Ret        devuelve la entrada actual
//   Rec        llamada recursiva sobre la entrada actual
//   Zero       emite 0
//   Suc(t)     emite el sucesor de t
//   Mat(z, s)  match: 0 → z ; S(n) → s (con la entrada religada a n)
//   Sup(a, b)  superposición de dos candidatos (solo búsqueda)

export type Term =
  | { t: "Ret" }
  | { t: "Rec" }
  | { t: "Zero" }
  | { t: "Suc"; body: Term }
  | { t: "Mat"; zero: Term; succ: Term }
  | { t: "Sup"; left: Term; right: Term; label: number };

export const Ret: Term = { t: "Ret" };
export const Rec: Term = { t: "Rec" };
export const Zero: Term = { t: "Zero" };
export const Suc = (body: Term): Term => ({ t: "Suc", body });
export const Mat = (zero: Term, succ: Term): Term => ({ t: "Mat", zero, succ });
export const Sup = (left: Term, right: Term, label = -1): Term => ({
  t: "Sup",
  left,
  right,
  label,
});

export function show(term: Term): string {
  switch (term.t) {
    case "Ret":
      return "*";
    case "Rec":
      return "@";
    case "Zero":
      return "0";
    case "Suc":
      return `(S ${show(term.body)})`;
    case "Mat":
      return `{0:${show(term.zero)} | S:${show(term.succ)}}`;
    case "Sup":
      return `{${show(term.left)} | ${show(term.right)}}`;
  }
}

/** Número de nodos de un programa concreto (lo que la minimalidad mide). */
export function size(term: Term): number {
  switch (term.t) {
    case "Ret":
    case "Rec":
    case "Zero":
      return 1;
    case "Suc":
      return 1 + size(term.body);
    case "Mat":
      return 1 + size(term.zero) + size(term.succ);
    case "Sup":
      throw new Error("size() espera un programa concreto (sin Sup)");
  }
}

/**
 * Intérprete iterativo. Peanito es tail-recursivo salvo Suc, que solo suma 1
 * después: un contador de sucesores pendientes es toda la pila que hace falta.
 * El fuel escala con la entrada para no juzgar divergente a un programa honesto.
 * Devuelve null si diverge (o agota el fuel).
 */
export function run(prog: Term, n: number, fuel?: number): number | null {
  let f = fuel ?? 256 + 64 * (n > 0 ? n + 2 : 2);
  let t = prog;
  let x = n;
  let pending = 0;
  while (f > 0) {
    f--;
    switch (t.t) {
      case "Ret":
        return x + pending;
      case "Zero":
        return pending;
      case "Rec":
        t = prog;
        continue;
      case "Suc":
        pending++;
        t = t.body;
        continue;
      case "Mat":
        if (x === 0) t = t.zero;
        else {
          x--;
          t = t.succ;
        }
        continue;
      case "Sup":
        throw new Error("run() espera un programa concreto (sin Sup)");
    }
  }
  return null;
}

export type Example = readonly [x: number, y: number];

export function fits(prog: Term, examples: readonly Example[]): boolean {
  for (const [x, y] of examples) {
    if (run(prog, x, 256 + 64 * (x + y + 2)) !== y) return false;
  }
  return true;
}
