// El minador (Everett) — todos los controles son primitivas de Base UI;
// la piel viene de los tokens del Telar en styles.css.
import { useEffect, useRef, useState } from "react";
import { NumberField } from "@base-ui/react/number-field";
import type { EverettStats } from "../../src/criba.ts";
import { explain } from "../../src/explain.ts";
import { run, show, size, type Term } from "../../src/peanito.ts";
import { useT } from "./i18n.tsx";
import { type ShorePair, Shores } from "./Shores.tsx";

type Pair = ShorePair;

type Outcome =
  | { kind: "idle" }
  | { kind: "sifting"; steps: number }
  | { kind: "notfound" }
  | {
    kind: "found";
    prog: Term;
    proven: boolean;
    steps: number;
    ms: number;
    verify: [number, number | null][];
  };

const MINER_DEPTH = 5;
const MINER_BUDGET = 50_000_000;

/** presets tejibles: enseñan de un vistazo el terreno que el minador domina */
const PRESETS: [key: string, pairs: [number, number][]][] = [
  ["doble", [[0, 0], [1, 2], [2, 4], [3, 6]]],
  ["mitad", [[0, 0], [1, 0], [2, 1], [3, 1], [4, 2], [5, 2]]],
  ["mas3", [[0, 3], [1, 4], [2, 5]]],
  ["parimpar", [[0, 0], [1, 1], [2, 0], [3, 1], [4, 0]]],
  ["triple", [[0, 0], [1, 3], [2, 6], [3, 9]]],
  ["mod3", [[0, 0], [1, 1], [2, 2], [3, 0], [4, 1], [5, 2], [6, 0]]],
];

let nextId = 100;

function PairField(props: {
  pair: Pair;
  onChange: (p: Pair) => void;
  onRemove: () => void;
  removeLabel: string;
}) {
  const { pair, onChange } = props;
  return (
    <span className="pair">
      <span aria-hidden="true">f(</span>
      <NumberField.Root
        value={pair.x}
        onValueChange={(x) => x !== null && onChange({ ...pair, x })}
        min={0}
        max={30}
        className="nf"
      >
        <NumberField.Input className="nf-input" aria-label="x" />
      </NumberField.Root>
      <span aria-hidden="true">)&nbsp;=</span>
      <NumberField.Root
        value={pair.y}
        onValueChange={(y) => y !== null && onChange({ ...pair, y })}
        min={0}
        max={99}
        className="nf"
      >
        <NumberField.Input className="nf-input" aria-label="f(x)" />
      </NumberField.Root>
      <button
        type="button"
        className="pair-del"
        onClick={props.onRemove}
        aria-label={props.removeLabel}
      >
        ✕
      </button>
    </span>
  );
}

export function Miner() {
  const { lang, t } = useT();
  const [pairs, setPairsRaw] = useState<Pair[]>([
    { id: 0, x: 0, y: 0 },
    { id: 1, x: 1, y: 2 },
    { id: 2, x: 2, y: 4 },
    { id: 3, x: 3, y: 6 },
  ]);
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });
  const workerRef = useRef<Worker | null>(null);
  const startRef = useRef(0);

  const stopWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };
  useEffect(() => stopWorker, []);

  // cambiar los ejemplos invalida el resultado: nada rancio en pantalla
  const setPairs = (next: Pair[]) => {
    setPairsRaw(next);
    stopWorker();
    setOutcome({ kind: "idle" });
  };

  const busy = outcome.kind === "sifting";

  const sift = () => {
    const examples = pairs.map((p) => [p.x, p.y] as [number, number]);
    if (!examples.length) return;
    stopWorker();
    setOutcome({ kind: "sifting", steps: 0 });
    startRef.current = performance.now();
    const w = new Worker("dist/miner-worker.js", { type: "module" });
    workerRef.current = w;
    w.onmessage = (e: MessageEvent) => {
      if (workerRef.current !== w) return; // mensaje de una criba muerta
      const msg = e.data as
        | { type: "progress"; steps: number }
        | { type: "done"; prog: Term | null; stats: EverettStats };
      if (msg.type === "progress") {
        setOutcome((o) => o.kind === "sifting" ? { kind: "sifting", steps: msg.steps } : o);
        return;
      }
      const ms = performance.now() - startRef.current;
      workerRef.current = null;
      w.terminate();
      if (!msg.prog) setOutcome({ kind: "notfound" });
      else {
        const prog = msg.prog;
        const maxX = Math.max(...examples.map(([x]) => x));
        setOutcome({
          kind: "found",
          prog,
          proven: msg.stats.provenMinimal,
          steps: msg.stats.steps,
          ms,
          verify: [maxX + 1, maxX + 2, maxX + 3].map((x) => [x, run(prog, x, 100_000)]),
        });
      }
    };
    w.postMessage({ examples, maxDepth: MINER_DEPTH, budget: MINER_BUDGET });
  };

  return (
    <section className="miner" id="miner">
      <div className="frame">
        <h2>{t.minerh2}</h2>
        <p className="intro">{t.minerIntro}</p>
        <p className="sub">{t.minersub}</p>
        <div className="presets" role="group" aria-label="Funciones de ejemplo">
          {PRESETS.map(([key, ps]) => (
            <button
              type="button"
              key={key}
              className="preset"
              onClick={() => setPairs(ps.map(([x, y]) => ({ id: nextId++, x, y })))}
            >
              {t.presets[key as keyof typeof t.presets]}
            </button>
          ))}
        </div>
        <div className="bench">
          <Shores
            pairs={pairs}
            onChange={setPairs}
            ghost={outcome.kind === "found" ? (x) => run(outcome.prog, x, 100_000) : null}
          />
          <details className="text-editor">
            <summary>{t.editAsText}</summary>
            <div className="pairs">
              {pairs.map((p) => (
                <PairField
                  key={p.id}
                  pair={p}
                  onChange={(np) => setPairs(pairs.map((q) => q.id === p.id ? np : q))}
                  onRemove={() => setPairs(pairs.filter((q) => q.id !== p.id))}
                  removeLabel={t.delPair}
                />
              ))}
              <button
                type="button"
                className="pair pair-add"
                onClick={() => {
                  const used = new Set(pairs.map((q) => q.x));
                  let x = 0;
                  while (used.has(x)) x++;
                  setPairs([...pairs, { id: nextId++, x, y: 0 }]);
                }}
              >
                + {t.addPair}
              </button>
            </div>
          </details>
          <button type="button" className="run" onClick={sift} disabled={busy}>
            {busy ? t.running : t.run}
          </button>
          <div className="out" aria-live="polite">
            {outcome.kind === "idle" && <p className="meta">{t.outidle}</p>}
            {outcome.kind === "sifting" && (
              <p className="meta">
                {outcome.steps.toLocaleString(lang)} {t.sharedSteps}…
              </p>
            )}
            {outcome.kind === "notfound" && <p className="meta fail">{t.notfound}</p>}
            {outcome.kind === "found" && (
              <>
                <p className="found-head">{t.foundHead}</p>
                <pre className="recipe">{explain(outcome.prog, lang)}</pre>
                <p className="meta">
                  {size(outcome.prog)} {t.pieces} — {outcome.proven ? t.foundProven : t.foundBest} ·
                  {" "}
                  {t.foundIn} {outcome.ms.toFixed(0)} ms · {outcome.steps.toLocaleString(lang)}{" "}
                  {t.sharedSteps}
                </p>
                <p className="verify">
                  {t.verify} {outcome.verify.map(([x, y], i) => (
                    <span key={x}>
                      {i > 0 && " · "}f({x}) = <b>{y}</b>
                    </span>
                  ))}
                </p>
                <p className="raw">
                  {t.rawIntro} <code>{show(outcome.prog)}</code>
                  <span className="raw-legend">{t.rawLegend}</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
