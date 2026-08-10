// Sección «regular e irregular»: la ocupación de una GPU como tela que sale
// del telar. 32 carriles (filas), un ciclo de reloj por columna; celda
// encendida = el carril trabajó ese ciclo, hueco = silicio parado. El
// porcentaje es una medición real sobre las columnas dibujadas; la carga de
// trabajo es sintética (simulador), y el copy no afirma otra cosa.
//   grid   terreno de la GPU: 32 carriles llenos, tela cerrada
//   split  un «si» parte los datos en dos ramas; una rama por pasada, 50%
//   tree   trabajo vivo EN LA GPU: por tandas en formación, burbujas y vacíos
//   loom   el mismo trabajo repartido sobre la marcha, tarea a tarea

export type ParMode = "grid" | "split" | "tree" | "loom";

const MUSTARD = "oklch(0.78 0.12 85)";
const MADDER = "oklch(0.62 0.17 28)";
const WARP = "oklch(0.34 0.05 265)";
const COMB = "oklch(0.9 0.025 85)";

const LANES = 32;
const TICK_MS = 80;
const PCT_WINDOW = 120;

export function mountIrregular(
  cv: HTMLCanvasElement,
  getMode: () => ParMode,
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

  let mode: ParMode = getMode();
  let cols: Uint8Array[] = []; // por columna: 0 hueco, 1 mostaza, 2 rubia
  let tick = 0;

  // la carga viva compartida por los pasos 3 y 4: una cola de tareas con
  // DEPENDENCIAS. El cálculo alterna regímenes de expansión (cada tarea
  // acabada engendra 1..3 hijas) y poda (casi ninguna), cada uno con su
  // intensidad; la cola va capada a la frontera del árbol. Sin esto, el
  // backlog alisa la ocupación al 100% y la irregularidad no se ve.
  let queue = 1;
  let boom = true;
  let regimeLeft = 26;
  let fert = 1.6;
  const QCAP = 24;
  const rem = new Array(LANES).fill(0);
  function regime() {
    if (--regimeLeft <= 0) {
      boom = !boom;
      regimeLeft = boom ? 16 + Math.floor(Math.random() * 22) : 14 + Math.floor(Math.random() * 18);
      fert = boom ? 1.25 + Math.random() * 0.75 : 0.2 + Math.random() * 0.6;
    }
  }
  function spawnFrom(finished: number) {
    for (let j = 0; j < finished; j++) {
      const k = Math.min(3, Math.floor(fert) + (Math.random() < fert % 1 ? 1 : 0));
      queue = Math.min(QCAP, queue + k);
    }
  }

  // paso 4, el telar: cada carril toma una tarea en cuanto existe
  function loomColumn(): Uint8Array {
    regime();
    const col = new Uint8Array(LANES);
    let busy = 0;
    for (let i = 0; i < LANES; i++) {
      if (rem[i] > 0) {
        rem[i]--;
        col[i] = 1;
        busy++;
        if (rem[i] === 0) spawnFrom(1);
      } else if (queue > 0) {
        queue--;
        rem[i] = 2 + Math.floor(Math.random() * 5);
        col[i] = 1;
        busy++;
      }
    }
    // en expansión, la rama casi seca recibe empujón: las sequías se ven
    // (todo pende de un par de carriles) pero no se eternizan
    if (boom && busy < 4) queue = Math.min(QCAP, queue + 1);
    if (queue === 0 && rem.every((x) => x === 0)) queue = 1;
    return col;
  }

  // paso 3, la MISMA carga en la GPU: avanza por tandas en formación.
  // Lanza un lote (hasta 32 tareas), espera a que acabe la más lenta (los
  // carriles cortos burbujean) y paga el hueco de lanzar el siguiente. Las
  // tareas acabadas SÍ descubren a sus hijas al morir (lo justo), pero
  // ningún carril puede empezarlas a mitad de tanda: no es su arquitectura.
  let waveLeft = 0;
  let launchGap = 0;
  function gpuColumn(): Uint8Array {
    regime();
    const col = new Uint8Array(LANES);
    if (waveLeft === 0) {
      if (launchGap > 0) {
        launchGap--;
        return col; // columna vacía: el coste de lanzar la tanda
      }
      if (queue === 0) queue = 1;
      const waveSize = Math.min(LANES, queue);
      queue -= waveSize;
      let maxDur = 0;
      for (let i = 0; i < LANES; i++) {
        rem[i] = i < waveSize ? 2 + Math.floor(Math.random() * 5) : 0;
        maxDur = Math.max(maxDur, rem[i]);
      }
      waveLeft = maxDur;
    }
    let busy = 0;
    for (let i = 0; i < LANES; i++) {
      if (rem[i] > 0) {
        rem[i]--;
        col[i] = 1;
        busy++;
        if (rem[i] === 0) spawnFrom(1);
      }
    }
    waveLeft--;
    // el mismo rescate de sequía que el telar: la carga revive igual para
    // ambos; la diferencia que queda es solo de arquitectura
    if (boom && busy < 4) queue = Math.min(QCAP, queue + 1);
    if (waveLeft === 0) launchGap = 2;
    return col;
  }

  function makeColumn(): Uint8Array {
    const col = new Uint8Array(LANES);
    if (mode === "grid") {
      col.fill(1);
      return col;
    }
    if (mode === "split") {
      const phase = Math.floor(tick / 14) % 2;
      for (let i = 0; i < LANES; i++) {
        const branch = 1 - (i % 2);
        if (branch === phase) col[i] = branch === 0 ? 1 : 2;
      }
      return col;
    }
    return mode === "tree" ? gpuColumn() : loomColumn();
  }

  function draw() {
    const W = cv.width, H = cv.height, S = devicePixelRatio;
    cx.clearRect(0, 0, W, H);
    const cw = 9 * S;
    const laneH = H / LANES;
    // los 32 carriles, siempre presentes: desnudos bajo los huecos
    cx.lineWidth = 1 * S;
    cx.strokeStyle = WARP;
    for (let i = 0; i < LANES; i++) {
      const y = laneH * (i + 0.5);
      cx.beginPath();
      cx.moveTo(0, y);
      cx.lineTo(W, y);
      cx.stroke();
    }
    // la tela: la columna más nueva entra por la derecha
    const n = cols.length;
    for (let k = 0; k < n; k++) {
      const x = W - 14 * S - (n - 1 - k) * cw;
      if (x + cw < 0) continue;
      const col = cols[k]!;
      for (let i = 0; i < LANES; i++) {
        if (!col[i]) continue;
        cx.fillStyle = col[i] === 1 ? MUSTARD : MADDER;
        // textura: alterna levemente la opacidad, como sarga
        cx.globalAlpha = 0.78 + 0.22 * ((i + k) % 2);
        cx.fillRect(x, laneH * i + 1.2 * S, cw - 1.2 * S, laneH - 2.4 * S);
      }
    }
    cx.globalAlpha = 1;
    // el frente de avance
    cx.fillStyle = COMB;
    cx.fillRect(W - 8 * S, 0, 2.4 * S, H);
  }

  function reportPct() {
    const last = cols.slice(-PCT_WINDOW);
    let woven = 0;
    for (const c of last) for (let i = 0; i < LANES; i++) if (c[i]) woven++;
    onPct(last.length ? Math.round(100 * woven / (last.length * LANES)) : 0);
  }

  function reset() {
    cols = [];
    tick = 0;
    queue = 1;
    boom = true;
    regimeLeft = 26;
    fert = 1.6;
    rem.fill(0);
    waveLeft = 0;
    launchGap = 0;
  }

  function step() {
    // fuera de pantalla la tela se congela: no gasta y no avanza a escondidas
    if (!isVisible()) return;
    if (getMode() !== mode) {
      mode = getMode();
      reset();
    }
    tick++;
    cols.push(makeColumn());
    const maxCols = Math.ceil(cv.width / (9 * devicePixelRatio)) + 4;
    while (cols.length > maxCols) cols.shift();
    draw();
    if (tick % 5 === 0) reportPct();
  }

  if (reduced) {
    // fotograma representativo, sin bucle (remonta por paso desde React)
    for (let i = 0; i < 260; i++) {
      tick++;
      cols.push(makeColumn());
    }
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
