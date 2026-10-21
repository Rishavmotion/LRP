import { Fragment } from "react";
import s from "./overlays.module.css";

// Bracketed callouts (scenes 7 and 9). Geometry is in the local pixel space of
// each variant, taken from the Figma frames; desktop is positioned as a
// percentage of the viewport so it tracks the footage, mobile in px.

interface Geometry {
  /** Total box, px. */
  w: number;
  h: number;
  /** Bottom-left bracket top offset. */
  blY: number;
  /** Right bracket x and height. */
  rX: number;
  rH: number;
  /** Connector path (local coords) and end dot. */
  path: string;
  dot: [number, number];
  /** Text block offset. */
  textX: number;
  textY: number;
}

export interface CalloutProps {
  title: string[];
  lines: string[];
  desktop: Geometry & { left: string; top: string };
  mobile: Geometry & { left: string; top: string };
}

const BRACKET = 21.26;

function Diagram({ g, className }: { g: Geometry & { left: string; top: string }; className: string }) {
  return (
    <div className={`${s.callout} ${className}`} style={{ left: g.left, top: g.top, width: g.w, height: g.h }}>
      <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} fill="none" aria-hidden="true">
        {/* top-left corner */}
        <path d={`M${BRACKET - 1} 1H1V${BRACKET - 1}`} stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* bottom-left corner */}
        <path
          d={`M${BRACKET - 1} ${g.blY + BRACKET - 1}H1V${g.blY + 1}`}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* right bracket */}
        <path
          d={`M${g.rX + 1} ${g.rH - 1}H${g.rX + BRACKET - 1}V1H${g.rX + 1}`}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d={g.path} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={g.dot[0]} cy={g.dot[1]} r="5.33" fill="white" />
      </svg>
    </div>
  );
}

export default function Callout({ title, lines, desktop, mobile }: CalloutProps) {
  const text = (g: Geometry) => (
    <div className={s.calloutText} style={{ left: g.textX, top: g.textY }}>
      <p>
        {title.map((t, i) => (
          <Fragment key={i}>
            {t}
            {i < title.length - 1 && <br />}
          </Fragment>
        ))}
      </p>
      <p>
        {lines.map((t, i) => (
          <Fragment key={i}>
            {t}
            {i < lines.length - 1 && <br />}
          </Fragment>
        ))}
      </p>
    </div>
  );

  return (
    <div className={s.reveal}>
      <div className={s.desktopOnly}>
        <Diagram g={desktop} className="" />
        <div className={s.callout} style={{ left: desktop.left, top: desktop.top }}>
          {text(desktop)}
        </div>
      </div>
      <div className={s.mobileOnly}>
        <Diagram g={mobile} className="" />
        <div className={s.callout} style={{ left: mobile.left, top: mobile.top }}>
          {text(mobile)}
        </div>
      </div>
    </div>
  );
}

// Scene 7 — "FEATURE-LIGHT TEXTURE"
export const CALLOUT_FEATURE_LIGHT: CalloutProps = {
  title: ["FEATURE-LIGHT", "TEXTURE"],
  lines: ["Buildable tint.", "Natural finish."],
  desktop: {
    left: "31.27%",
    top: "17.15%",
    w: 397,
    h: 295,
    blY: 145,
    rX: 202,
    rH: 166.28,
    path: "M223 86.4H361.3V259.2L391.6 289.6",
    dot: [391.6, 289.6],
    textX: 25,
    textY: 19.6,
  },
  mobile: {
    left: "23px",
    top: "23px",
    w: 298,
    h: 295,
    blY: 115,
    rX: 153.2,
    rH: 136.28,
    path: "M173.8 86.4H262.1V259.2L292.4 289.6",
    dot: [292.4, 289.6],
    textX: 15,
    textY: 15,
  },
};

// Scene 9 — "INVISIBLE FINISH"
export const CALLOUT_INVISIBLE_FINISH: CalloutProps = {
  title: ["INVISIBLE FINISH"],
  lines: ["No white cast.", "Natural skin.", "Weightless feel."],
  desktop: {
    left: "15.7%",
    top: "7.4%",
    w: 432,
    h: 200,
    blY: 145,
    rX: 215.9,
    rH: 129.28,
    path: "M236.8 86.4H375.1V169.3L405.4 199.6H431.5",
    dot: [431.5, 199.6],
    textX: 27,
    textY: 19.6,
  },
  mobile: {
    left: "23px",
    top: "23px",
    w: 298,
    h: 295,
    blY: 108,
    rX: 163.3,
    rH: 129.28,
    path: "M183.9 86.4H262.2V259.2L292.5 289.6",
    dot: [292.5, 289.6],
    textX: 15,
    textY: 15.5,
  },
};
