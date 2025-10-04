// src/utils/aes.ts
import * as CryptoJS from "crypto-js";

export type Padding = "None" | "PKCS7";
export type Mode = "CBC" | "ECB";

// aes.ts の先頭あたりに追加
type CipherOptions = {
  mode: any;
  padding: any;
  iv?: any;
};


// ---- helpers: Uint8Array ⇄ CryptoJS.WordArray（hex経由なしで高速）
function u8ToWordArray(u8: Uint8Array): CryptoJS.lib.WordArray {
  const words: number[] = [];
  for (let i = 0; i < u8.length; i++) {
    words[i >>> 2] = (words[i >>> 2] || 0) | (u8[i] << (24 - (i % 4) * 8));
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}

function wordArrayToU8(wa: CryptoJS.lib.WordArray): Uint8Array {
  const { words, sigBytes } = wa;
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return u8;
}

function assertKeyLen(key: Uint8Array) {
  // 必要なら 24B(192-bit) も許可可
  if (key.length !== 16 && key.length !== 32) {
    throw new Error("Key must be 16 or 32 bytes (AES-128/256)");
  }
}

function assertIvCBC(mode: Mode, iv?: Uint8Array | null) {
  if (mode === "CBC") {
    if (!iv || iv.length !== 16) throw new Error("IV must be 16 bytes for CBC");
  }
}

const padMap = {
  PKCS7: CryptoJS.pad.Pkcs7,
  None: CryptoJS.pad.NoPadding,
} as const;

const modeMap = {
  CBC: CryptoJS.mode.CBC,
  ECB: CryptoJS.mode.ECB,
} as const;

// ---- 汎用 API
export function aesEncrypt(params: {
  mode: Mode;
  padding: Padding;
  key: Uint8Array;
  iv?: Uint8Array | null;      // CBCのみ必須
  plain: Uint8Array;           // 平文（hex→Uint8Arrayにして渡す）
}): Uint8Array {
  const { mode, padding, key, iv, plain } = params;
  assertKeyLen(key);
  assertIvCBC(mode, iv);
  if (padding === "None" && plain.length % 16 !== 0) {
    throw new Error("plain length must be multiple of 16 when padding=None");
  }

  const wData = u8ToWordArray(plain);
  const wKey  = u8ToWordArray(key);

  const opts: CipherOptions = {
    mode: modeMap[mode],
    padding: padMap[padding],
    ...(mode === "CBC" ? { iv: u8ToWordArray(iv!) } : {}),
  };

  const enc = CryptoJS.AES.encrypt(wData, wKey, opts);
  return wordArrayToU8(enc.ciphertext);
}

export function aesDecrypt(params: {
  mode: Mode;
  padding: Padding;
  key: Uint8Array;
  iv?: Uint8Array | null;      // CBCのみ必須
  ct: Uint8Array;              // 暗号文
}): Uint8Array {
  const { mode, padding, key, iv, ct } = params;
  assertKeyLen(key);
  assertIvCBC(mode, iv);

  const wCt  = u8ToWordArray(ct);
  const wKey = u8ToWordArray(key);

  const opts: CipherOptions = {
    mode: modeMap[mode],
    padding: padMap[padding],
    ...(mode === "CBC" ? { iv: u8ToWordArray(iv!) } : {}),
  };

  const dec = CryptoJS.AES.decrypt({ ciphertext: wCt } as any, wKey, opts);
  return wordArrayToU8(dec);
}

// ---- 互換用の薄いラッパ（既存呼び出し置換を楽に）
export const aesCbcEncrypt = (plain: Uint8Array, key: Uint8Array, iv: Uint8Array, padding: Padding) =>
  aesEncrypt({ mode: "CBC", padding, key, iv, plain });

export const aesCbcDecrypt = (ct: Uint8Array, key: Uint8Array, iv: Uint8Array, padding: Padding) =>
  aesDecrypt({ mode: "CBC", padding, key, iv, ct });

export const aesEcbEncrypt = (plain: Uint8Array, key: Uint8Array, padding: Padding) =>
  aesEncrypt({ mode: "ECB", padding, key, plain });

export const aesEcbDecrypt = (ct: Uint8Array, key: Uint8Array, padding: Padding) =>
  aesDecrypt({ mode: "ECB", padding, key, ct });
