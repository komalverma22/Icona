import { Reveal } from "./Reveal";

const STEPS = [
  { n: "01", title: "Pick an icon", body: "Search the library, filter by style, size, color or animation, and open the one you like." },
  { n: "02", title: "Choose a motion", body: "Preview its animations in the studio. Tune the color, size, stroke and speed until it feels right." },
  { n: "03", title: "Drop it in", body: "Copy the code, run one install command, or download it as SVG, PNG, GIF or APNG." },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {STEPS.map((s, i) => (
        <li key={s.n}>
          <Reveal delay={i * 0.1} className="h-full">
            <div className="h-full rounded-[16px] border border-line bg-white p-6">
              <span className="inline-flex h-7 items-center rounded-full border border-[rgba(28,31,33,0.22)] bg-card px-2.5 font-mono text-[12px] leading-4 font-medium text-text">{s.n}</span>
              <h3 className="mt-4 text-[19px] leading-6 font-semibold tracking-[-0.015em] text-ink">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-[22px] text-muted">{s.body}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
