// La carrera real (Telar vs clásico).
//
// El estado es una unión discriminada donde cada resultado LLEVA DENTRO el N
// con el que se corrió: una etiqueta calculada con un N distinto del resultado
// es irrepresentable por construcción (lección del bug de estado rancio).
// El método clásico corre en un Web Worker y reporta sus β-pasos reales en
// vivo: la asimetría de tiempos se ve, no se cuenta.
import { useEffect, useRef, useState } from "react";
import { Slider } from "@base-ui/react/slider";
import { fusionDemo, naiveCost, naiveOversize } from "../../src/telar.ts";
import { useT } from "./i18n.tsx";

type NaiveOutcome =
  | { kind: "ok"; betas: number; ms: number }
  | { kind: "dnf"; betasTried: number; ms: number }
  | { kind: "oversize" };

type RaceState =
  | { status: "idle" }
  | { status: "running"; n: number; ic: number; icMs: number; naiveBetas: number }
  | { status: "done"; n: number; ic: number; icMs: number; naive: NaiveOutcome };

// Presupuesto de paciencia: ~2 s de molienda real en el worker. Elegido
// lejos de los costes 3·2^N (6,29M / 12,58M) para no rendirse al 97% del
// trabajo, que parecía absurdo: N=21 ahora completa; N=22 se rinde a los
// 10M faltándole aún 2,6M.
const NAIVE_BUDGET = 10_000_000;

export function Race() {
  const { lang, t } = useT();
  const [n, setN] = useState(21);
  const [race, setRace] = useState<RaceState>({ status: "idle" });
  const workerRef = useRef<Worker | null>(null);
  const startRef = useRef(0);

  const stopWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };
  useEffect(() => stopWorker, []);

  const weave = () => {
    stopWorker();
    const t0 = performance.now();
    const ic = fusionDemo(n);
    const icMs = performance.now() - t0;
    if (naiveOversize(n, NAIVE_BUDGET)) {
      // veredicto puro e instantáneo: directo al mensaje, sin pasar por
      // «corriendo» (evita el flash del 0 mientras arrancaba el worker)
      setRace({ status: "done", n, ic: ic.interactions, icMs, naive: { kind: "oversize" } });
      return;
    }
    // el telar ya ha terminado; el clásico empieza ahora, en su propio hilo
    setRace({ status: "running", n, ic: ic.interactions, icMs, naiveBetas: 0 });
    startRef.current = performance.now();
    const w = new Worker("dist/worker.js", { type: "module" });
    workerRef.current = w;
    w.onmessage = (e: MessageEvent) => {
      // guardia de identidad: un mensaje tardío de una carrera muerta no toca
      // ni el estado ni el worker vivo
      if (workerRef.current !== w) return;
      const msg = e.data as { type: "progress" | "done" | "dnf" | "oversize"; betas?: number };
      if (msg.type === "progress") {
        setRace((r) => r.status === "running" ? { ...r, naiveBetas: msg.betas ?? 0 } : r);
        return;
      }
      const ms = performance.now() - startRef.current;
      workerRef.current = null;
      w.terminate();
      setRace((r) => {
        if (r.status !== "running") return r;
        const naive: NaiveOutcome = msg.type === "done"
          ? { kind: "ok", betas: msg.betas ?? 0, ms }
          : msg.type === "oversize"
          ? { kind: "oversize" }
          : { kind: "dnf", betasTried: msg.betas ?? NAIVE_BUDGET, ms };
        return { status: "done", n: r.n, ic: r.ic, icMs: r.icMs, naive };
      });
    };
    w.postMessage({ n, budget: NAIVE_BUDGET });
  };

  const changeN = (v: number | readonly number[]) => {
    setN(Array.isArray(v) ? v[0]! : v as number);
    stopWorker();
    setRace({ status: "idle" }); // un resultado de otro N no se enseña jamás
  };

  const fmt = (x: number) => x.toLocaleString(lang);
  const running = race.status === "running";

  return (
    <section className="race" id="race">
      <div className="frame">
        <h2>{t.raceh2}</h2>
        <p className="lead">{t.racelead}</p>
        <p className="race-note">{t.raceNote}</p>
        <div className="controls">
          <span className="nval">
            N = <b>{n}</b>
          </span>
          <Slider.Root value={n} min={4} max={30} onValueChange={changeN} className="slider">
            <Slider.Control className="slider-control">
              <Slider.Track className="slider-track">
                <Slider.Indicator className="slider-indicator" />
                <Slider.Thumb className="slider-thumb" aria-label="N" />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
          <button type="button" className="gobtn" onClick={weave} disabled={running}>
            {running ? t.goraceRunning : t.gorace}
          </button>
          <span className="npasses">2^{n} = {fmt(2 ** n)} {t.passes}</span>
        </div>
        <div className="cloths" aria-live="polite">
          <div className="cloth naive">
            <span className="n">
              {race.status === "idle" && "—"}
              {race.status === "running" && fmt(race.naiveBetas)}
              {race.status === "done" && race.naive.kind === "ok" && (
                <>
                  {fmt(race.naive.betas)} <small>· {race.naive.ms.toFixed(0)} ms</small>
                </>
              )}
              {race.status === "done" && race.naive.kind === "dnf" &&
                `${fmt(race.naive.betasTried)}+`}
              {race.status === "done" && race.naive.kind === "oversize" && "—"}
            </span>
            <div className="slot">
              {race.status === "running" && <div className="weaving" aria-hidden="true" />}
              {race.status === "done" && race.naive.kind === "dnf" && (
                <p className="note">
                  {t.dnfNoteA} {fmt(naiveCost(race.n))} {t.dnfNoteB}
                </p>
              )}
              {race.status === "done" && race.naive.kind === "oversize" && (
                <p className="note">
                  {t.overA} {fmt(2 ** race.n)} {t.overB} {race.n} {t.overC}
                </p>
              )}
            </div>
            <span className="lbl">{t.naivelbl}</span>
          </div>
          <div className="cloth ic">
            <span className="n">
              {race.status === "idle" ? "—" : (
                <>
                  {fmt(race.ic)} <small>· {race.icMs.toFixed(1)} ms</small>
                </>
              )}
            </span>
            <div className="slot" />
            <span className="lbl">{t.iclbl}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
