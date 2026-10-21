import Cta from "../Cta";
import s from "./overlays.module.css";

export default function Hero() {
  return (
    <div className={s.hero}>
      <div className={`${s.heroContent} ${s.reveal}`}>
        <span className={s.tag}>ANTHELIOS</span>
        <h1 className={s.h1}>Protection, In Motion</h1>
        <p className={s.lead}>Daily mineral protection designed for life under the sun.</p>
        <Cta>Shop Anthelios</Cta>
      </div>
    </div>
  );
}
