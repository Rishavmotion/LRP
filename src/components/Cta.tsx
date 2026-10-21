import type { ReactNode } from "react";
import { ArrowUpRight } from "./Icons";
import s from "./Cta.module.css";

export default function Cta({
  children,
  tone = "navy",
  href = "#",
}: {
  children: ReactNode;
  tone?: "navy" | "blue";
  href?: string;
}) {
  return (
    <a href={href} className={`${s.cta} ${tone === "blue" ? s.blue : ""}`}>
      <span>{children}</span>
      <ArrowUpRight size={20} />
    </a>
  );
}
