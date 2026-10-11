import type { SVGProps } from "react";

/** Props every icon accepts. Anything else is passed to the <svg> element. */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  /** Width of the 24-unit icon box in px. */
  size?: number;
  /** Any CSS colour. Defaults to `currentColor`, so icons follow the surrounding text colour. */
  color?: string;
  /** Stroke width on the 24-unit grid (outline icons). */
  strokeWidth?: number;
}

/** Props of animated icons. */
export interface AnimatedIconProps extends IconProps {
  /** Playback speed multiplier. */
  speed?: number;
  /** "hover" plays on hover / focus, "loop" repeats, "none" stays still. */
  animate?: "hover" | "loop" | "none";
}
