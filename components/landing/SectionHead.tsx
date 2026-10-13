import type { ReactNode } from "react";
import { HeroBadge } from "../site/HeroBadge";
import { Reveal } from "./Reveal";

/**
 * Eyebrow + heading + optional lead used at the top of every landing section.
 * With `pillIcon`, the eyebrow becomes the same pill as the hero's "Open Source" label.
 */
export function SectionHead({
  eyebrow,
  title,
  children,
  center,
  pillIcon,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  center?: boolean;
  pillIcon?: string;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-[640px] text-center" : "max-w-[640px]"}>
      {pillIcon ? (
        <HeroBadge icon={pillIcon}>{eyebrow}</HeroBadge>
      ) : (
        <p className="text-[12px] leading-4 font-semibold tracking-[0.08em] text-accent-ink uppercase">{eyebrow}</p>
      )}
      <h2 className={`${pillIcon ? "mt-4" : "mt-3"} text-[30px] leading-[1.1] font-medium tracking-[-0.03em] text-ink sm:text-[40px]`}>{title}</h2>
      {children && <p className="mt-4 text-[15px] leading-6 text-muted sm:text-[17px] sm:leading-7">{children}</p>}
    </Reveal>
  );
}
