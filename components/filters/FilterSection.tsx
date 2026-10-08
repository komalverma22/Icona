import type { ReactNode } from "react";

interface FilterSectionProps {
  /** id applied to the label so controls can reference it via aria-labelledby. */
  labelId: string;
  label: string;
  /** Current value shown on the right of the label (e.g. "32px"). */
  hint?: ReactNode;
  children: ReactNode;
}

/** Figma section label (12px Booton, muted) with an optional live value hint. */
export function FilterSection({ labelId, label, hint, children }: FilterSectionProps) {
  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 id={labelId} className="text-[12px] leading-3 font-medium text-muted">
          {label}
        </h3>
        {hint !== undefined && <span className="text-[11px] leading-3 font-medium text-muted">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
