import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconDetails } from "@/components/details/IconDetails";
import { DEFAULT_OPTIONS, parseOptions } from "@/components/export/options";
import { categoryLabel, iconVariantsByKey } from "@/components/icons/iconLibrary";

type Props = PageProps<"/icons/[key]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const variant = iconVariantsByKey.get(key);
  if (!variant) return { title: "Icon not found - Icona" };
  return {
    title: `${variant.name} (${variant.style}) - Icona`,
    description: `${variant.name} icon from the ${categoryLabel(variant.category)} set. Copy it as React, SVG or HTML, download PNG, GIF or APNG, or install it with one command.`,
  };
}

/** Details + export page for one icon. Customisations (motion, color, size, stroke, speed) live in the query string. */
export default async function IconPage({ params, searchParams }: Props) {
  const { key } = await params;
  const variant = iconVariantsByKey.get(key);
  if (!variant) notFound();
  const query = await searchParams;
  const get = (name: string) => {
    const v = query[name];
    return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
  };
  const initial = parseOptions({ get }, variant, DEFAULT_OPTIONS);
  return <IconDetails key={key} variantKey={key} initial={initial} />;
}
