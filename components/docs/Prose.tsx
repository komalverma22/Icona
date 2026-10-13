import type { ReactNode } from "react";
import { cx } from "../ui/Button";

/** A docs section. `scroll-mt` keeps the heading clear of the sticky header and the mobile flight bar. */
export function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[132px] border-t border-divider pt-10 pb-12 first:border-t-0 first:pt-0 lg:scroll-mt-[96px]">
      <p className="text-[11px] leading-3 font-medium tracking-[0.06em] text-accent-ink uppercase">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-2 mb-4 text-[24px] leading-8 font-medium text-ink">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export const H3 = ({ children }: { children: ReactNode }) => <h3 className="mt-4 text-[15px] leading-6 font-medium text-ink">{children}</h3>;

export const P = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cx("text-[14px] leading-[24px] text-text", className)}>{children}</p>;

export const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded-[5px] bg-badge px-1.5 py-0.5 font-mono text-[12px] leading-none text-ink">{children}</code>
);

export const UL = ({ children }: { children: ReactNode }) => <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-[24px] text-text marker:text-muted">{children}</ul>;

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warn"; title: string; children: ReactNode }) {
  return (
    <aside
      className={cx(
        "my-2 flex gap-3 rounded-[12px] border px-4 py-3.5",
        tone === "warn" ? "border-[rgba(214,142,32,0.35)] bg-[rgba(255,196,64,0.1)]" : "border-[rgba(43,154,243,0.28)] bg-[rgba(43,154,243,0.06)]",
      )}
    >
      <span aria-hidden className={cx("mt-[9px] size-1.5 shrink-0 rounded-full", tone === "warn" ? "bg-[#e0a21f]" : "bg-accent")} />
      <div className="min-w-0 text-[13px] leading-5 text-text">
        <p className="font-medium text-ink">{title}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </aside>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="my-2 flex flex-col gap-4 [counter-reset:step]">{children}</ol>;
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="relative pl-10 [counter-increment:step] before:absolute before:top-0 before:left-0 before:flex before:size-6 before:items-center before:justify-center before:rounded-full before:bg-ink before:text-[12px] before:font-medium before:text-white before:content-[counter(step)]">
      <h3 className="text-[14px] leading-6 font-medium text-ink">{title}</h3>
      <div className="mt-1 text-[14px] leading-[24px] text-text">{children}</div>
    </li>
  );
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="my-2 overflow-x-auto rounded-[12px] border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left text-[13px] leading-5">
        <thead className="bg-card text-[11px] leading-4 font-medium tracking-[0.04em] text-muted uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-3.5 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-line align-top">
              {row.map((cell, j) => (
                <td key={j} className={cx("px-3.5 py-3 text-text", j === 0 && "font-medium whitespace-nowrap text-ink")}>
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
