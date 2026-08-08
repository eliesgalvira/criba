// El minador (Everett) — todos los controles son primitivas de Base UI;
// la piel viene de los tokens del Telar en styles.css.
import { useState } from "react";
import { NumberField } from "@base-ui/react/number-field";
import { everett } from "../../src/criba.ts";
import { explain } from "../../src/explain.ts";
import { run, show, size, type Term } from "../../src/peanito.ts";
import { useT } from "./i18n.tsx";

type Pair = { id: number; x: number | null; y: number | null };

type Outcome =
  | { kind: "idle" }
  | { kind: "notfound" }
  | {
    kind: "found";
    prog: Term;
    proven: boolean;
    steps: number;
    ms: number;
    verify: [number, number | null][];
  };

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
        onValueChange={(x) => onChange({ ...pair, x })}
        min={0}
        max={30}
        className="nf"
      >
        <NumberField.Input className="nf-input" aria-label="x" />
      </NumberField.Root>
      <span aria-hidden="true">)&nbsp;=</span>
      <NumberField.Root
        value={pair.y}
        onValueChange={(y) => onChange({ ...pair, y })}
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
  const [pairs, setPairs] = useState<Pair[]>([
    { id: 0, x: 0, y: 0 },
    { id: 1, x: 1, y: 2 },
    { id: 2, x: 2, y: 4 },
    { id: 3, x: 3, y: 6 },
  ]);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

  const sift = () => {
    const examples = pairs
      .filter((p): p is Pair & { x: number; y: number } => p.x !== null && p.y !== null)
      .map((p) => [p.x, p.y] as [number, number]);
    if (!examples.length) return;
    setBusy(true);
    setTimeout(() => {
      const t0 = performance.now();
      const { prog, stats } = everett(examples, 5, 8_000_000);
      const ms = performance.now() - t0;
      if (!prog) setOutcome({ kind: "notfound" });
      else {
        const maxX = Math.max(...examples.map(([x]) => x));
        setOutcome({
          kind: "found",
          prog,
          proven: stats.provenMinimal,
          steps: stats.steps,
          ms,
          verify: [maxX + 1, maxX + 2, maxX + 3].map((x) => [x, run(prog, x, 100_000)]),
        });
      }
      setBusy(false);
    }, 30);
  };

  return (
    <section className="miner" id="miner">
      <div className="frame">
        <h2>{t.minerh2}</h2>
        <p className="intro">{t.minerIntro}</p>
        <p className="sub">{t.minersub}</p>
        <div className="bench">
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
              onClick={() => setPairs([...pairs, { id: nextId++, x: null, y: null }])}
            >
              + {t.addPair}
            </button>
          </div>
          <button type="button" className="run" onClick={sift} disabled={busy}>
            {busy ? t.running : t.run}
          </button>
          <div className="out" aria-live="polite">
            {outcome.kind === "idle" && <p className="meta">{t.outidle}</p>}
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
