// Sección «una CPU por dentro» (cpu.ts): la máquina de la cadena, su peaje
// de memoria y la caza de punteros. Mismo contrato que la sección de la GPU:
// porcentaje medido de verdad, carga simulada (lo aclara la honestidad).
import { useEffect, useRef, useState } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { type CpuMode, mountCpu } from "./cpu.ts";
import { useT } from "./i18n.tsx";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Cpu() {
  const { t } = useT();
  const [mode, setMode] = useState<CpuMode>("chain");
  const [pct, setPct] = useState(100);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<CpuMode>(mode);
  modeRef.current = mode;
  const visibleRef = useRef(false);

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

  useEffect(() => {
    if (!started) return;
    return mountCpu(
      canvasRef.current!,
      () => modeRef.current,
      setPct,
      () => visibleRef.current,
    );
  }, [started, REDUCED ? mode : 0]);

  const cap: Record<CpuMode, [string, string]> = {
    chain: [t.cpuCap1head, t.cpuCap1],
    array: [t.cpuCap2head, t.cpuCap2],
    chase: [t.cpuCap3head, t.cpuCap3],
  };
  const [caphead, capbody] = cap[mode];

  return (
    <section className="par" id="cpu" ref={sectionRef}>
      <div className="frame">
        <h2>{t.cpuh2}</h2>
        <p className="intro">{t.cpuIntro}</p>
        <ToggleGroup
          className="par-steps"
          value={[mode]}
          onValueChange={(v: unknown[]) => {
            const next = (v as CpuMode[])[0];
            if (next) setMode(next);
          }}
        >
          <Toggle value="chain" className="par-step">{t.cpuStep1}</Toggle>
          <Toggle value="array" className="par-step">{t.cpuStep2}</Toggle>
          <Toggle value="chase" className="par-step">{t.cpuStep3}</Toggle>
        </ToggleGroup>
        <div className="par-stage">
          <canvas ref={canvasRef} className="par-canvas" aria-label={t.cpuh2} />
        </div>
        <div className="par-meta">
          <span className={"par-pct" + (pct < 70 ? " low" : "")}>{pct}%</span>
          <span className="par-pct-label">{t.cpuPctLabel}</span>
        </div>
        <p className="par-cap">
          <b>{caphead}</b> {capbody}
        </p>
      </div>
    </section>
  );
}
