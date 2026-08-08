// Worker del minador: Everett criba aquí, fuera del hilo de la página,
// reportando sus pasos compartidos reales.
import { everett, type SiftEvent } from "../../src/criba.ts";
import type { Example } from "../../src/peanito.ts";

type WorkerScope = {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (msg: unknown) => void;
};
const ctx = self as unknown as WorkerScope;

ctx.onmessage = (e) => {
  const { examples, maxDepth, budget } = e.data as {
    examples: Example[];
    maxDepth: number;
    budget: number;
  };
  const events: SiftEvent[] = [];
  const { prog, stats } = everett(
    examples,
    maxDepth,
    budget,
    (steps) => ctx.postMessage({ type: "progress", steps }),
    (e) => events.push(e),
  );
  ctx.postMessage({ type: "done", prog, stats, events });
};
