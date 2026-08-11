// Sección «De ejemplos a teoremas» (wayfinder en web/design/): la grieta de
// los ejemplos, la escalera de garantías y el cribador de pruebas (SupGen).
// Expositiva salvo el reto, que carga ejemplos reales en el minador de arriba.
import { useT } from "./i18n.tsx";

export function Theorems() {
  const { t } = useT();
  const loadExample = () => {
    dispatchEvent(new CustomEvent("criba:cargar", { detail: [[1, 2], [5, 8]] }));
  };
  return (
    <section className="teo" id="teoremas">
      <div className="frame">
        <h2>{t.teoh2}</h2>
        <p className="intro">{t.teoIntro}</p>
        <p className="teo-try">
          <button type="button" className="teo-load" onClick={loadExample}>
            {t.teoTryBtn}
          </button>
        </p>
        <p>{t.teoHow}</p>
        <p>{t.teoLadderIntro}</p>
        <ol className="teo-ladder">
          <li>
            <b>{t.teoL1h}</b> {t.teoL1}
          </li>
          <li>
            <b>{t.teoL2h}</b> {t.teoL2}
          </li>
          <li>
            <b>{t.teoL3h}</b> {t.teoL3}
          </li>
        </ol>
        <p>{t.teoRoom}</p>
        <p className="teo-decl">{t.teoDecl}</p>
        <p>{t.teoSupgen}</p>
        <div className="teo-duel">
          <div className="llm">
            <h3>{t.teoDuelLlmH}</h3>
            <p>{t.teoDuelLlm}</p>
          </div>
          <div className="spec">
            <h3>{t.teoDuelSpecH}</h3>
            <p>{t.teoDuelSpec}</p>
          </div>
        </div>
        <p className="teo-perfect">{t.teoPerfect}</p>
      </div>
    </section>
  );
}
