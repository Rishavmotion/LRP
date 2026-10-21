import s from "./overlays.module.css";

const SHADES: { name: string; hex: string }[] = [
  { name: "Tinted", hex: "#D5BAAD" },
  { name: "Medium", hex: "#B78262" },
  { name: "Medium Deep", hex: "#A37155" },
  { name: "Deep", hex: "#683726" },
];

export default function Shades() {
  return (
    <div className={`${s.shades} ${s.reveal}`}>
      <p className={s.eyebrow}>AVAILABLE SHADES</p>
      <ul className={s.chips}>
        {SHADES.map((shade) => (
          <li key={shade.name} className={s.chip}>
            <span className={s.swatch} style={{ background: shade.hex }} />
            <span>{shade.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
