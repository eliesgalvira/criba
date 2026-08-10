// El telar del hero: maqueta visual estilizada de reducción de una red de
// interacciones (aniquilación / conmutación / borrado) con render de hilos
// sobre urdimbre. Capa de arte — no es un widget; el canvas es nuestro.

type LNode = { k: string; x: number; y: number; vx: number; vy: number; ports: (LLink | null)[] };
type LLink = { a: LNode; pa: number; b: LNode; pb: number };

export interface LoomOpts {
  /** lienzo pequeño: anillos y enlaces cortos y reposición temprana, para que
   * la red se vea DENSA donde el hero usa distancias de pantalla completa */
  mini?: boolean;
  /** modal a pantalla casi completa: todo escalado para VERSE (el hero dibuja
   * en píxeles de búfer, que en retina son la mitad), y ritmo más vivo */
  big?: boolean;
}

export function mountLoom(cv: HTMLCanvasElement, opts: LoomOpts = {}): () => void {
  const cx = cv.getContext("2d")!;
  const fit = () => {
    cv.width = cv.clientWidth * devicePixelRatio;
    cv.height = cv.clientHeight * devicePixelRatio;
  };
  fit();
  addEventListener("resize", fit);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const S = opts.big ? devicePixelRatio * 1.15 : 1;
  const THREAD = "oklch(0.86 0.03 85 / 0.85)";
  const DIM = "oklch(0.6 0.035 85 / 0.4)";
  const MADDER = "oklch(0.62 0.17 28)";
  const MUSTARD = "oklch(0.78 0.12 85)";
  const WARP = "oklch(0.32 0.05 265 / 0.5)";

  let nodes: LNode[] = [];
  let links: LLink[] = [];
  let alive = true;
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
          cxx + Math.cos(a) * rnd(opts.mini ? 30 : 70 * S, opts.mini ? 72 : 180 * S),
          cyy + Math.sin(a) * rnd(opts.mini ? 26 : 50 * S, opts.mini ? 60 : 120 * S),
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
  // chispa: sin ella la red muere en silencio. Cada anillo nace con UN par
  // activo; las reducciones los consumen y la conmutación engorda la red, así
  // que a los ~20 s quedaba población de sobra (nadie siembra) y cero pares
  // activos (nadie reduce): quietud perpetua, visto en pantalla. Recombinar
  // dos principales libres teje el siguiente par. Con la red poblada de más,
  // el par se fuerza del mismo tipo: su aniquilación la devuelve al tamaño
  // de crucero.
  const spark = (): boolean => {
    const free = nodes.filter((n) => !n.ports[0]);
    if (free.length < 2) return false;
    const a = free[Math.floor(rnd(0, free.length))]!;
    const crowded = nodes.length > (opts.mini ? 34 : 44);
    let pool = free.filter((n) => n !== a && (!crowded || n.k === a.k));
    if (!pool.length) pool = free.filter((n) => n !== a);
    pool.sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y));
    const b = pool[Math.floor(rnd(0, Math.min(3, pool.length)))]!;
    connect(a, 0, b, 0);
    return true;
  };
  let flash: LLink | null = null;
  let flashT = 0;
  function step() {
    // barrer los rombos huérfanos: la aniquilación deja nodos sin ningún
    // hilo, y quedarse flotando muertos ensucia la escena
    nodes = nodes.filter((n) => n.ports.some((p) => p));
    // reponer SIEMPRE que falte población, haya o no interacción en curso:
    // tras una racha de aniquilaciones el lienzo no puede quedarse vacío
    if (nodes.length < (opts.mini ? 24 : 28)) {
      opts.mini
        ? seed(W() / 2 + rnd(-30, 30), rnd(H() * .15, H() * .85))
        : seed(rnd(W() * .2, W() * .8), rnd(H() * .3, H() * .7));
    }
    let l = findActive();
    if (!l) {
      if (!spark()) {
        // ni pares activos ni principales libres: único caso restante de
        // muerte; un anillo nuevo trae su par y la chispa vuelve a operar
        opts.mini
          ? seed(W() / 2 + rnd(-30, 30), rnd(H() * .15, H() * .85))
          : seed(rnd(W() * .2, W() * .8), rnd(H() * .3, H() * .7));
        return;
      }
      l = findActive();
      if (!l) return;
    }
    // par recién tejido y aún estirado: dejar que los muelles acerquen los
    // extremos antes de reducir, que la fusión a distancia teletransporta
    // masa al punto medio y rompe la ilusión física
    if (Math.hypot(l.b.x - l.a.x, l.b.y - l.a.y) > (opts.mini ? 150 : 280 * S)) return;
    flash = l;
    flashT = 1;
    const { a, b } = l;
    setTimeout(() => {
      if (!alive) return;
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
      // cuentakilómetros para poder verificar desde fuera que la red sigue viva
      cv.dataset.itx = String(Number(cv.dataset.itx ?? 0) + 1);
    }, reduced ? 0 : opts.big ? 380 : 520);
  }
  function physics() {
    for (const n of nodes) {
      // mini (tira vertical): X firme para no desbordar la tira estrecha,
      // Y suelto para que los racimos apilados no colapsen al centro.
      // big: tirón firme en ambos ejes — la red ha de quedarse A LA VISTA
      let fx = (W() / 2 - n.x) * (opts.mini ? 0.0016 : opts.big ? 0.0011 : 0.0005),
        fy = (H() / 2 - n.y) * (opts.mini ? 0.0002 : opts.big ? 0.0011 : 0.001);
      for (const m of nodes) {
        if (m !== n) {
          // repulsión ∝ S (no S²): con S² los muelles no la contienen y los
          // anillos revientan hacia los bordes — visto en pantalla. En big,
          // más floja aún: el equilibrio del enjambre ha de caber en la caja
          const dx = n.x - m.x, dy = n.y - m.y, d2 = dx * dx + dy * dy + 60;
          const rep = (opts.big ? 20 : 34) * S;
          fx += dx / d2 * rep;
          fy += dy / d2 * rep;
        }
      }
      n.vx = (n.vx + fx) * 0.92;
      n.vy = (n.vy + fy) * 0.92;
    }
    for (const l of links) {
      const dx = l.b.x - l.a.x,
        dy = l.b.y - l.a.y,
        d = Math.hypot(dx, dy) || 1,
        // el par activo tira 3x: es el hilo en tensión a punto de fusionarse,
        // y sin este empujón se queda flotando por encima del umbral de
        // reducción durante varios ticks (visto con la sonda de depuración)
        f = (d - (opts.mini ? 62 : 115 * S)) * (opts.big ? 0.0035 : 0.002) *
          (l.pa === 0 && l.pb === 0 ? 3 : 1);
      l.a.vx += dx / d * f;
      l.a.vy += dy / d * f;
      l.b.vx -= dx / d * f;
      l.b.vy -= dy / d * f;
    }
    // paredes elásticas: empujan de vuelta en proporción a lo que el nodo se
    // adentra en el margen — nada se sale, pero nadie queda CLAVADO en una
    // línea recta contra el borde (eso pasaba con la valla dura)
    const pad = 46 * S;
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < pad) n.vx += (pad - n.x) * 0.02;
      else if (n.x > W() - pad) n.vx -= (n.x - (W() - pad)) * 0.02;
      if (n.y < pad) n.vy += (pad - n.y) * 0.02;
      else if (n.y > H() - pad) n.vy -= (n.y - (H() - pad)) * 0.02;
    }
  }
  function thread(l: LLink, t: number) {
    const N = 14;
    const ax = l.a.x, ay = l.a.y, bx = l.b.x, by = l.b.y;
    const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1;
    const nx = dy / d, ny = dx / d;
    cx.beginPath();
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const x = ax + dx * u, y = ay + dy * u;
      const w = Math.sin(u * Math.PI * 6 + t * 0.002) * 3.2 * S;
      if (i) cx.lineTo(x - nx * w, y + ny * w);
      else cx.moveTo(x - nx * w, y + ny * w);
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
      cx.lineWidth = (active ? 3 : 1.8) * S;
      cx.strokeStyle = active ? MADDER : (l.pa === 0 || l.pb === 0 ? THREAD : DIM);
      thread(l, t);
    }
    for (const n of nodes) {
      const r = (n.k === "e" ? 6 : 10) * S;
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
        cx.arc(n.x, n.y, (18 + (1 - flashT) * 14) * S, 0, 7);
        cx.lineWidth = 2 * S;
        cx.strokeStyle = MADDER;
        cx.globalAlpha = Math.max(flashT, 0.15);
        cx.stroke();
        cx.globalAlpha = 1;
      }
    }
  }
  if (opts.mini) {
    seed(W() / 2, H() * 0.22);
    seed(W() / 2, H() * 0.5);
    seed(W() / 2, H() * 0.78);
  } else if (opts.big) {
    seed(W() * 0.25, H() * 0.35);
    seed(W() * 0.55, H() * 0.65);
    seed(W() * 0.78, H() * 0.32);
  } else {
    seed(W() * 0.35, H() * 0.45);
    seed(W() * 0.68, H() * 0.5);
  }
  if (reduced) {
    for (let i = 0; i < 200; i++) physics();
    draw(0);
    return () => {
      alive = false;
      removeEventListener("resize", fit);
    };
  }
  const interval = setInterval(step, opts.big ? 950 : 1500);
  const loop = (t: number) => {
    if (!alive) return;
    physics();
    draw(t);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return () => {
    alive = false;
    clearInterval(interval);
    removeEventListener("resize", fit);
  };
}
