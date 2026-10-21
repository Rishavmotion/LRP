import Image from "next/image";
import { Hamburger } from "./Icons";
import s from "./Nav.module.css";

const LINKS = ["Product", "Technology", "Protection", "How to Use"];

export default function Nav() {
  return (
    <header className={s.nav}>
      <button type="button" className={s.menu} aria-label="Open menu">
        <span className={s.menuLabel}>Menu</span>
        <Hamburger />
      </button>

      <a href="#" className={s.logo} aria-label="La Roche-Posay">
        <Image src="/brand/logo.png" alt="" width={237} height={61} priority />
      </a>

      <nav className={s.links} aria-label="Primary">
        {LINKS.map((label) => (
          <a key={label} href="#">
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
