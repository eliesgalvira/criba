// El telar del hero: maqueta visual estilizada de reducción de una red de
// interacciones (aniquilación / conmutación / borrado) con render de hilos
// sobre urdimbre. Capa de arte, no es un widget; el canvas es nuestro.

type LNode = { k: string; x: number; y: number; vx: number; vy: number; ports: (LLink | null)[] };
type LLink = { a: LNode; pa: number; b: LNode; pb: number };
type XY = [number, number];

export interface LoomOpts {
  /** tira vertical estrecha: anillos y enlaces cortos, racimos apilados */
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
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const W = () => cv.width;
  const H = () => cv.height;
  const THREAD = "oklch(0.86 0.03 85 / 0.85)";
  const DIM = "oklch(0.6 0.035 85 / 0.4)";
  const MADDER = "oklch(0.62 0.17 28)";
  const MUSTARD = "oklch(0.78 0.12 85)";
  const WARP = "oklch(0.32 0.05 265 / 0.5)";

  // cada modo resuelto UNA vez; del perfil para abajo el código no sabe de
  // modos. mini: X firme para no desbordar la tira estrecha, Y suelta para
  // que los racimos apilados no colapsen al centro. big: repulsión más floja
  // (el equilibrio del enjambre ha de caber en la caja). hero: tirón firme en
  // ambos ejes, que antes vivía aplastado contra los bordes.
  const P = opts.mini
    ? {
      starts: (): XY[] => [[W() / 2, H() * .22], [W() / 2, H() * .5], [W() / 2, H() * .78]],
      spot: (): XY => [W() / 2 + rnd(-30, 30), rnd(H() * .15, H() * .85)],
      ringX: [30, 72] as XY,
      ringY: [26, 60] as XY,
      cap0: 24,
      cap1: 30,
      fuse: 150,
      reach: 170,
      pullX: 0.0016,
      pullY: 0.0002,
      rep: 34,
      rest: 62,
      spring: 0.002,
      tick: 1500,
      flashMs: 520,
    }
    : opts.big
    ? {
      starts: (): XY[] => [[W() * .25, H() * .35], [W() * .55, H() * .65], [W() * .78, H() * .32]],
      spot: (): XY => [rnd(W() * .2, W() * .8), rnd(H() * .3, H() * .7)],
      ringX: [70 * S, 180 * S] as XY,
      ringY: [50 * S, 120 * S] as XY,
      cap0: 24,
      cap1: 36,
      fuse: 280 * S,
      reach: 360 * S,
      pullX: 0.0011,
      pullY: 0.0011,
      rep: 20 * S,
      rest: 115 * S,
      spring: 0.0035,
      tick: 950,
      flashMs: 380,
    }
    : {
      starts: (): XY[] => [[W() * .35, H() * .45], [W() * .68, H() * .5]],
      spot: (): XY => [rnd(W() * .2, W() * .8), rnd(H() * .3, H() * .7)],
      ringX: [70, 180] as XY,
      ringY: [50, 120] as XY,
      cap0: 16,
      cap1: 30,
      fuse: 280,
      reach: 360,
      pullX: 0.0011,
      pullY: 0.0011,
      rep: 34,
      rest: 115,
      spring: 0.002,
      tick: 1500,
      flashMs: 520,
    };

  // la red crece durante ~2.5 min y ahí se queda: techo de población que sube
  // de cap0 a cap1; por encima la chispa fuerza pares del mismo tipo (su
  // aniquilación encoge) y muy por debajo se siembra un anillo nuevo
  const born = performance.now();
  const cap = () => P.cap0 + (P.cap1 - P.cap0) * Math.min(1, (performance.now() - born) / 150_000);

  let nodes: LNode[] = [];
  let links: LLink[] = [];
  let alive = true;
  const kinds = ["g", "g", "d", "d", "e"];
  const randKind = () => kinds[Math.floor(rnd(0, kinds.length))]!;
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
      ring.push(addNode(
        randKind(),
        cxx + Math.cos(a) * rnd(P.ringX[0], P.ringX[1]),
        cyy + Math.sin(a) * rnd(P.ringY[0], P.ringY[1]),
      ));
    }
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i]!, b = ring[(i + 1) % ring.length]!;
      const pa = a.ports.findIndex((p) => !p), pb = b.ports.findIndex((p) => !p);
      if (pa >= 0 && pb >= 0) connect(a, pa, b, pb);
    }
    const m = addNode(randKind(), cxx + rnd(-50, 50), cyy + rnd(-40, 40));
    const t = ring[0]!;
    if (!t.ports[0] && !m.ports[0]) connect(t, 0, m, 0);
  }
  const reseed = () => {
    const [x, y] = P.spot();
    seed(x, y);
  };
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
  // solo cuentan los pares ya a distancia de fusión: elegir uno lejano
  // bloqueaba TODA reducción hasta congelar el telar (visto en arnés); uno
  // recién tejido y aún estirado espera a que los muelles acerquen los
  // extremos, que la fusión a distancia teletransporta masa al punto medio.
  // Entre los fusionables, la población elige: sobre el techo, un par que
  // encoge (aniquilación o borrado); por debajo, uno que crece (conmutación).
  const activePairs = () => links.filter((l) => l.pa === 0 && l.pb === 0);
  const isShrink = (l: LLink) => l.a.k === l.b.k || l.a.k === "e" || l.b.k === "e";
  const findActive = (): LLink | null => {
    const near = activePairs().filter((l) => Math.hypot(l.b.x - l.a.x, l.b.y - l.a.y) <= P.fuse);
    const pref = nodes.length > cap() ? near.find(isShrink) : near.find((l) => !isShrink(l));
    return pref ?? near[0] ?? null;
  };
  // chispa: sin ella la red muere en silencio (cada anillo nace con UN par
  // activo y las reducciones los consumen). Recombinar dos principales libres
  // teje el siguiente par. Se teje solo al alcance: un hilo a media pantalla
  // cruza el hero entero mientras la tensión junta los extremos.
  const spark = (): boolean => {
    let free = nodes.filter((n) => !n.ports[0]);
    if (free.length < 2) return false;
    const crowded = nodes.length > cap();
    if (crowded) {
      // en modo encoger, partir de un tipo con al menos DOS puertos libres;
      // si a se elige a ciegas, el fallback teje pares mixtos que agrandan
      const paired = free.filter((n) => free.some((m) => m !== n && m.k === n.k));
      if (paired.length) free = paired;
    }
    const a = free[Math.floor(rnd(0, free.length))]!;
    let pool = free.filter((n) => n !== a && (!crowded || n.k === a.k));
    if (!pool.length) pool = free.filter((n) => n !== a);
    pool.sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y));
    const near = pool.filter((n) => Math.hypot(n.x - a.x, n.y - a.y) < P.reach);
    const pick = near.length ? near : pool.slice(0, 1);
    const b = pick[Math.floor(rnd(0, Math.min(3, pick.length)))]!;
    connect(a, 0, b, 0);
    return true;
  };
  let flash: LLink | null = null;
  let flashT = 0;
  function step() {
    // barrer los rombos huérfanos: la aniquilación deja nodos sin ningún hilo
    nodes = nodes.filter((n) => n.ports.some((p) => p));
    // el descosido: sobre el techo el telar recoge los nodos más sueltos.
    // Presión directa que ninguna cadena de conmutaciones (+2 cada una)
    // puede ganar; los sesgos de chispa y de elección de par solos no
    // bastan, medido en arnés: 250-380 nodos a los 5 min y física O(n²)
    // que congela la página
    const deg = (n: LNode) => n.ports.filter(Boolean).length;
    for (let i = Math.min(2, nodes.length - Math.round(cap())); i > 0; i--) {
      removeNode([...nodes].sort((p, q) => deg(p) - deg(q))[0]!);
    }
    // tras una racha de aniquilaciones el lienzo no puede quedarse vacío
    if (nodes.length < cap() - 12) reseed();
    if (!activePairs().length && !spark()) {
      // ni pares activos ni principales libres: único caso restante de
      // muerte; un anillo nuevo trae su par y la chispa vuelve a operar
      reseed();
      return;
    }
    const l = findActive();
    // todos los pares siguen estirados: los muelles están en ello
    if (!l) return;
    flash = l;
    flashT = 1;
    const { a, b } = l;
    setTimeout(() => {
      if (!alive) return;
      // si a y b comparten además un hilo auxiliar, sus cabos se apuntan
      // entre sí: reconectar hacia el nodo eliminado dejaba un enlace
      // fantasma anclado a un punto invisible (hilos que mueren en la nada,
      // visto en pantalla y reproducido en arnés)
      const others = (n: LNode) => outsOf(n).filter((o) => o.n !== a && o.n !== b);
      if (a.k === b.k) {
        const ends = [...others(a), ...others(b)];
        removeNode(a);
        removeNode(b);
        // reconectar huérfanos por cercanía: emparejarlos por orden de array
        // tejía hilos de esquina a esquina de la pantalla
        while (ends.length > 1) {
          const p = ends.shift()!;
          let j = 0;
          for (let i = 1; i < ends.length; i++) {
            const di = Math.hypot(ends[i]!.n.x - p.n.x, ends[i]!.n.y - p.n.y);
            const dj = Math.hypot(ends[j]!.n.x - p.n.x, ends[j]!.n.y - p.n.y);
            if (di < dj) j = i;
          }
          const q = ends.splice(j, 1)[0]!;
          if (!p.n.ports[p.p] && !q.n.ports[q.p]) connect(p.n, p.p, q.n, q.p);
        }
      } else if (a.k === "e" || b.k === "e") {
        const er = a.k === "e" ? a : b, ot = a.k === "e" ? b : a;
        const outs = others(ot);
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
        const outsA = others(a), outsB = others(b);
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
      // cuentakilómetros para poder verificar desde fuera que la red sigue
      // viva y que la población respeta el techo
      cv.dataset.itx = String(Number(cv.dataset.itx ?? 0) + 1);
      cv.dataset.pop = String(nodes.length);
    }, reduced ? 0 : P.flashMs);
  }
  function physics() {
    for (const n of nodes) {
      let fx = (W() / 2 - n.x) * P.pullX, fy = (H() / 2 - n.y) * P.pullY;
      for (const m of nodes) {
        if (m !== n) {
          // repulsión ∝ S (no S²): con S² los muelles no la contienen y los
          // anillos revientan hacia los bordes, visto en pantalla
          const dx = n.x - m.x, dy = n.y - m.y, d2 = dx * dx + dy * dy + 60;
          fx += dx / d2 * P.rep;
          fy += dy / d2 * P.rep;
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
        f = (d - P.rest) * P.spring * (l.pa === 0 && l.pb === 0 ? 3 : 1);
      l.a.vx += dx / d * f;
      l.a.vy += dy / d * f;
      l.b.vx -= dx / d * f;
      l.b.vy -= dy / d * f;
    }
    // paredes elásticas: empujan de vuelta en proporción a lo que el nodo se
    // adentra en el margen; nada se sale, pero nadie queda CLAVADO en una
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
      // el borrador apenas más pequeño que un principal: a 6 casi no se veía
      const r = (n.k === "e" ? 8.5 : 10) * S;
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
  for (const [x, y] of P.starts()) seed(x, y);
  if (reduced) {
    for (let i = 0; i < 200; i++) physics();
    draw(0);
    return () => {
      alive = false;
      removeEventListener("resize", fit);
    };
  }
  const interval = setInterval(step, P.tick);
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
