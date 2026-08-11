// El minador (Everett) — todos los controles son primitivas de Base UI;
// la piel viene de los tokens del Telar en styles.css.
import { useEffect, useReducer, useRef, useState } from "react";
import { NumberField } from "@base-ui/react/number-field";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import type { EverettStats } from "../../src/criba.ts";
import { explain, explainLoop, explainPatterns } from "../../src/explain.ts";
import { run, show, size, type Term } from "../../src/peanito.ts";
import { pickTraceInput, trace } from "../../src/trace.ts";
import { useT } from "./i18n.tsx";
import { mountLoom } from "./loom.ts";
import { type ShorePair, Shores } from "./Shores.tsx";

type Pair = ShorePair;

type Found = {
  kind: "found";
  prog: Term;
  proven: boolean;
  steps: number;
  ms: number;
  verify: [number, number | null][];
};
type SiftResult = { kind: "notfound" } | Found;

/** El ciclo de la criba como máquina de estados, una fase cada vez:
 *  idle → sifting → shown. En sifting, `prev` mantiene el resultado
 *  anterior en pantalla (stale-while-sifting); el mini-telar solo
 *  entra pasados 800 ms. */
type MineState =
  | { phase: "idle" }
  | { phase: "sifting"; steps: number; loaderOn: boolean; prev: SiftResult | null }
  | { phase: "shown"; result: SiftResult; steps: number };

type MineAction =
  | { type: "reset" }
  | { type: "start" }
  | { type: "loader" }
  | { type: "progress"; steps: number }
  | { type: "done"; result: SiftResult; steps: number };

function mineReducer(s: MineState, a: MineAction): MineState {
  switch (a.type) {
    case "reset":
      return { phase: "idle" };
    case "start":
      return {
        phase: "sifting",
        steps: 0,
        loaderOn: false,
        prev: s.phase === "shown" ? s.result : null,
      };
    case "loader":
      return s.phase === "sifting" ? { ...s, loaderOn: true } : s;
    case "progress":
      return s.phase === "sifting" ? { ...s, steps: a.steps } : s;
    case "done":
      return { phase: "shown", result: a.result, steps: a.steps };
  }
}

const MINER_DEPTH = 5;
const MINER_BUDGET = 50_000_000;

/** reglas ya tejidas: pestañas que enseñan el terreno que el minador domina */
const PRESETS: [key: string, pairs: [number, number][]][] = [
  ["doble", [[0, 0], [1, 2], [2, 4], [3, 6]]],
  ["triple", [[0, 0], [1, 3], [2, 6], [3, 9]]],
  ["mitad", [[0, 0], [1, 0], [2, 1], [3, 1], [4, 2], [5, 2]]],
  ["mas3", [[0, 3], [1, 4], [2, 5]]],
  ["resta2", [[0, 0], [1, 0], [2, 0], [3, 1], [4, 2], [5, 3]]],
  ["parimpar", [[0, 0], [1, 1], [2, 0], [3, 1], [4, 0]]],
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

/** mini-telar: la animación del hero, reutilizada como loader de la criba */
function MiniLoom() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => mountLoom(ref.current!, { mini: true }), []);
  return <canvas ref={ref} className="miniloom" aria-hidden="true" />;
}

type RecipeView = "loop" | "trace" | "cases" | "patterns";

function TraceView({ prog, examples }: { prog: Term; examples: [number, number][] }) {
  const { lang, t } = useT();
  const maxX = Math.max(...examples.map(([x]) => x));
  const candidates = [maxX + 1, maxX + 2, maxX, maxX + 3, 3, 4, 5];
  const n = pickTraceInput(prog, candidates);
  if (n === null) return null;
  const tr = trace(prog, n);
  if (!tr) return null;
  const jots: number[] = [];
  for (const s of tr.steps) {
    if (s.add > 0) jots.push(s.add);
    if (s.next === null && (s.base ?? 0) > 0) jots.push(s.base!);
  }
  return (
    <div className="trace">
      <p className="trace-head">
        {t.trHead} {n}:
      </p>
      <pre className="recipe">
        {tr.steps.map((s) => {
          if (s.next === null) {
            return `${s.v} ▸ ${t.trEnd} ${(s.add > 0 ? `${s.add} + ` : "") + s.base}
`;
          }
          if (s.add > 0) return `${s.v} ▸ ${t.trJot} ${s.add} ${t.trFollow} ${s.next}
`;
          return `${s.v} ▸ ${t.trFollowOnly} ${s.next}
`;
        }).join("")}
        {`${t.trTotal}: ${
          jots.length > 1 ? jots.join(" + ") + " = " : ""
        }${tr.total.toLocaleString(lang)}`}
      </pre>
    </div>
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
  const [mine, dispatch] = useReducer(mineReducer, { phase: "idle" });
  const [activeRule, setActiveRule] = useState<string | null>("doble");
  const [view, setView] = useState<RecipeView>("cases");
  const workerRef = useRef<Worker | null>(null);
  const startRef = useRef(0);

  const stopWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };
  useEffect(() => stopWorker, []);

  const isSifting = mine.phase === "sifting";
  useEffect(() => {
    if (!isSifting) return;
    // 800 ms: por debajo caben el arranque del worker y las cribas normales,
    // y un loader que aparece justo antes del resultado es solo un destello
    const id = setTimeout(() => dispatch({ type: "loader" }), 800);
    return () => clearTimeout(id);
  }, [isSifting]);

  // lo que se enseña: el resultado mostrado — o el previo, durante una criba
  // rápida (stale-while-sifting: cero flashes de layout)
  const outcome: SiftResult | { kind: "idle" } = mine.phase === "shown"
    ? mine.result
    : mine.phase === "sifting" && mine.prev
    ? mine.prev
    : { kind: "idle" };

  // cambiar los ejemplos invalida el resultado: nada rancio en pantalla
  // (y tejer lo tuyo despega la pestaña activa: la regla ya es tuya)
  const setPairs = (next: Pair[]) => {
    setPairsRaw(next);
    setActiveRule(null);
    stopWorker();
    dispatch({ type: "reset" });
  };

  const loadRule = (key: string, ps: [number, number][]) => {
    setPairsRaw(ps.map(([x, y]) => ({ id: nextId++, x, y })));
    setActiveRule(key);
    stopWorker();
    dispatch({ type: "reset" });
  };

  // la sección «De ejemplos a teoremas» carga aquí sus ejemplos por evento
  useEffect(() => {
    const onLoad = (e: Event) => {
      const exs = (e as CustomEvent<[number, number][]>).detail;
      if (!exs?.length) return;
      setPairsRaw(exs.map(([x, y]) => ({ id: nextId++, x, y })));
      setActiveRule(null);
      workerRef.current?.terminate();
      workerRef.current = null;
      dispatch({ type: "reset" });
      document.getElementById("miner")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    addEventListener("criba:cargar", onLoad);
    return () => removeEventListener("criba:cargar", onLoad);
  }, []);

  const busy = isSifting;

  const sift = () => {
    const examples = pairs.map((p) => [p.x, p.y] as [number, number]);
    if (!examples.length) return;
    stopWorker();
    dispatch({ type: "start" });
    startRef.current = performance.now();
    const w = new Worker("dist/miner-worker.js", { type: "module" });
    workerRef.current = w;
    w.onmessage = (e: MessageEvent) => {
      if (workerRef.current !== w) return; // mensaje de una criba muerta
      const msg = e.data as
        | { type: "progress"; steps: number }
        | { type: "done"; prog: Term | null; stats: EverettStats };
      if (msg.type === "progress") {
        dispatch({ type: "progress", steps: msg.steps });
        return;
      }
      const ms = performance.now() - startRef.current;
      workerRef.current = null;
      w.terminate();
      let result: SiftResult;
      if (!msg.prog) result = { kind: "notfound" };
      else {
        const prog = msg.prog;
        const maxX = Math.max(...examples.map(([x]) => x));
        result = {
          kind: "found",
          prog,
          proven: msg.stats.provenMinimal,
          steps: msg.stats.steps,
          ms,
          verify: [maxX + 1, maxX + 2, maxX + 3].map((x) => [x, run(prog, x, 100_000)]),
        };
      }
      dispatch({ type: "done", result, steps: msg.stats.steps });
    };
    w.postMessage({ examples, maxDepth: MINER_DEPTH, budget: MINER_BUDGET });
  };

  return (
    <section className="miner" id="miner">
      <div className="frame">
        <h2>{t.minerh2}</h2>
        <p className="intro">{t.minerIntro}</p>
        <p className="sub">{t.minersub}</p>
        <div className="rule-tabs" role="group" aria-label="Reglas ya tejidas">
          {PRESETS.map(([key, ps]) => (
            <button
              type="button"
              key={key}
              className="rule-tab"
              aria-pressed={activeRule === key}
              onClick={() => loadRule(key, ps)}
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
          <details className="text-editor" open>
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
          <button
            type="button"
            className={"run" + (busy ? " sifting" : "")}
            onClick={sift}
            disabled={busy}
          >
            {busy ? t.running : t.run}
          </button>
          <div className="out" aria-live="polite">
            {(() => {
              const loaderOnly = mine.phase === "sifting" && mine.loaderOn;
              const steps = mine.phase === "sifting" || mine.phase === "shown" ? mine.steps : 0;
              return (
                <>
                  {loaderOnly && (
                    <div className="loom-window">
                      <MiniLoom />
                      <p className="meta">
                        {steps.toLocaleString(lang)} {t.sharedSteps}…
                      </p>
                    </div>
                  )}
                  {!loaderOnly && outcome.kind === "idle" && <p className="meta">{t.outidle}</p>}
                  {!loaderOnly && outcome.kind === "notfound" && (
                    <p className="meta fail reveal">{t.notfound}</p>
                  )}
                  {!loaderOnly && outcome.kind === "found" && (
                    <div className="reveal" key={show(outcome.prog)}>
                      <div className="found-bar">
                        <p className="found-head">{t.foundHead}</p>
                        <ToggleGroup
                          className="view-toggle"
                          value={[view]}
                          onValueChange={(v: unknown[]) => {
                            const next = (v as RecipeView[])[0];
                            if (next) {
                              setView(next);
                            }
                          }}
                        >
                          <Toggle value="loop" className="view-tab">{t.viewLoop}</Toggle>
                          <Toggle value="trace" className="view-tab">{t.viewTrace}</Toggle>
                          <Toggle value="cases" className="view-tab">{t.viewCases}</Toggle>
                          <Toggle value="patterns" className="view-tab">{t.viewPatterns}</Toggle>
                        </ToggleGroup>
                      </div>
                      {view === "loop" && (
                        <pre className="recipe">{explainLoop(outcome.prog, lang)}</pre>
                      )}
                      {view === "trace" && (
                        <TraceView
                          prog={outcome.prog}
                          examples={pairs.map((p) => [p.x, p.y] as [number, number])}
                        />
                      )}
                      {view === "cases" && (
                        <pre className="recipe">{explain(outcome.prog, lang)}</pre>
                      )}
                      {view === "patterns" && (
                        <>
                          <pre className="recipe">{explainPatterns(outcome.prog, lang)}</pre>
                          <p className="meta">{t.patternsNote}</p>
                        </>
                      )}
                      <p className="meta">
                        {size(outcome.prog)} {t.pieces} ·{" "}
                        {outcome.proven ? t.foundProven : t.foundBest} · {t.foundIn}{" "}
                        {outcome.ms.toFixed(0)} ms · {outcome.steps.toLocaleString(lang)}{" "}
                        {t.sharedSteps}
                      </p>
                      <p className="verify">
                        {outcome.verify.some(([, y]) => y === null) ? t.verifyPartial : t.verify}{" "}
                        {outcome.verify.map(([x, y], i) => (
                          <span key={x}>
                            {i > 0 && " · "}f({x}) = <b>{y ?? t.diverges}</b>
                          </span>
                        ))}
                      </p>
                      <p className="raw">
                        {t.rawIntro} <code>{show(outcome.prog)}</code>
                        <span className="raw-legend">{t.rawLegend}</span>
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
