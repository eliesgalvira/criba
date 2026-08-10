// Sección «regular e irregular»: un stepper de tres estampas sobre un lienzo
// (irregular.ts). La maqueta es honesta y así lo dice el copy: enseña la FORMA
// del trabajo, no ejecuta cómputo real como el minador o la carrera.
import { useEffect, useRef, useState } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { useT } from "./i18n.tsx";
import { mountIrregular, type ParMode } from "./irregular.ts";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Parallelism() {
  const { t } = useT();
  const [mode, setMode] = useState<ParMode>("grid");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<ParMode>(mode);
  modeRef.current = mode;

  // sin reduced-motion, el lienzo se monta UNA vez y lee el modo por fotograma
  // (cambiar de paso no reinicia el árbol). Con reduced-motion no hay bucle, así
  // que remontamos por paso para repintar el fotograma estático correcto.
  useEffect(() => mountIrregular(canvasRef.current!, () => modeRef.current), [
    REDUCED ? mode : 0,
  ]);

  const cap: Record<ParMode, [string, string]> = {
    grid: [t.parCap1head, t.parCap1],
    split: [t.parCap2head, t.parCap2],
    tree: [t.parCap3head, t.parCap3],
  };
  const [caphead, capbody] = cap[mode];

  return (
    <section className="par" id="paralelismo">
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
        </ToggleGroup>
        <div className="par-stage">
          <canvas ref={canvasRef} className="par-canvas" aria-label={t.parh2} />
        </div>
        <ul className="par-legend">
          {t.parLegend.map(([k, v], i) => (
            <li key={k}>
              <span className={"leg-swatch leg-" + i} aria-hidden="true" />
              <b>{k}</b>, {v}
            </li>
          ))}
        </ul>
        <p className="par-cap">
          <b>{caphead}</b> {capbody}
        </p>
      </div>
    </section>
  );
}
