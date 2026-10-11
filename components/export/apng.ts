/**
 * Animated PNG assembly. Each frame is encoded by the browser's own PNG encoder
 * (full 8-bit alpha, no quantisation); this file only stitches the frames into
 * an APNG by rewriting chunks (acTL / fcTL / fdAT).
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

interface Chunk {
  type: string;
  data: Uint8Array;
}

function readChunks(png: Uint8Array): Chunk[] {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const chunks: Chunk[] = [];
  let pos = 8;
  while (pos < png.length) {
    const length = view.getUint32(pos);
    const type = String.fromCharCode(...png.subarray(pos + 4, pos + 8));
    chunks.push({ type, data: png.subarray(pos + 8, pos + 8 + length) });
    pos += 12 + length;
  }
  return chunks;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

const u32 = (...values: number[]) => {
  const out = new Uint8Array(values.length * 4);
  const view = new DataView(out.buffer);
  values.forEach((v, i) => view.setUint32(i * 4, v));
  return out;
};

const concat = (parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
};

/** Combine same-sized PNG files (as bytes) into one looping APNG. */
export function assembleApng(pngs: Uint8Array[], delayMs: number): Uint8Array {
  const first = readChunks(pngs[0]);
  const ihdr = first.find((c) => c.type === "IHDR")!;
  const view = new DataView(ihdr.data.buffer, ihdr.data.byteOffset, ihdr.data.byteLength);
  const width = view.getUint32(0);
  const height = view.getUint32(4);

  const out: Uint8Array[] = [Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr.data), chunk("acTL", u32(pngs.length, 0))];
  let seq = 0;
  const control = () => {
    const d = new Uint8Array(26);
    const v = new DataView(d.buffer);
    v.setUint32(0, seq++);
    v.setUint32(4, width);
    v.setUint32(8, height);
    v.setUint32(12, 0);
    v.setUint32(16, 0);
    v.setUint16(20, Math.max(1, Math.round(delayMs)));
    v.setUint16(22, 1000);
    d[24] = 0; // dispose: none
    d[25] = 0; // blend: source (each frame replaces the canvas)
    return chunk("fcTL", d);
  };

  pngs.forEach((png, i) => {
    const idat = readChunks(png).filter((c) => c.type === "IDAT");
    out.push(control());
    if (i === 0) {
      for (const c of idat) out.push(chunk("IDAT", c.data));
    } else {
      for (const c of idat) out.push(chunk("fdAT", concat([u32(seq++), c.data])));
    }
  });
  out.push(chunk("IEND", new Uint8Array(0)));
  return concat(out);
}
