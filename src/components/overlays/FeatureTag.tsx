import { ShieldBadge } from "../Icons";
import s from "./overlays.module.css";

// "Long-lasting shield" tag. The desktop design shows it on the "Protection
// that stays" scene (top right); the mobile design on "Now, get back to it"
// (top left). `show` picks which breakpoint renders it.
export default function FeatureTag({ show }: { show: "desktop" | "mobile" }) {
  return (
    <div className={show === "desktop" ? s.desktopOnly : s.mobileOnly}>
      <div className={`${s.featureTag} ${s.reveal}`}>
        <ShieldBadge />
        <div>
          <p className={s.featureTitle}>Long-lasting shield</p>
          <p className={s.featureSub}>UVA &amp; UVB PROTECTION</p>
        </div>
      </div>
    </div>
  );
}
