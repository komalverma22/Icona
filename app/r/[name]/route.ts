import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { iconItem, particlesItem, PARTICLES_ITEM } from "@/components/export/registry";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300, s-maxage=3600",
};

/**
 * Registry items for `npx shadcn@latest add <origin>/r/<name>.json`.
 * Icon items accept the details page's customisations as query parameters
 * (color, size, stroke, speed).
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/r/[name]">) {
  const { name: raw } = await ctx.params;
  const name = raw.replace(/\.json$/, "");
  const { origin, searchParams } = request.nextUrl;

  if (name === PARTICLES_ITEM) {
    const source = await readFile(path.join(process.cwd(), "components", "motion", "particles.ts"), "utf8");
    return new Response(JSON.stringify(particlesItem(source), null, 2), { headers });
  }

  const item = iconItem(name, searchParams, origin);
  if (!item) return Response.json({ error: `No icon named "${name}".` }, { status: 404, headers });
  return new Response(JSON.stringify(item, null, 2), { headers });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" } });
}
