// Sección «regular e irregular»: la ocupación de una GPU (irregular.ts) con
// tres cargas de trabajo. El porcentaje es medición real sobre las columnas
// dibujadas; la carga es un simulador, y el copy no afirma otra cosa.
import { useEffect, useRef, useState } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { useT } from "./i18n.tsx";
import { mountIrregular, type ParMode } from "./irregular.ts";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Parallelism() {
  const { t } = useT();
  const [mode, setMode] = useState<ParMode>("grid");
  const [pct, setPct] = useState(100);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<ParMode>(mode);
  modeRef.current = mode;
  const visibleRef = useRef(false);

  // la tela no arranca hasta que la sección entra en pantalla (que el lector
  // vea la primera columna salir), y se pausa cuando sale de vista
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const on = entries.some((e) => e.isIntersecting);
        visibleRef.current = on;
        if (on) setStarted(true);
      },
      { threshold: 0.25 },
    );
    obs.observe(sectionRef.current!);
    return () => obs.disconnect();
  }, []);

  // sin reduced-motion el lienzo se monta UNA vez y lee el modo por fotograma;
  // con reduced-motion no hay bucle, así que remonta por paso para repintar
  // el fotograma estático correcto
  useEffect(() => {
    if (!started) return;
    return mountIrregular(
      canvasRef.current!,
      () => modeRef.current,
      setPct,
      () => visibleRef.current,
    );
  }, [started, REDUCED ? mode : 0]);

  const cap: Record<ParMode, [string, string]> = {
    grid: [t.parCap1head, t.parCap1],
    split: [t.parCap2head, t.parCap2],
    tree: [t.parCap3head, t.parCap3],
    loom: [t.parCap4head, t.parCap4],
  };
  const [caphead, capbody] = cap[mode];

  return (
    <section className="par" id="paralelismo" ref={sectionRef}>
      <div className="frame">
        <h2>{t.parh2}</h2>
        <p className="intro">{t.parIntro}</p>
        <ToggleGroup
          className="par-steps"
          value={[mode]}
          onValueChange={(v: unknown[]) => {
            const next = (v as ParMode[])[0];
            if (next) setMode(next);
          }}
        >
          <Toggle value="grid" className="par-step">{t.parStep1}</Toggle>
          <Toggle value="split" className="par-step">{t.parStep2}</Toggle>
          <Toggle value="tree" className="par-step">{t.parStep3}</Toggle>
          <Toggle value="loom" className="par-step">{t.parStep4}</Toggle>
        </ToggleGroup>
        <div className="par-stage">
          <canvas ref={canvasRef} className="par-canvas" aria-label={t.parh2} />
        </div>
        <div className="par-meta">
          <span className={"par-pct" + (pct < 70 ? " low" : "")}>{pct}%</span>
          <span className="par-pct-label">{t.parPctLabel}</span>
        </div>
        <p className="par-cap">
          <b>{caphead}</b> {capbody}
        </p>
      </div>
    </section>
  );
}
