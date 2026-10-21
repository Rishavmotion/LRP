import { Fragment } from "react";
import s from "./overlays.module.css";

type Lines = string | string[];

const lines = (v: Lines) => (Array.isArray(v) ? v : [v]);

function Headline({ parts, className }: { parts: string[]; className: string }) {
  return (
    <h2 className={className}>
      {parts.map((line, i) => (
        <Fragment key={i}>
          {line}
          {i < parts.length - 1 && <br />}
        </Fragment>
      ))}
    </h2>
  );
}

export default function CopyBlock({
  side,
  eyebrow,
  headline,
  mobileHeadline,
  body,
  mobileGradient,
}: {
  side: "left" | "right";
  /** A string, or several strings separated by a dot (e.g. ["SPF 50", "•", "UVA / UVB"]). */
  eyebrow?: Lines;
  /** Desktop headline lines (hard breaks as in the design). */
  headline: string[];
  /** Mobile headline lines; defaults to `headline`. */
  mobileHeadline?: string[];
  body: Lines;
  /** Option 2 of the mobile design: a soft black gradient so copy stays readable. */
  mobileGradient?: "bottom" | "both";
}) {
  const eyebrowParts = eyebrow ? lines(eyebrow) : null;
  const bodyLines = lines(body);

  return (
    <>
      {mobileGradient && <div className={s.gradientBottom} aria-hidden="true" />}
      {mobileGradient === "both" && <div className={s.gradientTop} aria-hidden="true" />}

      <div className={`${s.copy} ${side === "left" ? s.copyLeft : s.copyRight} ${s.reveal}`}>
        {eyebrowParts ? (
          <p className={s.eyebrow}>
            {eyebrowParts.map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </p>
        ) : (
          <p className={`${s.eyebrow} ${s.eyebrowEmpty}`} aria-hidden="true" />
        )}

        <Headline parts={headline} className={`${s.h2} ${mobileHeadline ? s.desktopOnly : ""}`} />
        {mobileHeadline && <Headline parts={mobileHeadline} className={`${s.h2} ${s.mobileOnly}`} />}

        <p className={s.body}>
          {bodyLines.map((line, i) => (
            <Fragment key={i}>
              {line}
              {i < bodyLines.length - 1 && <br />}
            </Fragment>
          ))}
        </p>
      </div>
    </>
  );
}
