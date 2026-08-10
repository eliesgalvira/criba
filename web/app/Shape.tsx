// Sección «regular e irregular»: un stepper de tres estampas sobre un lienzo
// (shape.ts). La maqueta es honesta y así lo dice el copy: enseña la FORMA
// del trabajo, no ejecuta cómputo real como el minador o la carrera.
import { useEffect, useRef, useState } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { useT } from "./i18n.tsx";
import { mountShape, type ShapeMode } from "./shape.ts";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ShapeOfWork() {
  const { t } = useT();
  const [mode, setMode] = useState<ShapeMode>("grid");
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<ShapeMode>(mode);
  modeRef.current = mode;

  // las estampas no arrancan hasta que la sección entra en pantalla
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setStarted(true);
      },
      { threshold: 0.25 },
    );
    obs.observe(sectionRef.current!);
    return () => obs.disconnect();
  }, []);

  // sin reduced-motion, el lienzo se monta UNA vez y lee el modo por fotograma
  // (cambiar de paso no reinicia el árbol). Con reduced-motion no hay bucle, así
  // que remontamos por paso para repintar el fotograma estático correcto.
  useEffect(() => {
    if (!started) return;
    return mountShape(canvasRef.current!, () => modeRef.current);
  }, [started, REDUCED ? mode : 0]);

  const cap: Record<ShapeMode, [string, string]> = {
    grid: [t.shapeCap1head, t.shapeCap1],
    split: [t.shapeCap2head, t.shapeCap2],
    tree: [t.shapeCap3head, t.shapeCap3],
  };
  const [caphead, capbody] = cap[mode];
  // cada paso enseña símbolos distintos: la leyenda acompaña al paso
  const legend: Record<ShapeMode, typeof t.shapeLegendGrid> = {
    grid: t.shapeLegendGrid,
    split: t.shapeLegendSplit,
    tree: t.shapeLegendTree,
  };

  return (
    <section className="par" id="paralelismo" ref={sectionRef}>
      <div className="frame">
        <h2>{t.shapeh2}</h2>
        <p className="intro">{t.shapeIntro}</p>
        <ToggleGroup
          className="par-steps"
          value={[mode]}
          onValueChange={(v: unknown[]) => {
            const next = (v as ShapeMode[])[0];
            if (next) setMode(next);
          }}
        >
          <Toggle value="grid" className="par-step">{t.shapeStep1}</Toggle>
          <Toggle value="split" className="par-step">{t.shapeStep2}</Toggle>
          <Toggle value="tree" className="par-step">{t.shapeStep3}</Toggle>
        </ToggleGroup>
        <div className="par-stage">
          <canvas ref={canvasRef} className="par-canvas" aria-label={t.shapeh2} />
        </div>
        <ul className="par-legend">
          {legend[mode].map(([cls, term, desc]) => (
            <li key={term}>
              <span className={"leg-swatch leg-" + cls} aria-hidden="true" />
              <b>{term}</b>, {desc}
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
