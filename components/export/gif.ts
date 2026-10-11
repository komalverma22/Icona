/**
 * Minimal animated-GIF encoder (GIF89a): one shared palette (median cut), LZW
 * compression, 1-bit transparency and an infinite loop. No dependencies.
 */

export interface RgbaFrame {
  data: Uint8ClampedArray;
}

const key5 = (r: number, g: number, b: number) => ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

interface Bucket {
  r: number;
  g: number;
  b: number;
  n: number;
}

/** Palette of at most `max` colours from a colour histogram (weighted median cut). */
function medianCut(histogram: Map<number, Bucket>, max: number): [number, number, number][] {
  type Box = Bucket[];
  const boxes: Box[] = [[...histogram.values()]];
  const range = (box: Box) => {
    const lo = [255, 255, 255];
    const hi = [0, 0, 0];
    for (const c of box) {
      const v = [c.r / c.n, c.g / c.n, c.b / c.n];
      for (let i = 0; i < 3; i++) {
        lo[i] = Math.min(lo[i], v[i]);
        hi[i] = Math.max(hi[i], v[i]);
      }
    }
    return hi.map((h, i) => h - lo[i]);
  };
  while (boxes.length < max) {
    let target = -1;
    let best = 0;
    boxes.forEach((box, i) => {
      if (box.length < 2) return;
      const score = Math.max(...range(box)) * box.reduce((s, c) => s + c.n, 0);
      if (score > best) {
        best = score;
        target = i;
      }
    });
    if (target < 0) break;
    const box = boxes[target];
    const r = range(box);
    const channel = r.indexOf(Math.max(...r)) as 0 | 1 | 2;
    const get = (c: Bucket) => [c.r, c.g, c.b][channel] / c.n;
    box.sort((a, b) => get(a) - get(b));
    const total = box.reduce((s, c) => s + c.n, 0);
    let acc = 0;
    let cut = 1;
    for (let i = 0; i < box.length - 1; i++) {
      acc += box[i].n;
      cut = i + 1;
      if (acc >= total / 2) break;
    }
    boxes.splice(target, 1, box.slice(0, cut), box.slice(cut));
  }
  return boxes.map((box) => {
    const n = box.reduce((s, c) => s + c.n, 0);
    return [Math.round(box.reduce((s, c) => s + c.r, 0) / n), Math.round(box.reduce((s, c) => s + c.g, 0) / n), Math.round(box.reduce((s, c) => s + c.b, 0) / n)];
  });
}

/** Index 0 is the transparent colour; opaque colours follow. */
function buildPalette(frames: RgbaFrame[]): { palette: [number, number, number][]; indexOf: (r: number, g: number, b: number) => number } {
  const histogram = new Map<number, Bucket>();
  for (const { data } of frames) {
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const k = key5(data[i], data[i + 1], data[i + 2]);
      const b = histogram.get(k);
      if (b) {
        b.r += data[i];
        b.g += data[i + 1];
        b.b += data[i + 2];
        b.n += 1;
      } else histogram.set(k, { r: data[i], g: data[i + 1], b: data[i + 2], n: 1 });
    }
  }
  const colours = histogram.size ? medianCut(histogram, 255) : [];
  const palette: [number, number, number][] = [[0, 0, 0], ...colours];
  const cache = new Map<number, number>();
  const indexOf = (r: number, g: number, b: number) => {
    const k = key5(r, g, b);
    const hit = cache.get(k);
    if (hit !== undefined) return hit;
    let best = 1;
    let bestD = Infinity;
    for (let i = 1; i < palette.length; i++) {
      const d = (palette[i][0] - r) ** 2 + (palette[i][1] - g) ** 2 + (palette[i][2] - b) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    cache.set(k, best);
    return best;
  };
  return { palette, indexOf };
}

/** GIF flavoured LZW. */
function lzw(indices: Uint8Array, minCodeSize: number): number[] {
  const clear = 1 << minCodeSize;
  const end = clear + 1;
  const out: number[] = [];
  let bits = 0;
  let nbits = 0;
  let codeSize = minCodeSize + 1;
  const emit = (code: number) => {
    bits |= code << nbits;
    nbits += codeSize;
    while (nbits >= 8) {
      out.push(bits & 0xff);
      bits >>= 8;
      nbits -= 8;
    }
  };

  let dict = new Map<number, number>();
  let next = end + 1;
  emit(clear);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const c = indices[i];
    const k = prefix * 256 + c;
    const hit = dict.get(k);
    if (hit !== undefined) {
      prefix = hit;
      continue;
    }
    emit(prefix);
    if (next < 4096) {
      dict.set(k, next++);
      if (next - 1 === 1 << codeSize && codeSize < 12) codeSize++;
    } else {
      emit(clear);
      dict = new Map();
      next = end + 1;
      codeSize = minCodeSize + 1;
    }
    prefix = c;
  }
  emit(prefix);
  emit(end);
  if (nbits > 0) out.push(bits & 0xff);
  return out;
}

/**
 * Encode frames (all `width` × `height` RGBA) as a looping GIF. Pixels with
 * alpha below 50% become transparent; the rest keep their own colour.
 */
export function encodeGif(frames: RgbaFrame[], width: number, height: number, delayMs: number): Uint8Array {
  const { palette, indexOf } = buildPalette(frames);
  let depth = 1;
  while (1 << depth < palette.length) depth++;
  depth = Math.max(depth, 2);

  const out: number[] = [];
  const u16 = (n: number) => out.push(n & 0xff, (n >> 8) & 0xff);
  const text = (s: string) => [...s].forEach((c) => out.push(c.charCodeAt(0)));

  text("GIF89a");
  u16(width);
  u16(height);
  out.push(0x80 | ((depth - 1) << 4) | (depth - 1), 0, 0);
  for (let i = 0; i < 1 << depth; i++) out.push(...(palette[i] ?? [0, 0, 0]));
  // Loop forever.
  out.push(0x21, 0xff, 11);
  text("NETSCAPE2.0");
  out.push(3, 1, 0, 0, 0);

  const centis = Math.max(2, Math.round(delayMs / 10));
  for (const { data } of frames) {
    const indices = new Uint8Array(width * height);
    for (let p = 0; p < indices.length; p++) {
      const o = p * 4;
      indices[p] = data[o + 3] < 128 ? 0 : indexOf(data[o], data[o + 1], data[o + 2]);
    }
    // Graphic control: restore to background after each frame, colour 0 transparent.
    out.push(0x21, 0xf9, 4, (2 << 2) | 1);
    u16(centis);
    out.push(0, 0);
    out.push(0x2c);
    u16(0);
    u16(0);
    u16(width);
    u16(height);
    out.push(0, depth);
    const data2 = lzw(indices, depth);
    for (let i = 0; i < data2.length; i += 255) {
      const chunk = data2.slice(i, i + 255);
      out.push(chunk.length, ...chunk);
    }
    out.push(0);
  }
  out.push(0x3b);
  return Uint8Array.from(out);
}
