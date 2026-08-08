// Página-experiencia (prototipo): telar vivo, scroll hint, minador real,
// carrera real, ES/EN. Los motores son los mismos que pasan la suite de tests.

import { everett } from "../src/criba.ts";
import { run, show, size } from "../src/peanito.ts";
import { fusionDemo, naiveDemo } from "../src/telar.ts";

// ---------------------------------------------------------------------------
// i18n mínima (copy de autor en ambos idiomas; GT se evaluará en build-time)
// ---------------------------------------------------------------------------

const COPY: Record<string, Record<string, string>> = {
  es: {
    h1: 'Computar es tejer <span class="hilo">hilos</span> que se recombinan.',
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
    steps: "pasos de evaluación compartidos",
    notfound:
      "No hay ningún programa (hasta profundidad 5) que cumpla esos ejemplos. O son inconsistentes, o la función no es expresable en este mini-lenguaje — que solo sabe de recursión estructural. Honestidad ante todo.",
    verify: "Comprobación fuera de los ejemplos:",
    raceh2: "El mismo cómputo, dos telas.",
    racelead:
      "Aplicar «not» 2^N veces a «true». El λ-cálculo clásico repite cada pasada; el cálculo de interacciones comparte la trama, y el coste cae de exponencial a lineal. Los dos números salen de ejecuciones reales, aquí, ahora.",
    gorace: "Tejer 2^N pasadas",
    naivelbl: "β-reducciones · λ-cálculo naive",
    iclbl: "interacciones · cálculo de interacciones",
    dnf: "no termina (presupuesto agotado)",
    honh2: "Etiqueta: lo que esta tela no es",
    hon1:
      "<b>No computa lo incomputable.</b> Misma clase de Church-Turing; cambia el coste, no el poder.",
    hon2:
      "<b>No es más rápida en tu código de cada día.</b> Hoy, un bucle en C le gana. La ventaja vive en lo simbólico: buscar, invertir, demostrar.",
    hon3:
      "<b>No es cuántica.</b> Las «superposiciones» comparten estructura; no hay qubits ni magia.",
    hon4:
      "<b>El lienzo del fondo es una maqueta visual.</b> Los números del minador y de la carrera, en cambio, salen de ejecuciones reales en esta página.",
    foot1: "Prototipo — proyecto de divulgación sobre el Interaction Calculus de Victor Taelin.",
    foot2: "Todo el código es legible de arriba abajo: motor, minador y esta página.",
  },
  en: {
    h1: 'To compute is to weave <span class="hilo">threads</span> that recombine.',
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
    steps: "shared evaluation steps",
    notfound:
      "No program (up to depth 5) fits those examples. Either they are inconsistent, or the function is not expressible in this mini-language — which only knows structural recursion. Honesty first.",
    verify: "Checking beyond your examples:",
    raceh2: "The same computation, two cloths.",
    racelead:
      "Apply “not” 2^N times to “true”. Classic λ-calculus repeats every pass; the interaction calculus shares the weft, and the cost drops from exponential to linear. Both numbers come from real runs, here, now.",
    gorace: "Weave 2^N passes",
    naivelbl: "β-reductions · naive λ-calculus",
    iclbl: "interactions · interaction calculus",
    dnf: "does not finish (budget exhausted)",
    honh2: "Garment tag: what this cloth is not",
    hon1:
      "<b>It does not compute the uncomputable.</b> Same Church-Turing class; the cost changes, not the power.",
    hon2:
      "<b>It is not faster at your everyday code.</b> Today, a C loop beats it. The advantage lives in the symbolic: searching, inverting, proving.",
    hon3: "<b>It is not quantum.</b> “Superpositions” share structure; no qubits, no magic.",
    hon4:
      "<b>The background canvas is a visual mock.</b> The miner and race numbers, however, come from real executions on this page.",
    foot1: "Prototype — an outreach project about Victor Taelin's Interaction Calculus.",
    foot2: "All the code is readable top to bottom: engine, miner, and this page.",
  },
};

let LANG = "es";
function applyLang(lang: string) {
  LANG = lang;
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    const key = el.dataset.i18n!;
    const txt = COPY[lang]?.[key];
    if (txt !== undefined) el.innerHTML = txt;
  }
  for (const id of ["es", "en"]) {
    document.getElementById(`lang-${id}`)?.setAttribute("aria-pressed", String(id === lang));
  }
}
document.getElementById("lang-es")?.addEventListener("click", () => applyLang("es"));
document.getElementById("lang-en")?.addEventListener("click", () => applyLang("en"));

// ---------------------------------------------------------------------------
// Scroll hint: desaparece al primer gesto
// ---------------------------------------------------------------------------

const hint = document.getElementById("hint")!;
addEventListener("scroll", () => {
  if (scrollY > 40) hint.classList.add("gone");
}, { passive: true });

// ---------------------------------------------------------------------------
// Minador real (Everett)
// ---------------------------------------------------------------------------

const pairsBox = document.getElementById("pairs")!;
const runBtn = document.getElementById("run") as HTMLButtonElement;
const out = document.getElementById("out")!;

function addPair(x: number | "" = "", y: number | "" = "") {
  const span = document.createElement("span");
  span.className = "pair";
  span.innerHTML =
    `f(<input type="number" min="0" max="30" class="x" value="${x}">) = <input type="number" min="0" max="99" class="y" value="${y}"> <button class="del" aria-label="quitar">✕</button>`;
  span.querySelector(".del")!.addEventListener("click", () => span.remove());
  pairsBox.insertBefore(span, pairsBox.lastElementChild);
}

const addBtn = document.createElement("button");
addBtn.className = "pair add";
addBtn.textContent = "+ f(·) = ·";
addBtn.addEventListener("click", () => addPair());
pairsBox.appendChild(addBtn);
for (const [x, y] of [[0, 0], [1, 2], [2, 4], [3, 6]]) addPair(x, y);

function readExamples(): [number, number][] {
  const xs: [number, number][] = [];
  for (const p of pairsBox.querySelectorAll(".pair:not(.add)")) {
    const x = (p.querySelector(".x") as HTMLInputElement).valueAsNumber;
    const y = (p.querySelector(".y") as HTMLInputElement).valueAsNumber;
    if (Number.isFinite(x) && Number.isFinite(y)) xs.push([x, y]);
  }
  return xs;
}

runBtn.addEventListener("click", () => {
  const examples = readExamples();
  if (!examples.length) return;
  runBtn.disabled = true;
  runBtn.textContent = COPY[LANG]!.running!;
  setTimeout(() => {
    const t0 = performance.now();
    const { prog, stats } = everett(examples, 5, 8_000_000);
    const ms = performance.now() - t0;
    const C = COPY[LANG]!;
    if (!prog) {
      out.innerHTML = `<p class="meta fail">${C.notfound}</p>`;
    } else {
      const maxX = Math.max(...examples.map(([x]) => x));
      const extra = [maxX + 1, maxX + 2, maxX + 3]
        .map((x) => `f(${x})=<b>${run(prog, x, 100_000)}</b>`).join(" · ");
      out.innerHTML = `<code>${show(prog)}</code>
        <p class="meta">${C.found} — ${size(prog)} nodos, ${
        stats.provenMinimal ? C.foundProven : C.foundBest
      } · ${stats.steps.toLocaleString(LANG)} ${C.steps} · ${ms.toFixed(0)} ms</p>
        <p class="verify">${C.verify} ${extra}</p>`;
    }
    runBtn.disabled = false;
    runBtn.textContent = C.run!;
  }, 30);
});

// ---------------------------------------------------------------------------
// Carrera real (Telar vs naive)
// ---------------------------------------------------------------------------

const nslider = document.getElementById("nslider") as HTMLInputElement;
const nval = document.getElementById("nval")!;
const goRace = document.getElementById("gorace") as HTMLButtonElement;
const naiveN = document.getElementById("naive-n")!;
const icN = document.getElementById("ic-n")!;

nslider.addEventListener("input", () => nval.textContent = nslider.value);

goRace.addEventListener("click", () => {
  const N = nslider.valueAsNumber;
  goRace.disabled = true;
  setTimeout(() => {
    const ic = fusionDemo(N);
    icN.textContent = ic.interactions.toLocaleString(LANG);
    let naive: { betas: number } | null = null;
    if (N <= 13) {
      try {
        naive = naiveDemo(N, 3_000_000);
      } catch {
        naive = null;
      }
    }
    naiveN.textContent = naive ? naive.betas.toLocaleString(LANG) : `2^${N} · ${COPY[LANG]!.dnf}`;
    (naiveN as HTMLElement).style.fontSize = naive ? "" : "1.1rem";
    goRace.disabled = false;
  }, 30);
});

// ---------------------------------------------------------------------------
// El telar del hero (maqueta visual estilizada; ver etiqueta de honestidad)
// ---------------------------------------------------------------------------

type LNode = { k: string; x: number; y: number; vx: number; vy: number; ports: (LLink | null)[] };
type LLink = { a: LNode; pa: number; b: LNode; pb: number };

(() => {
  const cv = document.getElementById("loom") as HTMLCanvasElement;
  const cx = cv.getContext("2d")!;
  const fit = () => {
    cv.width = cv.clientWidth * devicePixelRatio;
    cv.height = cv.clientHeight * devicePixelRatio;
  };
  fit();
  addEventListener("resize", fit);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const THREAD = "oklch(0.86 0.03 85 / 0.85)";
  const DIM = "oklch(0.6 0.035 85 / 0.4)";
  const MADDER = "oklch(0.62 0.17 28)";
  const MUSTARD = "oklch(0.78 0.12 85)";
  const WARP = "oklch(0.32 0.05 265 / 0.5)";

  let nodes: LNode[] = [];
  let links: LLink[] = [];
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const kinds = ["g", "g", "d", "d", "e"];
  const W = () => cv.width;
  const H = () => cv.height;
  const addNode = (k: string, x: number, y: number): LNode => {
    const n: LNode = { k, x, y, vx: 0, vy: 0, ports: [null, null, null] };
    nodes.push(n);
    return n;
  };
  const connect = (a: LNode, pa: number, b: LNode, pb: number) => {
    const l: LLink = { a, pa, b, pb };
    a.ports[pa] = l;
    b.ports[pb] = l;
    links.push(l);
  };
  function seed(cxx: number, cyy: number) {
    const ring: LNode[] = [];
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      ring.push(
        addNode(
          kinds[Math.floor(rnd(0, kinds.length))]!,
          cxx + Math.cos(a) * rnd(70, 180),
          cyy + Math.sin(a) * rnd(50, 120),
        ),
      );
    }
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i]!, b = ring[(i + 1) % ring.length]!;
      const pa = a.ports.findIndex((p) => !p), pb = b.ports.findIndex((p) => !p);
      if (pa >= 0 && pb >= 0) connect(a, pa, b, pb);
    }
    const m = addNode(
      kinds[Math.floor(rnd(0, kinds.length))]!,
      cxx + rnd(-50, 50),
      cyy + rnd(-40, 40),
    );
    const t = ring[0]!;
    if (!t.ports[0] && !m.ports[0]) connect(t, 0, m, 0);
  }
  const unlink = (l: LLink) => {
    l.a.ports[l.pa] = null;
    l.b.ports[l.pb] = null;
    links = links.filter((x) => x !== l);
  };
  const removeNode = (n: LNode) => {
    n.ports.forEach((l) => l && unlink(l));
    nodes = nodes.filter((x) => x !== n);
  };
  const outsOf = (n: LNode) =>
    n.ports.slice(1).filter((x): x is LLink => !!x).map((x) =>
      x.a === n ? { n: x.b, p: x.pb } : { n: x.a, p: x.pa }
    );
  const findActive = () => links.find((l) => l.pa === 0 && l.pb === 0) ?? null;
  let flash: LLink | null = null;
  let flashT = 0;
  function step() {
    const l = findActive();
    if (!l) {
      if (nodes.length < 28) seed(rnd(W() * .2, W() * .8), rnd(H() * .3, H() * .7));
      return;
    }
    flash = l;
    flashT = 1;
    const { a, b } = l;
    setTimeout(() => {
      if (a.k === b.k) {
        const ends = [...outsOf(a), ...outsOf(b)];
        removeNode(a);
        removeNode(b);
        for (let i = 0; i + 1 < ends.length; i += 2) {
          const p = ends[i]!, q = ends[i + 1]!;
          if (!p.n.ports[p.p] && !q.n.ports[q.p]) connect(p.n, p.p, q.n, q.p);
        }
      } else if (a.k === "e" || b.k === "e") {
        const er = a.k === "e" ? a : b, ot = a.k === "e" ? b : a;
        const outs = outsOf(ot);
        removeNode(er);
        removeNode(ot);
        outs.forEach((o) => {
          if (!o.n.ports[o.p]) {
            const e2 = addNode("e", o.n.x + rnd(-35, 35), o.n.y + rnd(-35, 35));
            connect(e2, 0, o.n, o.p);
          }
        });
      } else {
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const outsA = outsOf(a), outsB = outsOf(b);
        const ka = a.k, kb = b.k;
        removeNode(a);
        removeNode(b);
        const n1 = addNode(kb, mx - 40, my - 34), n2 = addNode(kb, mx + 40, my - 34);
        const n3 = addNode(ka, mx - 40, my + 34), n4 = addNode(ka, mx + 40, my + 34);
        connect(n1, 1, n3, 1);
        connect(n1, 2, n4, 1);
        connect(n2, 1, n3, 2);
        connect(n2, 2, n4, 2);
        [n1, n2].forEach((n, i) => {
          const o = outsA[i];
          if (o && !o.n.ports[o.p]) connect(n, 0, o.n, o.p);
        });
        [n3, n4].forEach((n, i) => {
          const o = outsB[i];
          if (o && !o.n.ports[o.p]) connect(n, 0, o.n, o.p);
        });
      }
      flash = null;
    }, reduced ? 0 : 520);
  }
  function physics() {
    for (const n of nodes) {
      let fx = (W() / 2 - n.x) * 0.0005, fy = (H() / 2 - n.y) * 0.001;
      for (const m of nodes) {
        if (m !== n) {
          const dx = n.x - m.x, dy = n.y - m.y, d2 = dx * dx + dy * dy + 60;
          fx += dx / d2 * 34;
          fy += dy / d2 * 34;
        }
      }
      n.vx = (n.vx + fx) * 0.92;
      n.vy = (n.vy + fy) * 0.92;
    }
    for (const l of links) {
      const dx = l.b.x - l.a.x,
        dy = l.b.y - l.a.y,
        d = Math.hypot(dx, dy) || 1,
        f = (d - 115) * 0.002;
      l.a.vx += dx / d * f;
      l.a.vy += dy / d * f;
      l.b.vx -= dx / d * f;
      l.b.vy -= dy / d * f;
    }
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
    }
  }
  function thread(l: LLink, t: number) {
    const N = 14;
    cx.beginPath();
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const x = l.a.x + (l.b.x - l.a.x) * u, y = l.a.y + (l.b.y - l.a.y) * u;
      const dx = l.b.x - l.a.x, dy = l.b.y - l.a.y, d = Math.hypot(dx, dy) || 1;
      const w = Math.sin(u * Math.PI * 6 + t * 0.002) * 3.2;
      if (i) cx.lineTo(x - dy / d * w, y + dx / d * w);
      else cx.moveTo(x - dy / d * w, y + dx / d * w);
    }
    cx.stroke();
  }
  function draw(t: number) {
    cx.clearRect(0, 0, W(), H());
    cx.lineWidth = 1;
    cx.strokeStyle = WARP;
    const gap = 26 * devicePixelRatio;
    for (let x = gap / 2; x < W(); x += gap) {
      cx.beginPath();
      cx.moveTo(x, 0);
      cx.lineTo(x, H());
      cx.stroke();
    }
    for (const l of links) {
      const active = l.pa === 0 && l.pb === 0;
      cx.lineWidth = active ? 3 : 1.8;
      cx.strokeStyle = active ? MADDER : (l.pa === 0 || l.pb === 0 ? THREAD : DIM);
      thread(l, t);
    }
    for (const n of nodes) {
      const r = n.k === "e" ? 6 : 10;
      cx.beginPath();
      cx.moveTo(n.x, n.y - r);
      cx.lineTo(n.x + r, n.y);
      cx.lineTo(n.x, n.y + r);
      cx.lineTo(n.x - r, n.y);
      cx.closePath();
      cx.fillStyle = n.k === "g" ? THREAD : n.k === "d" ? MUSTARD : MADDER;
      cx.fill();
    }
    if (flash) {
      flashT *= 0.95;
      for (const n of [flash.a, flash.b]) {
        cx.beginPath();
        cx.arc(n.x, n.y, 18 + (1 - flashT) * 14, 0, 7);
        cx.lineWidth = 2;
        cx.strokeStyle = MADDER;
        cx.globalAlpha = Math.max(flashT, 0.15);
        cx.stroke();
        cx.globalAlpha = 1;
      }
    }
  }
  seed(W() * 0.35, H() * 0.45);
  seed(W() * 0.68, H() * 0.5);
  if (reduced) {
    for (let i = 0; i < 200; i++) physics();
    draw(0);
    return;
  }
  setInterval(step, 1500);
  const loop = (t: number) => {
    physics();
    draw(t);
    requestAnimationFrame(loop);
  };
  loop(0);
})();
