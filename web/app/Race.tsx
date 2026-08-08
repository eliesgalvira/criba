// La carrera real (Telar vs naive) — slider de Base UI con la piel del Telar.
import { useState } from "react";
import { Slider } from "@base-ui/react/slider";
import { fusionDemo, naiveDemo } from "../../src/telar.ts";
import { useT } from "./i18n.tsx";

export function Race() {
  const { lang, t } = useT();
  const [n, setN] = useState(16);
  const [busy, setBusy] = useState(false);
  const [ic, setIc] = useState<number | null>(null);
  const [naive, setNaive] = useState<number | "dnf" | null>(null);

  const weave = () => {
    setBusy(true);
    setTimeout(() => {
      setIc(fusionDemo(n).interactions);
      if (n <= 13) {
        let r: { betas: number } | null = null;
        try {
          r = naiveDemo(n, 3_000_000);
        } catch {
          r = null;
        }
        setNaive(r ? r.betas : "dnf");
      } else {
        setNaive("dnf");
      }
      setBusy(false);
    }, 30);
  };

  return (
    <section className="race" id="race">
      <div className="frame">
        <h2>{t.raceh2}</h2>
        <p className="lead">{t.racelead}</p>
        <p className="race-note">{t.raceNote}</p>
        <div className="controls">
          <span className="nval">
            N = <b>{n}</b>
            <span className="npasses">2^{n} = {(2 ** n).toLocaleString(lang)} {t.passes}</span>
          </span>
          <Slider.Root
            value={n}
            min={4}
            max={30}
            onValueChange={(v) => setN(Array.isArray(v) ? v[0]! : v)}
            className="slider"
          >
            <Slider.Control className="slider-control">
              <Slider.Track className="slider-track">
                <Slider.Indicator className="slider-indicator" />
                <Slider.Thumb className="slider-thumb" aria-label="N" />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
          <button type="button" className="gobtn" onClick={weave} disabled={busy}>
            {t.gorace}
          </button>
        </div>
        <div className="cloths">
          <div className="cloth naive">
            <span className="n">
              {naive === null
                ? "—"
                : naive === "dnf"
                ? `${t.dnfA} ${(2 ** n).toLocaleString(lang)}+ ${t.dnfB}`
                : naive.toLocaleString(lang)}
            </span>
            <span className="lbl">{t.naivelbl}</span>
          </div>
          <div className="cloth ic">
            <span className="n">{ic === null ? "—" : ic.toLocaleString(lang)}</span>
            <span className="lbl">{t.iclbl}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
