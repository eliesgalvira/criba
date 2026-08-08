import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { type Lang, LangContext, stringsFor, useT } from "./i18n.tsx";
import { mountLoom } from "./loom.ts";
import { Miner } from "./Miner.tsx";
import { Race } from "./Race.tsx";

/** Cambio de estado con View Transition, con clase de tipo en <html> para
 * que el CSS distinga viajes (morph + portal) de cambios de idioma (fade).
 *
 * CRÍTICO: la mutación va envuelta en flushSync. startViewTransition captura
 * la instantánea «nueva» al resolver el callback, y los setState de React son
 * asíncronos — sin flushSync el navegador fotografiaba el DOM ANTES del
 * commit (nombres de transición aún sin mover: morphs rotos, elementos que
 * desaparecen). Progresivo: sin soporte o con reduced-motion, muta y punto. */
function withViewTransition(kind: "travel" | "lang", mutate: () => void): Promise<void> {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };
  if (reduced || !doc.startViewTransition) {
    mutate();
    return Promise.resolve();
  }
  document.documentElement.classList.add(`vt-${kind}`);
  const vt = doc.startViewTransition(() => flushSync(mutate));
  return vt.finished.finally(() => {
    document.documentElement.classList.remove(`vt-${kind}`);
  });
}

function Hero(props: { travelling: boolean; onTravel: () => void }) {
  const { t } = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hintGone, setHintGone] = useState(false);

  useEffect(() => mountLoom(canvasRef.current!), []);
  useEffect(() => {
    const onScroll = () => {
      if (scrollY > 40) setHintGone(true);
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const goMiner = (e: React.MouseEvent) => {
    e.preventDefault();
    props.onTravel();
  };

  return (
    <header>
      <div className="selvage" aria-hidden="true" />
      <div className="loom">
        <canvas ref={canvasRef} aria-label={t.h1a + t.h1hilo + t.h1b} />
        <div className="headline frame">
          <h1>
            {t.h1a}
            <span className="hilo">{t.h1hilo}</span>
            {t.h1b}
          </h1>
          <p className="hero-explain">{t.heroExplain}</p>
          <p className="hero-sub">{t.h1sub}</p>
          <a
            className={"go" + (props.travelling ? "" : " vt-hilo")}
            href="#miner"
            onClick={goMiner}
          >
            {t.cta}
          </a>
        </div>
      </div>
      <div className="selvage" aria-hidden="true" />
      <div className={"hint" + (hintGone ? " gone" : "")} aria-hidden="true">
        <svg width="18" height="44" viewBox="0 0 18 44" fill="none">
          <line x1="9" y1="0" x2="9" y2="44" stroke="oklch(0.68 0.03 85)" strokeWidth="1" />
          <g className="shuttle">
            <path d="M9 6 L14 13 L9 20 L4 13 Z" fill="oklch(0.78 0.12 85)" />
          </g>
        </svg>
        <span>{t.hint}</span>
      </div>
    </header>
  );
}

function Honesty() {
  const { t } = useT();
  return (
    <section className="honesty">
      <div className="frame">
        <div className="tag">
          <h2>{t.honh2}</h2>
          <ul>
            {t.hon.map(([head, rest]) => (
              <li key={head}>
                <b>{head}</b>
                {rest}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useT();
  return (
    <footer>
      <div className="frame">
        <span>{t.foot1}</span>
        <span>{t.foot2}</span>
      </div>
    </footer>
  );
}

export function App() {
  const [lang, setLang] = useState<Lang>("es");
  const [travelling, setTravelling] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const travel = () => {
    withViewTransition("travel", () => {
      setTravelling(true);
      document.getElementById("miner")?.scrollIntoView({ behavior: "instant", block: "start" });
    }).then(() => setTravelling(false));
  };

  return (
    <LangContext.Provider value={{ lang, t: stringsFor(lang) }}>
      <nav className="lang" aria-label="Idioma / Language">
        <ToggleGroup
          value={[lang]}
          onValueChange={(v: unknown[]) => {
            const next = (v as Lang[])[0];
            if (next) withViewTransition("lang", () => setLang(next));
          }}
        >
          <Toggle value="es" className="lang-toggle" aria-label="Español">ES</Toggle>
          <Toggle value="en" className="lang-toggle" aria-label="English">EN</Toggle>
        </ToggleGroup>
      </nav>
      <Hero travelling={travelling} onTravel={travel} />
      <Miner morphTarget={travelling} />
      <Race />
      <Honesty />
      <Footer />
    </LangContext.Provider>
  );
}
