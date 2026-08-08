// Dos orillas: la función como correspondencia, los ejemplos como hilos.
//
// Gestos (sin una sola palabra escrita — la dirección la cuenta el tejido):
//   · clic en una entrada y luego en una salida → el hilo se teje
//   · arrastrar desde una entrada hasta una salida → lo mismo, de un gesto
//   · agarrar la lanzadera (rombo) de un hilo → recolocarlo en otro hueco
//   · soltarlo lejos de la orilla derecha → el hilo se arranca (borrar)
//   · una entrada solo admite UN hilo: una función da una salida por entrada
//     (agarrar desde una entrada ocupada mueve su hilo existente)
//
// Tras cribar, los hilos fantasma (discontinuos) muestran lo que el programa
// tejería en las entradas donde no diste ejemplo: la generalización, visible.
import { useEffect, useRef, useState } from "react";

export interface ShorePair {
  id: number;
  x: number;
  y: number;
}

interface Props {
  pairs: ShorePair[];
  onChange: (pairs: ShorePair[]) => void;
  /** salida del programa minado para cada entrada, o null (sin programa) */
  ghost: ((x: number) => number | null) | null;
}

const SLOT = 42;
const TOP = 26;
const LX = 88; // orilla izquierda (línea)
const RX = 552; // orilla derecha
const W = 640;

const slotY = (i: number) => TOP + i * SLOT;

function threadPath(x1: number, y1: number, x2: number, y2: number): string {
  const sag = Math.min(18, Math.abs(y2 - y1) * 0.12 + 6);
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1 + sag}, ${mx} ${y2 + sag}, ${x2} ${y2}`;
}

let nextId = 1000;

export function Shores({ pairs, onChange, ghost }: Props) {
  // rangos DERIVADOS en render (receta canónica de la regla
  // no-adjust-state-on-prop-change): el estado guarda solo lo que el usuario
  // extendió a mano; los pares presentes imponen su suelo sin efectos.
  const [extraL, setExtraL] = useState(0);
  const [extraR, setExtraR] = useState(0);
  const leftMax = Math.max(7 + extraL, ...pairs.map((p) => p.x));
  const rightMax = Math.max(14 + extraR, ...pairs.map((p) => p.y));
  const svgRef = useRef<SVGSVGElement>(null);
  // hilo en mano: o uno nuevo desde x, o uno existente re-anclándose
  const [hand, setHand] = useState<
    | { kind: "new"; x: number; px: number; py: number; dragged: boolean }
    | { kind: "move"; id: number; px: number; py: number }
    | null
  >(null);

  const H = TOP + Math.max(leftMax, rightMax) * SLOT + 40;

  const toSvg = (e: { clientX: number; clientY: number }) => {
    const el = svgRef.current!;
    const r = el.getBoundingClientRect();
    return { px: ((e.clientX - r.left) / r.width) * W, py: ((e.clientY - r.top) / r.height) * H };
  };

  const nearestRightSlot = (py: number): number | null => {
    const i = Math.round((py - TOP) / SLOT);
    if (i < 0 || i > rightMax) return null;
    if (Math.abs(py - slotY(i)) > SLOT * 0.6) return null;
    return i;
  };

  const startFromInput = (x: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    const existing = pairs.find((p) => p.x === x);
    const { px, py } = toSvg(e);
    if (existing) setHand({ kind: "move", id: existing.id, px, py });
    else setHand({ kind: "new", x, px, py, dragged: false });
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const grabThread = (id: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { px, py } = toSvg(e);
    setHand({ kind: "move", id, px, py });
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!hand) return;
    const { px, py } = toSvg(e);
    setHand(
      hand.kind === "new"
        ? { ...hand, px, py, dragged: hand.dragged || Math.abs(px - LX) > 40 }
        : { ...hand, px, py },
    );
  };

  const dropOnOutput = (y: number) => {
    if (!hand) return;
    if (hand.kind === "new") {
      onChange([...pairs, { id: nextId++, x: hand.x, y }]);
    } else {
      onChange(pairs.map((p) => p.id === hand.id ? { ...p, y } : p));
    }
    setHand(null);
  };

  const onUp = (e: React.PointerEvent) => {
    if (!hand) return;
    const { px, py } = toSvg(e);
    const slot = px > RX - 90 ? nearestRightSlot(py) : null;
    if (slot !== null) {
      dropOnOutput(slot);
      return;
    }
    if (hand.kind === "move") {
      // arrancado y soltado en el vacío: el hilo se quita
      onChange(pairs.filter((p) => p.id !== hand.id));
      setHand(null);
    } else if (hand.dragged) {
      setHand(null); // arrastre cancelado
    } else {
      // fue un clic: queda armado siguiendo al cursor (modo clic-clic)
      setHand({ ...hand, dragged: false });
    }
  };

  useEffect(() => {
    if (!hand) return;
    const cancel = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHand(null);
    };
    addEventListener("keydown", cancel);
    return () => removeEventListener("keydown", cancel);
  }, [hand]);

  const usedInputs = new Set(pairs.map((p) => p.x));
  const movingPair = hand?.kind === "move" ? pairs.find((p) => p.id === hand.id) : undefined;

  const ghosts: [number, number][] = [];
  if (ghost) {
    for (let x = 0; x <= leftMax; x++) {
      if (usedInputs.has(x)) continue;
      const y = ghost(x);
      if (y !== null && y <= rightMax) ghosts.push([x, y]);
    }
  }

  return (
    <svg
      ref={svgRef}
      className={"shores" + (hand ? " holding" : "")}
      viewBox={`0 0 ${W} ${H}`}
      onPointerMove={onMove}
      onPointerUp={onUp}
      aria-label="Telar de ejemplos: une cada entrada con su salida"
      role="application"
    >
      <defs>
        {/* fibra: leve desplazamiento turbulento para que el trazo sea hilo */}
        <filter id="fiber" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.11 0.9" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
        </filter>
      </defs>
      {/* orillas */}
      <rect x={LX - 4} y={TOP - 14} width="5" height={slotY(leftMax) - TOP + 28} className="rail" />
      <rect
        x={RX - 1}
        y={TOP - 14}
        width="5"
        height={slotY(rightMax) - TOP + 28}
        className="rail"
      />

      {
        /* hilos fantasma: la generalización del programa minado, tejiéndose
          de izquierda a derecha al llegar el resultado */
      }
      {ghosts.map(([x, y], i) => (
        <g
          key={`g${x}`}
          className="ghost-reveal"
          style={{ animationDelay: `${i * 110}ms` }}
        >
          <path className="thread ghost" d={threadPath(LX + 4, slotY(x), RX - 4, slotY(y))} />
        </g>
      ))}

      {/* hilos de ejemplo */}
      {pairs.map((p) => {
        const held = movingPair?.id === p.id;
        const x2 = held ? hand!.px : RX - 4;
        const y2 = held ? hand!.py : slotY(p.y);
        const d = threadPath(LX + 4, slotY(p.x), x2, y2);
        return (
          <g key={p.id} className={"woven" + (held ? " held" : "")}>
            <g filter="url(#fiber)">
              <path className="thread" d={d} />
              {/* torzal: las vueltas del hilado */}
              <path className="twist" d={d} style={{ strokeDashoffset: (p.id * 3) % 8 }} />
            </g>
            {/* zona de agarre generosa sobre todo el hilo */}
            <path className="grab" d={d} onPointerDown={grabThread(p.id)} />
            {/* la lanzadera: extremo móvil y asa del hilo */}
            <path
              className="shuttle"
              d={`M ${x2} ${y2 - 8} L ${x2 + 8} ${y2} L ${x2} ${y2 + 8} L ${x2 - 8} ${y2} Z`}
              onPointerDown={grabThread(p.id)}
            />
          </g>
        );
      })}

      {/* hilo en mano (nuevo) */}
      {hand?.kind === "new" && (
        <g filter="url(#fiber)">
          <path
            className="thread loose"
            d={threadPath(LX + 4, slotY(hand.x), hand.px, hand.py)}
          />
        </g>
      )}

      {/* entradas */}
      {Array.from({ length: leftMax + 1 }, (_, x) => (
        <g
          key={x}
          className={"slot in" +
            (usedInputs.has(x) ? " used" : "") +
            (hand?.kind === "new" && hand.x === x ? " armed" : "")}
          onPointerDown={startFromInput(x)}
        >
          <circle cx={LX - 26} cy={slotY(x)} r="17" className="hit" />
          <text x={LX - 26} y={slotY(x) + 7}>{x}</text>
          <circle cx={LX - 2} cy={slotY(x)} r="3.5" className="eyelet" />
        </g>
      ))}

      {/* salidas */}
      {Array.from({ length: rightMax + 1 }, (_, y) => (
        <g
          key={y}
          className={"slot out" + (hand ? " ready" : "")}
          onPointerUp={(e) => {
            e.stopPropagation();
            dropOnOutput(y);
          }}
        >
          <circle cx={RX + 28} cy={slotY(y)} r="17" className="hit" />
          <text x={RX + 28} y={slotY(y) + 7}>{y}</text>
          <circle cx={RX + 4} cy={slotY(y)} r="3.5" className="eyelet" />
        </g>
      ))}

      {/* extender orillas */}
      {leftMax < 12 && (
        <g className="slot extend" onPointerDown={() => setExtraL(leftMax + 3 - 7)}>
          <circle cx={LX - 26} cy={slotY(leftMax + 1) + 2} r="13" className="hit" />
          <text x={LX - 26} y={slotY(leftMax + 1) + 8}>+</text>
        </g>
      )}
      {rightMax < 40 && (
        <g
          className="slot extend"
          onPointerDown={() => setExtraR(rightMax + 4 - 14)}
        >
          <circle cx={RX + 28} cy={slotY(rightMax + 1) + 2} r="13" className="hit" />
          <text x={RX + 28} y={slotY(rightMax + 1) + 8}>+</text>
        </g>
      )}
    </svg>
  );
}
