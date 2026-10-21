import type { ReactNode } from "react";
import type { SceneId } from "@/lib/scenes";
import Hero from "./Hero";
import CopyBlock from "./CopyBlock";
import Shades from "./Shades";
import Callout, { CALLOUT_FEATURE_LIGHT, CALLOUT_INVISIBLE_FINISH } from "./Callout";
import Badges from "./Badges";
import FeatureTag from "./FeatureTag";
import UvCta from "./UvCta";

// Copy is verbatim from the Figma "Dark" design.
// TODO (copy review): "No while cast" → "No white cast"? "FEATURE-LIGHT" → "Feather-light"?
//                     "Invincible. Yet powerful." vs the storyboard's "invisible yet powerful".

const TINTED = (
  <CopyBlock
    side="left"
    eyebrow="100% MINERAL + SPF 50"
    headline={["Anthelios", "Mineral Tinted", "Sunscreen SPF 50"]}
    mobileHeadline={["Anthelios Mineral Tinted", "Sunscreen SPF 50"]}
    body="Meet your daily shield"
    mobileGradient="bottom"
  />
);

export function sceneOverlay(id: SceneId): ReactNode {
  switch (id) {
    case "hero":
      return <Hero />;

    case "freeze":
      return (
        <CopyBlock
          side="left"
          eyebrow={["SPF 50", "•", "UVA / UVB"]}
          headline={["Freeze The", "Moment."]}
          mobileHeadline={["Freeze The Moment."]}
          body={["Because UV exposure", "doesn't pause when you do."]}
          mobileGradient="bottom"
        />
      );

    case "tinted":
      return (
        <>
          {TINTED}
          <Shades />
        </>
      );

    case "tinted-product":
      return (
        <>
          {TINTED}
          <Shades />
        </>
      );

    case "lightweight":
      return (
        <>
          <Callout {...CALLOUT_FEATURE_LIGHT} />
          <CopyBlock
            side="right"
            eyebrow="Non-Greasy / Fast-Absorbing"
            headline={["Lightweight", "minimal precise"]}
            body="A tiny dab. Even coverage. No while cast."
            mobileGradient="both"
          />
        </>
      );

    case "strong":
      return (
        <CopyBlock
          side="left"
          eyebrow="100% MINERAL + UVA / UVB"
          headline={["Strong. Even.", "Effective"]}
          mobileHeadline={["Strong. Even. Effective"]}
          body="The shield fully activates. A strong, even protective layer spreads across the skin."
          mobileGradient="both"
        />
      );

    case "blends":
      return (
        <>
          <Callout {...CALLOUT_INVISIBLE_FINISH} />
          <CopyBlock
            side="right"
            eyebrow="CELL-OX SHIELD"
            headline={["Blends in.", "Protects out."]}
            mobileHeadline={["Blends in. Protects out."]}
            body="The tint blends seamlessly. A translucent protective layer forms beneath the surface."
            mobileGradient="both"
          />
        </>
      );

    case "badges":
      return <Badges />;

    case "invincible":
      return (
        <CopyBlock
          side="right"
          eyebrow="UVA / UVB + CELL-OX SHIELD"
          headline={["Invincible.", "Yet powerful."]}
          mobileHeadline={["Invincible. Yet powerful."]}
          body={["Translucent. Resilient.", "Light refracts across the layer."]}
          mobileGradient="bottom"
        />
      );

    case "stays":
      return (
        <>
          <FeatureTag show="desktop" />
          <CopyBlock
            side="right"
            eyebrow="CELL-OX SHIELD"
            headline={["Protection", "that stays"]}
            mobileHeadline={["Protection that stays"]}
            body={["We go deep. We come back.", "The shield remains."]}
            mobileGradient="bottom"
          />
        </>
      );

    case "back":
      return (
        <>
          <FeatureTag show="mobile" />
          <CopyBlock
            side="right"
            headline={["Now, get back to it."]}
            body={["The moment is yours again.", "Stay protected. Keep moving."]}
            mobileGradient="bottom"
          />
        </>
      );

    case "uv":
      return <UvCta />;

    // Footage-only sections.
    case "shadow":
    case "applicator":
    case "court":
    default:
      return null;
  }
}
