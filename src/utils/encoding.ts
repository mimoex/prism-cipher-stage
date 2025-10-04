// 16進ユーティリティ（空白や0x, 改行を許容）
export function cleanHex(s: string): string {
  return s.trim().replace(/^0x/i, "").replace(/\s+/g, "").toLowerCase();
}

export function toHex(buf: ArrayBuffer | Uint8Array): string {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return [...u8].map(b => b.toString(16).padStart(2, "0")).join("");
}

export function fromHex(hex: string): Uint8Array {
  const h = cleanHex(hex);
  if (h.length % 2 !== 0) throw new Error("hex length must be even");
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i*2, i*2+2), 16);
  return out;
}
