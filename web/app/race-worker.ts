// Worker de la carrera: el método clásico muele aquí, fuera del hilo de la
// página, informando de sus β-pasos reales — el contador que ves es trabajo
// de verdad, no una animación.
import { naiveDemo } from "../../src/telar.ts";

type WorkerScope = {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (msg: unknown) => void;
};
const ctx = self as unknown as WorkerScope;

ctx.onmessage = (e) => {
  const { n, budget } = e.data as { n: number; budget: number };
  let last = 0;
  const r = naiveDemo(n, budget, (betas) => {
    last = betas;
    ctx.postMessage({ type: "progress", betas });
  });
  if (r) ctx.postMessage({ type: "done", betas: r.betas });
  else ctx.postMessage({ type: "dnf", betas: last });
};
