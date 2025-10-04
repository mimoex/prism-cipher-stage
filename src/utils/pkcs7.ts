const BLOCK = 16;

export function pkcs7Pad(u8: Uint8Array): Uint8Array {
  const r = u8.length % BLOCK;
  const pad = r === 0 ? BLOCK : (BLOCK - r);
  const out = new Uint8Array(u8.length + pad);
  out.set(u8);
  out.fill(pad, u8.length);
  return out;
}

export function pkcs7Unpad(u8: Uint8Array): Uint8Array {
  if (u8.length === 0) throw new Error("empty");
  const pad = u8[u8.length - 1];
  if (pad === 0 || pad > BLOCK || pad > u8.length) throw new Error("bad padding");
  for (let i = u8.length - pad; i < u8.length; i++) if (u8[i] !== pad) throw new Error("bad padding");
  return u8.subarray(0, u8.length - pad);
}
