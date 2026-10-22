import Image from "next/image";
import logo from "@/assets/logo.webp";
import { ArrowUpRight } from "./Icons";
import s from "./Footer.module.css";

const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Shop", links: ["All products", "Sunscreen", "Moisturizers", "Cleansers", "Serums"] },
  {
    title: "Discover",
    links: ["Skin Concerns", "Ingredients", "Skin Types", "Our Science", "Recommended Routine", "Virtual Skin Check"],
  },
  {
    title: "OUR COMMITMENT",
    links: ["Sensitive Skin", "Safety & Tolerability", "Dermatologist Tested", "Sustainability", "Charter of Formulation"],
  },
  {
    title: "HELP",
    links: ["FAQS", "Contact Us", "Shipping & Delivery", "Returns", "My Orders", "Charter of Formulation"],
  },
];

const LEGAL = ["Privacy Policy", "Terms of Use", "CA Supply Chain Act", "Accessibility"];

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.brand}>
            <Image src={logo} alt="La Roche-Posay" />
            <p className={s.tagline}>Dermatological skincare for a better life.</p>
          </div>

          <form className={s.newsletter} onSubmit={undefined}>
            <div className={s.newsletterHeading}>
              <p className={s.newsletterTitle}>Stay in the know</p>
              <p className={s.newsletterSub}>Sign up for expert advice, skincare tips and exclusive offers.</p>
            </div>
            <label className={s.input}>
              <span className={s.srOnly}>Email</span>
              <input type="email" placeholder="Enter your email" autoComplete="email" />
              <ArrowUpRight size={14} />
            </label>
          </form>
        </div>

        <hr className={s.rule} />

        <div className={s.columns}>
          {COLUMNS.map((col) => (
            <div key={col.title} className={s.column}>
              <p className={s.columnTitle}>{col.title}</p>
              <ul>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className={s.rule} />

        <div className={s.legal}>
          <p>© 2024 La Roche-Posay. All Rights Reserved.</p>
          <ul>
            {LEGAL.map((item) => (
              <li key={item}>
                <a href="#">{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
