import Cta from "../Cta";
import s from "./overlays.module.css";

export default function UvCta() {
  return (
    <div className={s.uv}>
      <div className={`${s.uvContent} ${s.reveal}`}>
        <h2 className={s.h1}>
          UV never disappears.
          <br />
          It only varies.
        </h2>
        <p className={`${s.lead} ${s.leadSolid}`}>Check the UV index. Protect your skin. Every day.</p>
        <Cta tone="blue">Shop Anthelios</Cta>
      </div>
    </div>
  );
}
