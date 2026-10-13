import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

export function Stats({ icons, animated }: { icons: number; animated: number }) {
  const items: { value?: number; label: string; text?: string }[] = [
    { value: icons, label: "Icons" },
    { value: animated, label: "Animated versions" },
    { text: "0", label: "Animation libraries" },
    { text: "MIT", label: "Licensed" },
  ];
  return (
    <Reveal>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-line md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col-reverse bg-white px-5 py-6 md:px-6 md:py-8">
            <dt className="mt-1 text-[13px] leading-5 text-muted">{item.label}</dt>
            <dd className="text-[32px] leading-10 font-semibold tracking-[-0.03em] text-ink md:text-[40px] md:leading-[48px]">
              {item.value !== undefined ? <CountUp value={item.value} /> : item.text}
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
