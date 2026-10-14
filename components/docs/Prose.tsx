import type { ReactNode } from "react";
import { cx } from "../ui/Button";

/** A docs section. `scroll-mt` keeps the heading clear of the sticky header and the mobile flight bar. */
export function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[132px] border-t border-divider pt-12 pb-14 first:border-t-0 first:pt-0 lg:scroll-mt-[96px]">
      <p className="text-[12px] leading-4 font-medium text-accent-ink">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-2 mb-5 text-[28px] leading-9 font-medium tracking-[-0.02em] text-ink">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export const H3 = ({ children }: { children: ReactNode }) => <h3 className="mt-6 text-[17px] leading-7 font-medium tracking-[-0.01em] text-ink">{children}</h3>;

export const P = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cx("text-[15px] leading-[26px] text-text", className)}>{children}</p>;

export const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded-[6px] border border-line bg-card px-1.5 py-[3px] font-mono text-[12.5px] leading-none text-ink">{children}</code>
);

export const UL = ({ children }: { children: ReactNode }) => (
  <ul className="flex flex-col gap-2.5 text-[15px] leading-[26px] text-text [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:top-[11px] [&>li]:before:left-0 [&>li]:before:size-1.5 [&>li]:before:rounded-full [&>li]:before:bg-accent/60 [&>li]:before:content-['']">
    {children}
  </ul>
);

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warn"; title: string; children: ReactNode }) {
  return (
    <aside
      className={cx(
        "my-2 rounded-[12px] border-l-[3px] px-4 py-3.5",
        tone === "warn" ? "border-[#e0a21f] bg-[rgba(255,196,64,0.1)]" : "border-accent bg-[rgba(43,154,243,0.06)]",
      )}
    >
      <p className="text-[14px] leading-6 font-medium text-ink">{title}</p>
      <div className="mt-0.5 text-[14px] leading-[22px] text-text">{children}</div>
    </aside>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="my-2 flex flex-col [counter-reset:step]">{children}</ol>;
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="relative pb-7 pl-12 [counter-increment:step] last:pb-0 before:absolute before:top-0 before:left-0 before:z-10 before:flex before:size-8 before:items-center before:justify-center before:rounded-full before:bg-ink before:text-[13px] before:font-medium before:text-white before:content-[counter(step)] after:absolute after:top-9 after:bottom-1 after:left-4 after:w-px after:bg-line last:after:hidden">
      <h3 className="text-[16px] leading-8 font-medium text-ink">{title}</h3>
      <div className="mt-0.5 text-[15px] leading-[26px] text-text">{children}</div>
    </li>
  );
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="my-2 overflow-x-auto rounded-[12px] border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left text-[14px] leading-[22px]">
        <thead className="bg-card text-[12px] leading-4 font-medium text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-line align-top">
              {row.map((cell, j) => (
                <td key={j} className={cx("px-4 py-3.5 text-text", j === 0 && "font-medium whitespace-nowrap text-ink")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
