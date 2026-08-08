// Interaction Calculus evaluator — direct JS port of Taelin's ic.hs
// (gist d3da31e6b8913aea1cf16e0b372ac830) + a naive λ-calculus evaluator
// for comparison. Feasibility spike for a browser demo.

// ---------- Terms ----------
// {t:'Var',n} {t:'Era'} {t:'Lam',n,b} {t:'App',f,a}
// {t:'Sup',l,a,b} {t:'Dup',l,x,y,v,b} {t:'Let',n,v,b}
const Var = (n) => ({ t: "Var", n });
const Era = () => ({ t: "Era" });
const Lam = (n, b) => ({ t: "Lam", n, b });
const App = (f, a) => ({ t: "App", f, a });
const Sup = (l, a, b) => ({ t: "Sup", l, a, b });
const Dup = (l, x, y, v, b) => ({ t: "Dup", l, x, y, v, b });

let SUBST = new Map();
let FRESH = 0;
let ITERS = 0;
const fresh = () => FRESH++;
const reset = () => {
  SUBST = new Map();
  FRESH = 0;
  ITERS = 0;
};

// ---------- Interactions (from the IC spec) ----------
function appLam(lam, arg) { // (λx.f a) → x<-a; f
  ITERS++;
  SUBST.set(lam.n, arg);
  return whnf(lam.b);
}
function appSup(sup, arg) { // (&L{a,b} c) → !&L{c0,c1}=c; &L{(a c0),(b c1)}
  ITERS++;
  const c0 = fresh(), c1 = fresh();
  return whnf(Dup(sup.l, c0, c1, arg, Sup(sup.l, App(sup.a, Var(c0)), App(sup.b, Var(c1)))));
}
function dupEra(dup) { // !&L{r,s}=*; K
  ITERS++;
  SUBST.set(dup.x, Era());
  SUBST.set(dup.y, Era());
  return whnf(dup.b);
}
function dupLam(dup, lam) { // !&L{r,s}=λx.f; K
  ITERS++;
  const x0 = fresh(), x1 = fresh(), f0 = fresh(), f1 = fresh();
  SUBST.set(dup.x, Lam(x0, Var(f0)));
  SUBST.set(dup.y, Lam(x1, Var(f1)));
  SUBST.set(lam.n, Sup(dup.l, Var(x0), Var(x1)));
  return whnf(Dup(dup.l, f0, f1, lam.b, dup.b));
}
function dupSup(dup, sup) { // !&L{x,y}=&R{a,b}; K
  ITERS++;
  if (dup.l === sup.l) {
    SUBST.set(dup.x, sup.a);
    SUBST.set(dup.y, sup.b);
    return whnf(dup.b);
  }
  const a0 = fresh(), a1 = fresh(), b0 = fresh(), b1 = fresh();
  SUBST.set(dup.x, Sup(sup.l, Var(a0), Var(b0)));
  SUBST.set(dup.y, Sup(sup.l, Var(a1), Var(b1)));
  return whnf(Dup(dup.l, a0, a1, sup.a, Dup(dup.l, b0, b1, sup.b, dup.b)));
}

function whnf(term) {
  while (true) {
    switch (term.t) {
      case "Var": {
        if (SUBST.has(term.n)) {
          term = SUBST.get(term.n);
          continue;
        }
        return term;
      }
      case "Let": {
        const v = whnf(term.v);
        SUBST.set(term.n, v);
        term = term.b;
        continue;
      }
      case "App": {
        const f = whnf(term.f);
        if (f.t === "Lam") {
          term = (ITERS++, SUBST.set(f.n, term.a), f.b);
          continue;
        }
        if (f.t === "Sup") return appSup(f, term.a);
        if (f.t === "Era") {
          ITERS++;
          return Era();
        }
        if (f.t === "Dup") {
          ITERS++;
          term = Dup(f.l, f.x, f.y, f.v, App(f.b, term.a));
          continue;
        }
        return App(f, term.a);
      }
      case "Dup": {
        const v = whnf(term.v);
        if (v.t === "Lam") return dupLam(term, v);
        if (v.t === "Sup") return dupSup(term, v);
        if (v.t === "Era") return dupEra(term);
        if (v.t === "Dup") {
          term = Dup(v.l, v.x, v.y, v.v, Dup(term.l, term.x, term.y, v.b, term.b));
          continue;
        }
        return Dup(term.l, term.x, term.y, v, term.b);
      }
      default:
        return term;
    }
  }
}

function normal(term) {
  const q = whnf(term);
  switch (q.t) {
    case "Lam":
      return Lam(q.n, normal(q.b));
    case "App":
      return App(normal(q.f), normal(q.a));
    case "Sup":
      return Sup(q.l, normal(q.a), normal(q.b));
    case "Dup":
      return Dup(q.l, q.x, q.y, normal(q.v), normal(q.b));
    default:
      return q;
  }
}

function show(term, names = new Map()) {
  const nm = (n) => {
    if (!names.has(n)) {
      names.set(
        n,
        "abcdefghijklmnopqrstuvwxyz"[names.size % 26] +
          (names.size >= 26 ? Math.floor(names.size / 26) : ""),
      );
    }
    return names.get(n);
  };
  switch (term.t) {
    case "Var":
      return nm(term.n);
    case "Era":
      return "*";
    case "Lam":
      return `λ${nm(term.n)}.${show(term.b, names)}`;
    case "App":
      return `(${show(term.f, names)} ${show(term.a, names)})`;
    case "Sup":
      return `&${term.l}{${show(term.a, names)},${show(term.b, names)}}`;
    case "Dup":
      return `!&${term.l}{${nm(term.x)},${nm(term.y)}}=${show(term.v, names)}; ${
        show(term.b, names)
      }`;
    default:
      return "?";
  }
}

// ---------- Naive λ-calculus evaluator (call-by-name + memo-free) ----------
// Standard capture-avoiding-by-fresh-rename substitution; counts β-steps.
let BETA = 0;
function nsub(t, n, v) {
  switch (t.t) {
    case "Var":
      return t.n === n ? v : t;
    case "Lam":
      return t.n === n ? t : Lam(t.n, nsub(t.b, n, v));
    case "App":
      return App(nsub(t.f, n, v), nsub(t.a, n, v));
    default:
      return t;
  }
}
function nwhnf(t, budget) {
  while (true) {
    if (BETA > budget) throw new Error("budget");
    if (t.t === "App") {
      const f = nwhnf(t.f, budget);
      if (f.t === "Lam") {
        BETA++;
        t = nsub(f.b, f.n, t.a);
        continue;
      }
      return App(f, t.a);
    }
    return t;
  }
}
function nnormal(t, budget) {
  t = nwhnf(t, budget);
  if (t.t === "Lam") return Lam(t.n, nnormal(t.b, budget));
  if (t.t === "App") return App(nnormal(t.f, budget), nnormal(t.a, budget));
  return t;
}

// ---------- Demo: iterate `not` 2^N times over True ----------
// IC version: N-fold self-composition via DUPs (sharing does the magic).
// λ-encoded bool: True = λt.λf.t ; False = λt.λf.f ; not = λb.λt.λf.((b f) t)

function icDemo(N) {
  reset();
  // F = λf. !&0{f0,f1}=f; ... (N times) ... λx.(f0 (f1 x))
  // then ((F not) True)
  const f = fresh();
  let inner; // build from innermost out
  // innermost body: λx.(f0 (f1 x)) with the last pair of names
  let cur = Var(f);
  // We chain: dup f into f0,f1; body = λx.(f0 (f1 x)); repeat N times.
  // Build iteratively: g_0 = f; g_{k+1} = λx.(g_k0 (g_k1 x)) via dup of g_k.
  // Representation: term that computes not^(2^N).
  let term = (() => {
    // recursive builder using Dup chain
    function build(k, src) {
      if (k === 0) return src;
      const a = fresh(), b = fresh(), x = fresh();
      return Dup(0, a, b, build(k - 1, src), Lam(x, App(Var(a), App(Var(b), Var(x)))));
    }
    return build(N, cur);
  })();
  const T = () => {
    const t = fresh(), fv = fresh();
    return Lam(t, Lam(fv, Var(t)));
  };
  const NOT = () => {
    const b = fresh(), t = fresh(), fv = fresh();
    return Lam(b, Lam(t, Lam(fv, App(App(Var(b), Var(fv)), Var(t)))));
  };
  // ((λf.term NOT) True): substitute f by NOT via a Let-like app
  const fullTerm = App(App(Lam(f, term), NOT()), T());
  const t0 = process.hrtime.bigint();
  const nf = normal(fullTerm);
  const dt = Number(process.hrtime.bigint() - t0) / 1e6;
  return { result: show(nf), inters: ITERS, ms: dt };
}

function naiveDemo(N, budget) {
  // apply not 2^N times literally
  BETA = 0;
  const T = Lam(0, Lam(1, Var(0)));
  const NOT = Lam(2, Lam(3, Lam(4, App(App(Var(2), Var(4)), Var(3)))));
  let t = T;
  const count = 2 ** N;
  try {
    const t0 = process.hrtime.bigint();
    let term = T;
    for (let i = 0; i < count; i++) term = App(NOT, term);
    const nf = nnormal(term, budget);
    const dt = Number(process.hrtime.bigint() - t0) / 1e6;
    return { result: show(nf), betas: BETA, ms: dt };
  } catch (e) {
    return { result: "BUDGET EXCEEDED", betas: BETA, ms: null };
  }
}

console.log("=== IC (sharing): not^(2^N) applied to True ===");
for (const N of [4, 8, 16, 24, 30, 100, 1000]) {
  const r = icDemo(N);
  console.log(
    `N=${N} (2^${N} = ${
      N <= 30 ? 2 ** N : "astronomical"
    } applications): ${r.inters} interactions, ${r.ms.toFixed(2)}ms -> ${r.result}`,
  );
}

console.log("\n=== naive λ-calculus: same computation, one β at a time ===");
for (const N of [4, 8, 12]) {
  const r = naiveDemo(N, 50_000_000);
  console.log(
    `N=${N} (2^${N} applications): ${r.betas} β-steps, ${
      r.ms === null ? "DNF" : r.ms.toFixed(2) + "ms"
    } -> ${r.result}`,
  );
}

// ---------- Demo 2: SAT via superposed booleans ----------
// Formula vars become SUPs {T,F} with label = var index. Repeated uses of a
// var are cloned with DUPs (distinct labels), which preserves correlation.
// The normal form is a SUP tree whose paths are assignments.

function T_() {
  const t = fresh(), f = fresh();
  return Lam(t, Lam(f, Var(t)));
}
function F_() {
  const t = fresh(), f = fresh();
  return Lam(t, Lam(f, Var(f)));
}
function NOT_(a) {
  const t = fresh(), f = fresh();
  return Lam(t, Lam(f, App(App(a, Var(f)), Var(t)))).b
    ? Lam(t, Lam(f, App(App(a, Var(f)), Var(t))))
    : null;
}
function AND_(a, b) {
  const x = fresh(), y = fresh();
  return App(App(App(a, Lam(x, Var(x))), Lam(y, F_())), b);
}
function OR_(a, b) {
  const x = fresh(), y = fresh();
  return App(App(App(a, Lam(x, T_())), Lam(y, Var(y))), b);
}

let DUPLAB = 1_000_000;
function clones(term, k, out) {
  // produce k correlated copies of term via chained DUPs (fresh labels)
  if (k === 1) {
    out.push(term);
    return (b) => b;
  }
  let wrap = (b) => b;
  let cur = term;
  for (let i = 0; i < k - 1; i++) {
    const l = DUPLAB++;
    const x = fresh(), y = fresh();
    const prevWrap = wrap, prevCur = cur;
    out.push(Var(x));
    cur = Var(y);
    wrap = (b) => prevWrap(Dup(l, x, y, prevCur, b));
  }
  out.push(cur);
  return wrap;
}

function satDemo(nVars, clauses) {
  reset();
  DUPLAB = 1_000_000;
  // count occurrences per var
  const occ = Array(nVars).fill(0);
  for (const cl of clauses) for (const [v] of cl) occ[v]++;
  // superposed inputs
  const copies = Array.from({ length: nVars }, () => []);
  let wrapAll = (b) => b;
  for (let v = 0; v < nVars; v++) {
    const sup = Sup(v, T_(), F_());
    const w = clones(sup, Math.max(occ[v], 1), copies[v]);
    const prev = wrapAll;
    wrapAll = (b) => prev(w(b));
  }
  const used = Array(nVars).fill(0);
  const lit = (v, neg) => {
    const c = copies[v][used[v]++];
    if (!neg) return c;
    return App(App(c, F_()), T_()); // ¬b = (b F T): keeps leaves concrete
  };
  // CNF: AND of clauses; clause: OR of literals
  let form = null;
  for (const cl of clauses) {
    let c = null;
    for (const [v, neg] of cl) c = c === null ? lit(v, neg) : OR_(c, lit(v, neg));
    form = form === null ? c : AND_(form, c);
  }
  const term = wrapAll(form);
  const t0 = process.hrtime.bigint();
  const nf = normal(term);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  // walk SUP tree for a True leaf; record label path
  function isTrue(t) {
    return t.t === "Lam" && t.b.t === "Lam" && t.b.b.t === "Var" && t.b.b.n === t.n;
  }
  function walk(t, path) {
    if (t.t === "Dup") return walk(t.b, path); // skip floating garbage dups
    if (t.t === "Sup") {
      // same label deeper in the tree = the SAME choice: stay consistent
      if (t.l in path) return walk(path[t.l] ? t.a : t.b, path);
      return walk(t.a, { ...path, [t.l]: true }) || walk(t.b, { ...path, [t.l]: false });
    }
    return isTrue(t) ? path : null;
  }
  const sol = walk(nf, {});
  return { sol, inters: ITERS, ms };
}

function randCNF(nVars, nClauses, seedFn) {
  const cls = [];
  for (let i = 0; i < nClauses; i++) {
    const c = [];
    const vs = new Set();
    while (vs.size < 3) vs.add(Math.floor(seedFn() * nVars));
    for (const v of vs) c.push([v, seedFn() < 0.5]);
    cls.push(c);
  }
  return cls;
}
// deterministic PRNG
function mulberry32(a) {
  return function () {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function bruteForce(nVars, clauses) {
  const t0 = process.hrtime.bigint();
  for (let m = 0; m < 2 ** nVars; m++) {
    let ok = true;
    for (const cl of clauses) {
      let cv = false;
      for (const [v, neg] of cl) {
        const val = ((m >> v) & 1) === 1;
        if (neg ? !val : val) {
          cv = true;
          break;
        }
      }
      if (!cv) {
        ok = false;
        break;
      }
    }
    if (ok) return { m, ms: Number(process.hrtime.bigint() - t0) / 1e6, tried: m + 1 };
  }
  return { m: null, ms: Number(process.hrtime.bigint() - t0) / 1e6, tried: 2 ** nVars };
}

console.log("\n=== SAT: superposed booleans (IC) vs native-JS brute force ===");
for (const [n, m, seed] of [[8, 18, 7], [10, 22, 3], [12, 26, 1], [14, 32, 5]]) {
  const rng = mulberry32(seed);
  const cnf = randCNF(n, m, rng);
  const r = satDemo(n, cnf);
  const b = bruteForce(n, cnf);
  const verify = r.sol === null
    ? "UNSAT?"
    : cnf.every((cl) => cl.some(([v, neg]) => neg ? !(r.sol[v] ?? true) : (r.sol[v] ?? true)));
  console.log(
    `n=${n} vars, ${m} clauses: IC ${r.inters} inters ${r.ms.toFixed(1)}ms sol=${
      r.sol ? "found" : "none"
    } verified=${verify} | JS brute force: ${b.tried} tries ${b.ms.toFixed(1)}ms`,
  );
}
