// Inline icons taken from the Figma assets (figma-assets/*).

export function Hamburger() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.16667 14.1667H15.8333M4.16667 10H15.8333M4.16667 5.83333H15.8333"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma's "arrow-down-left" rotated 180° = up-right. */
export function ArrowUpRight({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      style={{ transform: "rotate(180deg)" }}
    >
      <path
        d="M15.3663 2.86635C15.4816 2.74696 15.6195 2.65174 15.772 2.58622C15.9245 2.52071 16.0885 2.48623 16.2545 2.48479C16.4205 2.48335 16.5851 2.51497 16.7387 2.57782C16.8923 2.64068 17.0319 2.73349 17.1492 2.85086C17.2666 2.96822 17.3594 3.10779 17.4223 3.26141C17.4851 3.41503 17.5168 3.57963 17.5153 3.7456C17.5139 3.91158 17.4794 4.0756 17.4139 4.22811C17.3484 4.38061 17.2531 4.51854 17.1337 4.63385L6.7675 15.0001H16.25C16.5815 15.0001 16.8995 15.1318 17.1339 15.3662C17.3683 15.6006 17.5 15.9186 17.5 16.2501C17.5 16.5816 17.3683 16.8996 17.1339 17.134C16.8995 17.3684 16.5815 17.5001 16.25 17.5001H3.75C3.41848 17.5001 3.10054 17.3684 2.86612 17.134C2.6317 16.8996 2.5 16.5816 2.5 16.2501V3.7501C2.5 3.41858 2.6317 3.10064 2.86612 2.86622C3.10054 2.6318 3.41848 2.5001 3.75 2.5001C4.08152 2.5001 4.39946 2.6318 4.63388 2.86622C4.8683 3.10064 5 3.41858 5 3.7501V13.2326L15.3663 2.86635Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ScrollArrow() {
  return (
    <svg width="11" height="19" viewBox="0 0 10.8995 19" fill="none" aria-hidden="true">
      <path d="M5.44922 0.5V18.5" stroke="currentColor" strokeLinecap="round" />
      <path
        d="M0.5 13.5503L5.44975 18.5L10.3995 13.5503"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldBadge({ size = 55.5 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M39.6397 20C39.6397 30.8467 30.8467 39.6397 20 39.6397C9.15328 39.6397 0.360284 30.8467 0.360284 20C0.360284 9.15328 9.15328 0.360284 20 0.360284C30.8467 0.360284 39.6397 9.15328 39.6397 20Z"
        stroke="#D9D9D9"
        strokeWidth="0.72"
      />
      <path
        d="M10.3574 10.4608L19.7626 7.94102C20.0102 7.87468 20.271 7.87559 20.5182 7.94365L29.6611 10.4617C29.9818 10.55 30.2003 10.8463 30.19 11.1787L29.9463 19.0377C29.878 21.2372 28.9738 23.3279 27.4178 24.8839L21.1598 31.1419C20.597 31.7047 19.6845 31.7047 19.1217 31.1419L12.7802 24.8004C11.2742 23.2944 10.377 21.2856 10.2605 19.159L9.8244 11.1963C9.80576 10.8559 10.0282 10.549 10.3574 10.4608Z"
        stroke="white"
        strokeWidth="0.72"
        strokeLinecap="round"
      />
    </svg>
  );
}
