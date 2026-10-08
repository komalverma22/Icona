"use client";

import { motion } from "framer-motion";
import { memo, useId } from "react";
import { ACTIVE, REST, type CompiledNodeMotion, type IconAnimationState } from "./animations/animationTypes";
import { getIconAnimation } from "./animations/iconAnimations";
import { geometryAttrs, maskIdFor, paintAttrs, ROOT_ATTRS, splitNodes, VIEWBOX } from "./svgAttributes";
import type { IconNode, IconVariant } from "./types";

const motionTags = { path: motion.path, circle: motion.circle, line: motion.line } as const;

interface SvgNodeProps {
  node: IconNode;
  compiled?: CompiledNodeMotion;
}

/** One SVG element. Animated nodes become motion elements that inherit the parent's variant state. */
function SvgNode({ node, compiled }: SvgNodeProps) {
  const geometry = geometryAttrs(node);
  const paint = paintAttrs(node);

  if (!compiled) {
    if (node.animationOnly) return null;
    const Tag = node.type;
    return <Tag {...geometry} {...paint} {...node.attrs} />;
  }

  // Static attributes that are also animated are owned by Framer Motion.
  const restValues = compiled.variants[REST] as Record<string, unknown>;
  const staticAttrs = Object.fromEntries(Object.entries(node.attrs ?? {}).filter(([key]) => !(key in restValues)));
  const MotionTag = motionTags[node.type];
  return <MotionTag {...geometry} {...paint} {...staticAttrs} variants={compiled.variants} style={compiled.style} />;
}

export interface IconRendererProps {
  variant: IconVariant;
  size: number;
  /** "active" plays the icon's path animation; "rest" settles it back. */
  state?: IconAnimationState;
  /** Set to "rest" to play the active animation immediately on mount. */
  initialState?: IconAnimationState;
  className?: string;
}

/**
 * Renders an icon variant as inline SVG. Animation variants are compiled once
 * per icon (cached in `getIconAnimation`), so re-renders only flip `state`.
 */
export const IconRenderer = memo(function IconRenderer({ variant, size, state = REST, initialState, className }: IconRendererProps) {
  const reactId = useId();
  const compiled = getIconAnimation(variant);
  const { knockouts, body } = splitNodes(variant.nodes);
  const maskId = maskIdFor(variant, reactId.replace(/[^a-zA-Z0-9_-]/g, ""));

  const content = (
    <>
      {knockouts.length > 0 && (
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
            <rect width="24" height="24" fill="#fff" stroke="none" />
            {knockouts.map((node) => (
              <SvgNode key={node.id} node={node} compiled={compiled[node.id]} />
            ))}
          </mask>
        </defs>
      )}
      <g mask={knockouts.length > 0 ? `url(#${maskId})` : undefined}>
        {body.map((node) => (
          <SvgNode key={node.id} node={node} compiled={compiled[node.id]} />
        ))}
      </g>
    </>
  );

  const common = {
    width: size,
    height: size,
    viewBox: VIEWBOX,
    ...ROOT_ATTRS,
    className,
    "aria-hidden": true,
    focusable: "false" as const,
  };

  if (!variant.animated) return <svg {...common}>{content}</svg>;

  return (
    <motion.svg {...common} initial={initialState ?? false} animate={state === ACTIVE ? ACTIVE : REST}>
      {content}
    </motion.svg>
  );
});
