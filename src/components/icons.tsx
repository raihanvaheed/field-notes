// Inline SVG icons (no icon library). All are decorative: pair them with text.
import type { ReactNode } from "react";

type IconProps = { size?: number; className?: string };

function Svg({
  size = 16,
  className,
  viewBox = "0 0 24 24",
  strokeWidth = 1.6,
  children,
}: IconProps & { viewBox?: string; strokeWidth?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </Svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </Svg>
  );
}

/** An open book: the "Reading" tab. */
export function BookIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z" />
      <path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
    </Svg>
  );
}

/** A letter A with a definition list beside it: the "Terms" tab. */
export function TermsIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M4 19l5-14 5 14" />
      <path d="M6 14h6" />
      <path d="M16 12h5M16 16h5" />
    </Svg>
  );
}

export function CloseIcon({ size = 14, className }: IconProps) {
  return (
    <Svg size={size} className={className} viewBox="0 0 14 14">
      <path d="M2 2l10 10M12 2L2 12" />
    </Svg>
  );
}
