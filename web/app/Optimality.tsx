// Sección «El truco tiene teorema»: la carrera enseña el fenómeno y esta
// sección le pone los apellidos, Lamping 1990 y Lafont 1997. La asimetría de
// las traducciones es la definición honesta de «teóricamente óptimo».
import { useT } from "./i18n.tsx";

export function Optimality() {
  const { t } = useT();
  return (
    <section className="teo" id="teorema">
      <div className="frame">
        <h2>{t.opth2}</h2>
        <p className="intro">{t.optIntro}</p>
        <ol className="teo-ladder">
          <li>
            <b>{t.optInH}</b> {t.optIn}
          </li>
          <li>
            <b>{t.optOutH}</b> {t.optOut}
          </li>
        </ol>
        <p>{t.optClose}</p>
      </div>
    </section>
  );
}
