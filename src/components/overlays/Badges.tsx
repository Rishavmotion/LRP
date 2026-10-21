import s from "./overlays.module.css";

// Scene 10 — four frosted badges pinned to points on the shield mesh.
// Desktop positions are percentages of the 1801×1070 design frame; mobile
// positions are px from the 393×852 frame. Each badge has a thin line with a
// dot at the far end (paths from the Figma SVGs, redrawn in local coords).

interface Badge {
  label: string;
  desktop: { left: string; top: string };
  mobile: { left: number; top: number };
  line: {
    desktop: { left: string; top: string; w: number; h: number; d: string; dot: [number, number] };
    mobile: { left: number; top: number; w: number; h: number; d: string; dot: [number, number] };
  };
}

const BADGES: Badge[] = [
  {
    label: "Dermatologist tested",
    desktop: { left: "36.5%", top: "19.2%" },
    mobile: { left: 35.96, top: 190.78 },
    line: {
      desktop: { left: "41.3%", top: "25.2%", w: 48.05, h: 138.82, d: "M47 1V91.8L5.3 133.5", dot: [5.3, 133.5] },
      mobile: { left: 110.65, top: 231.78, w: 37.3, h: 98.07, d: "M36.3 1V61.8L5.3 92.7", dot: [5.3, 92.7] },
    },
  },
  {
    label: "Suitable for sensitive skin",
    desktop: { left: "56.9%", top: "32.9%" },
    mobile: { left: 138.8, top: 57.04 },
    line: {
      desktop: { left: "65.6%", top: "39.2%", w: 40.72, h: 159.79, d: "M1 1V112.9L35.4 154.5", dot: [35.4, 154.5] },
      mobile: { left: 246.8, top: 98.04, w: 37.3, h: 98.07, d: "M1 1V61.8L32 92.7", dot: [32, 92.7] },
    },
  },
  {
    label: "Ocean respect",
    desktop: { left: "12%", top: "59.6%" },
    mobile: { left: 49.5, top: 707.86 },
    line: {
      desktop: { left: "17.7%", top: "48.1%", w: 44.98, h: 113.27, d: "M1 112.3V53.9L39.6 5.3", dot: [39.6, 5.3] },
      mobile: { left: 106.52, top: 610.79, w: 37.3, h: 98.07, d: "M1 97.1V36.3L32 5.3", dot: [32, 5.3] },
    },
  },
  {
    label: "Made in France",
    desktop: { left: "35.8%", top: "80.4%" },
    mobile: { left: 214.8, top: 539.17 },
    line: {
      desktop: { left: "41.6%", top: "65.8%", w: 57.56, h: 148.32, d: "M1 147.3V58.4L52.2 5.3", dot: [52.2, 5.3] },
      mobile: { left: 274.31, top: 442.1, w: 37.3, h: 98.07, d: "M1 97.1V36.3L32 5.3", dot: [32, 5.3] },
    },
  },
];

function Line({
  g,
}: {
  g: { left: string | number; top: string | number; w: number; h: number; d: string; dot: [number, number] };
}) {
  return (
    <svg
      className={s.badgeLine}
      style={{ left: g.left, top: g.top }}
      width={g.w}
      height={g.h}
      viewBox={`0 0 ${g.w} ${g.h}`}
      fill="none"
      aria-hidden="true"
    >
      <path d={g.d} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={g.dot[0]} cy={g.dot[1]} r="5.33" fill="white" />
    </svg>
  );
}

export default function Badges() {
  return (
    <div className={s.reveal}>
      {BADGES.map((b) => (
        <div key={b.label}>
          <div className={s.desktopOnly}>
            <Line g={b.line.desktop} />
            <div className={s.badge} style={b.desktop}>
              <span className={s.badgeIcon} />
              <span>{b.label}</span>
            </div>
          </div>
          <div className={s.mobileOnly}>
            <Line g={b.line.mobile} />
            <div className={s.badge} style={b.mobile}>
              <span className={s.badgeIcon} />
              <span>{b.label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
