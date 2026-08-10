// Sección «una CPU por dentro»: la máquina de la cadena y su peaje de
// memoria. Escena: núcleo (rombo, izquierda), cache (despensa de casillas
// junto al núcleo), memoria (rejilla, derecha) y abajo la tela de UN carril:
// celda = ciclo computando, hueco = ciclo esperando a la memoria. El
// porcentaje es medición real sobre la tela; la carga es simulada.
//   chain  cadena de dependencias: todo en el núcleo, sin viajes, 100%
//   array  lectura en orden: un viaje trae la fila entera, la apuesta acierta
//   chase  caza de punteros: un viaje por dato, el núcleo espera

export type CpuMode = "chain" | "array" | "chase";

const MUSTARD = "oklch(0.78 0.12 85)";
const MADDER = "oklch(0.62 0.17 28)";
const THREAD = "oklch(0.9 0.025 85)";
const WARP = "oklch(0.34 0.05 265)";
const DIMCELL = "oklch(0.3 0.045 265)";

const TICK_MS = 80;
const PCT_WINDOW = 120;
const LINE = 12; // palabras que caben en la despensa (una fila de memoria)
const MEM_COLS = 8, MEM_ROWS = 6;

export function mountCpu(
  cv: HTMLCanvasElement,
  getMode: () => CpuMode,
  onPct: (pct: number) => void,
  isVisible: () => boolean = () => true,
): () => void {
  const cx = cv.getContext("2d")!;
  const fit = () => {
    cv.width = cv.clientWidth * devicePixelRatio;
    cv.height = cv.clientHeight * devicePixelRatio;
  };
  fit();
  addEventListener("resize", fit);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let mode: CpuMode = getMode();
  let ribbon: number[] = [];
  let pantry = 0;
  let travel = 0;
  let travelTotal = 0;
  let pending = 0;
  let seq = 0;
  let target = 0; // celda de memoria en tránsito
  const touched = new Set<number>(); // celdas ya consumidas (modo array)

  function reset() {
    ribbon = [];
    pantry = 0;
    travel = 0;
    travelTotal = 0;
    pending = 0;
    seq = 0;
    target = 0;
    touched.clear();
  }

  // un tick de la máquina: devuelve 1 si el núcleo computó, 0 si esperó
  function tick(): number {
    if (mode === "chain") return 1;
    if (travel > 0) {
      travel--;
      if (travel === 0) {
        if (mode === "array") {
          pantry = LINE;
          touched.add(target);
          if (touched.size >= MEM_COLS * MEM_ROWS) touched.clear();
        } else {
          pending = 1;
        }
      }
      return 0;
    }
    if (mode === "array") {
      if (pantry > 0) {
        pantry--;
        return 1;
      }
      target = seq++ % (MEM_COLS * MEM_ROWS);
      travelTotal = travel = 2;
      return 0;
    }
    // chase: un dato por viaje, y vuelta a saltar
    if (pending > 0) {
      pending--;
      return 1;
    }
    target = Math.floor(Math.random() * MEM_COLS * MEM_ROWS);
    travelTotal = travel = 5;
    return 0;
  }

  // ─── geometría ───
  const S = () => devicePixelRatio;
  const ribbonH = () => 40 * S();
  const sceneH = () => cv.height - ribbonH() - 14 * S();
  const coreX = () => cv.width * 0.14;
  const coreY = () => sceneH() * 0.52;
  function memCell(i: number): [number, number] {
    const s = S();
    const cell = Math.min(20 * s, cv.width * 0.045);
    const gap = 7 * s;
    const gw = MEM_COLS * cell + (MEM_COLS - 1) * gap;
    const gh = MEM_ROWS * cell + (MEM_ROWS - 1) * gap;
    const x0 = cv.width * 0.94 - gw;
    const y0 = coreY() - gh / 2;
    const c = i % MEM_COLS, r = Math.floor(i / MEM_COLS);
    return [x0 + c * (cell + gap) + cell / 2, y0 + r * (cell + gap) + cell / 2];
  }
  const memSize = () => Math.min(20 * S(), cv.width * 0.045);

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

  function draw() {
    const W = cv.width, H = cv.height, s = S();
    cx.clearRect(0, 0, W, H);
    const working = ribbon.length > 0 && ribbon[ribbon.length - 1] === 1;

    // memoria: la rejilla lejana
    const cell = memSize();
    for (let i = 0; i < MEM_COLS * MEM_ROWS; i++) {
      const [x, y] = memCell(i);
      if (mode === "array" && touched.has(i)) {
        cx.globalAlpha = 0.35;
        cx.fillStyle = MUSTARD;
        cx.fillRect(x - cell / 2, y - cell / 2, cell, cell);
        cx.globalAlpha = 1;
      }
      cx.lineWidth = 1.2 * s;
      cx.strokeStyle = travel > 0 && i === target ? THREAD : DIMCELL;
      cx.strokeRect(x - cell / 2, y - cell / 2, cell, cell);
    }

    // el cable núcleo-memoria y el dato viajando
    const [tx, ty] = memCell(target);
    cx.lineWidth = 1 * s;
    cx.strokeStyle = WARP;
    cx.beginPath();
    cx.moveTo(coreX() + 16 * s, coreY());
    cx.lineTo(W * 0.94 - MEM_COLS * cell, coreY());
    cx.stroke();
    if (travel > 0) {
      const u = 1 - travel / travelTotal;
      const x = tx + (coreX() - tx) * u;
      const y = ty + (coreY() - ty) * u;
      cx.fillStyle = MUSTARD;
      cx.beginPath();
      cx.arc(x, y, 5 * s, 0, 7);
      cx.fill();
    }

    // la despensa (cache): dos columnas de casillas junto al núcleo
    const ps = 10 * s, pg = 4 * s;
    for (let i = 0; i < LINE; i++) {
      const col = Math.floor(i / 6), row = i % 6;
      const x = coreX() + 26 * s + col * (ps + pg);
      const y = coreY() - (6 * (ps + pg)) / 2 + row * (ps + pg);
      if (i < pantry) {
        cx.fillStyle = MUSTARD;
        cx.fillRect(x, y, ps, ps);
      } else {
        cx.lineWidth = 1 * s;
        cx.strokeStyle = DIMCELL;
        cx.strokeRect(x, y, ps, ps);
      }
    }

    // el núcleo: encendido cuando computa, apagado cuando espera
    diamond(coreX(), coreY(), 15 * s, working ? THREAD : WARP, 1);

    // la tela de un carril, abajo
    const laneY = H - ribbonH() / 2;
    cx.lineWidth = 1 * s;
    cx.strokeStyle = WARP;
    cx.beginPath();
    cx.moveTo(0, laneY);
    cx.lineTo(W, laneY);
    cx.stroke();
    const cw = 9 * s;
    const n = ribbon.length;
    for (let k = 0; k < n; k++) {
      if (!ribbon[k]) continue;
      const x = W - 14 * s - (n - 1 - k) * cw;
      if (x + cw < 0) continue;
      cx.globalAlpha = 0.78 + 0.22 * (k % 2);
      cx.fillStyle = mode === "chase" ? MADDER : MUSTARD;
      cx.fillRect(x, laneY - 13 * s, cw - 1.2 * s, 26 * s);
    }
    cx.globalAlpha = 1;
    cx.fillStyle = THREAD;
    cx.fillRect(W - 8 * s, laneY - 20 * s, 2.4 * s, 40 * s);
  }

  function reportPct() {
    const last = ribbon.slice(-PCT_WINDOW);
    const worked = last.reduce((a, b) => a + b, 0);
    onPct(last.length ? Math.round(100 * worked / last.length) : 0);
  }

  let tickCount = 0;
  function step() {
    if (!isVisible()) return;
    if (getMode() !== mode) {
      mode = getMode();
      reset();
    }
    tickCount++;
    ribbon.push(tick());
    const maxCols = Math.ceil(cv.width / (9 * devicePixelRatio)) + 4;
    while (ribbon.length > maxCols) ribbon.shift();
    draw();
    if (tickCount % 5 === 0) reportPct();
  }

  if (reduced) {
    for (let i = 0; i < 260; i++) ribbon.push(tick());
    travel = 0;
    draw();
    reportPct();
    return () => removeEventListener("resize", fit);
  }

  const interval = setInterval(step, TICK_MS);
  return () => {
    clearInterval(interval);
    removeEventListener("resize", fit);
  };
}
