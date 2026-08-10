// Sección «regular e irregular»: tres estampas ilustrativas sobre un mismo
// lienzo, en el vocabulario del telar (rombos = máquinas, hilos = conexiones).
// NO es cómputo real, y así lo dice el copy: enseña la FORMA del trabajo.
//   rejilla  regular, la forma se conoce antes de empezar
//   grieta   un «si» parte la rejilla en dos pasadas, media parada en cada una
//   árbol    la forma nace del propio cálculo: crece y se poda sin patrón

export type ParMode = "grid" | "split" | "tree";

const THREAD = "oklch(0.86 0.03 85 / 0.85)";
const DIM = "oklch(0.62 0.035 85 / 0.45)";
const MADDER = "oklch(0.62 0.17 28)";
const MUSTARD = "oklch(0.80 0.12 85)";
const IDLE = "oklch(0.55 0.03 265 / 0.7)"; // contorno de la celda parada

export function mountIrregular(cv: HTMLCanvasElement, getMode: () => ParMode): () => void {
  const cx = cv.getContext("2d")!;
  const fit = () => {
    cv.width = cv.clientWidth * devicePixelRatio;
    cv.height = cv.clientHeight * devicePixelRatio;
  };
  fit();
  addEventListener("resize", fit);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let alive = true;

  const W = () => cv.width;
  const H = () => cv.height;
  const S = () => devicePixelRatio;
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  function diamond(x: number, y: number, r: number, fill: string, alpha = 1) {
    cx.globalAlpha = alpha;
    cx.beginPath();
    cx.moveTo(x, y - r);
    cx.lineTo(x + r, y);
    cx.lineTo(x, y + r);
    cx.lineTo(x - r, y);
    cx.closePath();
    cx.fillStyle = fill;
    cx.fill();
    cx.globalAlpha = 1;
  }
  function hollow(x: number, y: number, r: number, stroke: string) {
    cx.beginPath();
    cx.moveTo(x, y - r);
    cx.lineTo(x + r, y);
    cx.lineTo(x, y + r);
    cx.lineTo(x - r, y);
    cx.closePath();
    cx.lineWidth = 1.4 * S();
    cx.strokeStyle = stroke;
    cx.stroke();
  }

  // rejilla de celdas (posiciones + geometría), recalculada por fotograma:
  // barata y siempre encaja el lienzo actual
  function gridCells() {
    const cols = Math.max(6, Math.min(11, Math.floor(W() / S() / 74)));
    const rows = Math.max(3, Math.min(6, Math.floor(H() / S() / 74)));
    const dx = W() / (cols + 1), dy = H() / (rows + 1);
    const cells: { x: number; y: number; col: number; row: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ x: dx * (c + 1), y: dy * (r + 1), col: c, row: r });
      }
    }
    return cells;
  }

  // envolvente de un «tac»: ataque instantáneo y caída suave dentro del compás
  const beat = (t: number, period: number) => {
    const local = (t % period) / period;
    return Math.exp(-local * 3.4);
  };

  function drawGrid(t: number, split: boolean) {
    const cells = gridCells();
    const r = 9 * S();
    const period = 1150;
    const env = reduced ? 1 : beat(t, period);
    const parity = Math.floor(t / period) % 2;
    for (const c of cells) {
      // lado estable de cada celda (pseudo-hash sin parpadeo entre fotogramas)
      const side = (c.col * 7 + c.row * 13) % 2;
      if (!split) {
        diamond(c.x, c.y, r, MUSTARD, 0.34 + 0.66 * env);
      } else if (side === parity || reduced && side === 0) {
        // la pasada de este compás: esta mitad trabaja
        diamond(c.x, c.y, r, side === 0 ? MUSTARD : MADDER, 0.34 + 0.66 * env);
      } else {
        // la otra mitad: parada, esperando su turno
        hollow(c.x, c.y, r, IDLE);
      }
    }
  }

  // ─── el árbol: la forma la decide el propio cálculo ───
  type TNode = {
    id: number;
    parent: number;
    depth: number;
    kids: number[];
    settled: boolean; // ya decidió sus hijos (deja de ser frontera)
    x: number;
    y: number;
    tx: number;
    ty: number;
    born: number;
  };
  let tnodes: TNode[] = [];
  let tid = 0;
  const byId = (id: number) => tnodes.find((n) => n.id === id)!;
  const MAXN = 40, MAXDEPTH = 6;
  // ramas podadas: se desvanecen en su sitio en vez de esfumarse de golpe,
  // para que la muerte de una rama se LEA como acontecimiento
  let dying: { x: number; y: number; px: number; py: number; at: number }[] = [];
  const DIE_MS = 600;

  function tSeed() {
    tnodes = [];
    tid = 0;
    tnodes.push({
      id: tid++,
      parent: -1,
      depth: 0,
      kids: [],
      settled: false,
      x: W() / 2,
      y: 40 * S(),
      tx: W() / 2,
      ty: 40 * S(),
      born: 0,
    });
  }

  function tPrune(t: number) {
    // por encima del techo, corta el subárbol más profundo y antiguo y vuelve
    // a crecer: el árbol respira en vez de desbordar
    const deepest =
      tnodes.filter((n) => n.id !== 0).sort((a, b) => b.depth - a.depth || a.born - b.born)[0];
    if (!deepest) return;
    const doomed = new Set<number>([deepest.id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const n of tnodes) {
        if (n.parent >= 0 && doomed.has(n.parent) && !doomed.has(n.id)) {
          doomed.add(n.id);
          grew = true;
        }
      }
    }
    const p = tnodes.find((n) => n.id === deepest.parent);
    if (p) {
      p.kids = p.kids.filter((k) => k !== deepest.id);
      p.settled = false; // el padre vuelve a ser frontera: el árbol rebrota
    }
    for (const n of tnodes) {
      if (!doomed.has(n.id)) continue;
      const par = n.id === deepest.id ? p : tnodes.find((m) => m.id === n.parent);
      dying.push({ x: n.x, y: n.y, px: par?.x ?? n.x, py: par?.y ?? n.y, at: t });
    }
    tnodes = tnodes.filter((n) => !doomed.has(n.id));
  }

  function tGrow(t: number) {
    const frontier = tnodes.filter((n) => !n.settled && n.kids.length === 0);
    if (!frontier.length) {
      // todo asentado: descose una hoja para que el árbol nunca se congele
      tPrune(t);
      return;
    }
    const node = frontier[Math.floor(rnd(0, frontier.length))]!;
    node.settled = true;
    if (node.depth >= MAXDEPTH || tnodes.length >= MAXN) return;
    // cuántas ramas engendra: la «decisión» que ningún reparto previo conocía.
    // con la población alta sesga a podar; baja, a estallar
    const full = tnodes.length / MAXN;
    const roll = Math.random();
    let k = 0;
    if (full < 0.45) k = roll < 0.15 ? 1 : roll < 0.6 ? 2 : 3;
    else if (full < 0.75) k = roll < 0.35 ? 0 : roll < 0.75 ? 1 : 2;
    else k = roll < 0.7 ? 0 : 1;
    k = Math.min(k, MAXN - tnodes.length);
    for (let i = 0; i < k; i++) {
      const child: TNode = {
        id: tid++,
        parent: node.id,
        depth: node.depth + 1,
        kids: [],
        settled: false,
        x: node.x + rnd(-6, 6),
        y: node.y + rnd(-6, 6),
        tx: node.x,
        ty: node.y,
        born: t,
      };
      node.kids.push(child.id);
      tnodes.push(child);
    }
    if (tnodes.length > MAXN) tPrune(t);
  }

  function tLayout() {
    // árbol ordenado: las hojas ocupan ranuras horizontales consecutivas, cada
    // padre se centra sobre sus hijos; la profundidad manda la vertical
    const leaves: TNode[] = [];
    let maxDepth = 0;
    const visit = (n: TNode) => {
      maxDepth = Math.max(maxDepth, n.depth);
      if (!n.kids.length) leaves.push(n);
      else n.kids.forEach((k) => visit(byId(k)));
    };
    const root = tnodes.find((n) => n.id === 0);
    if (!root) return;
    visit(root);
    const pad = 46 * S();
    const span = Math.max(1, leaves.length - 1);
    leaves.forEach((lf, i) => {
      lf.tx = leaves.length === 1 ? W() / 2 : pad + (i / span) * (W() - 2 * pad);
    });
    const rowH = maxDepth === 0 ? 0 : (H() - 78 * S()) / maxDepth;
    const setX = (n: TNode): number => {
      n.ty = 40 * S() + n.depth * rowH;
      if (!n.kids.length) return n.tx;
      const xs = n.kids.map((k) => setX(byId(k)));
      n.tx = xs.reduce((a, b) => a + b, 0) / xs.length;
      return n.tx;
    };
    setX(root);
  }

  function drawTree(t: number) {
    tLayout();
    const ease = reduced ? 1 : 0.12;
    for (const n of tnodes) {
      n.x += (n.tx - n.x) * ease;
      n.y += (n.ty - n.y) * ease;
    }
    // hilos padre-hijo
    cx.lineWidth = 1.6 * S();
    cx.strokeStyle = DIM;
    for (const n of tnodes) {
      if (n.parent < 0) continue;
      const p = tnodes.find((m) => m.id === n.parent);
      if (!p) continue;
      cx.beginPath();
      cx.moveTo(p.x, p.y);
      cx.lineTo(n.x, n.y);
      cx.stroke();
    }
    // ramas podadas: hilo y rombo se desvanecen en su sitio
    dying = dying.filter((d) => t - d.at < DIE_MS);
    for (const d of dying) {
      const a = reduced ? 0 : 1 - (t - d.at) / DIE_MS;
      cx.globalAlpha = a * 0.6;
      cx.beginPath();
      cx.moveTo(d.px, d.py);
      cx.lineTo(d.x, d.y);
      cx.stroke();
      cx.globalAlpha = 1;
      diamond(d.x, d.y, 8 * S() * a, THREAD, a * 0.85);
    }
    // nodos: frontera (trabajo disponible) en rubia; recién nacido en mostaza;
    // asentado, tenue
    for (const n of tnodes) {
      const r = 8 * S();
      const fresh = !reduced && t - n.born < 320;
      const frontier = !n.settled && n.kids.length === 0;
      if (fresh) diamond(n.x, n.y, r, MUSTARD, 1);
      else if (frontier) diamond(n.x, n.y, r, MADDER, 1);
      else diamond(n.x, n.y, r, THREAD, 0.85);
    }
  }

  tSeed();
  let lastGrow = 0;

  if (reduced) {
    // fotograma representativo por modo, sin bucle
    const mode = getMode();
    if (mode === "tree") {
      for (let i = 0; i < 60; i++) tGrow(i * 100);
      for (let i = 0; i < 40; i++) {
        tLayout();
        for (const n of tnodes) {
          n.x = n.tx;
          n.y = n.ty;
        }
      }
    }
    cx.clearRect(0, 0, W(), H());
    if (mode === "tree") drawTree(1e9);
    else drawGrid(0, mode === "split");
    return () => {
      alive = false;
      removeEventListener("resize", fit);
    };
  }

  const loop = (t: number) => {
    if (!alive) return;
    cx.clearRect(0, 0, W(), H());
    const mode = getMode();
    if (mode === "tree") {
      if (t - lastGrow > 620) {
        tGrow(t);
        lastGrow = t;
      }
      drawTree(t);
    } else {
      drawGrid(t, mode === "split");
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  return () => {
    alive = false;
    removeEventListener("resize", fit);
  };
}
