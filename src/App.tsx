import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { HexInput } from "@/components/HexInput";
import { HexTextarea } from "@/components/HexTextarea";
import { fromHex, toHex } from "@/utils/encoding";
import { aesCbcEncrypt, aesCbcDecrypt, aesEcbEncrypt, aesEcbDecrypt, type Padding } from "@/crypto/aes";

type Mode = "CBC" | "ECB";

export default function App() {
  const [mode, setMode] = useState<Mode>("CBC");
  const [keyBits, setKeyBits] = useState<128 | 256>(128);
  const [padding, setPadding] = useState<Padding>("None");

  const [keyHex, setKeyHex] = useState(""); // 16B or 32B
  const [ivHex, setIvHex] = useState(""); // CBCのみ 16B
  const [inputHex, setInputHex] = useState("");   // 平文 or 暗号文（Hex）
  const [outputHex, setOutputHex] = useState(""); // 出力（Hex）

  const needKeyBytes = keyBits === 128 ? 16 : 32;
  const needIvBytes = 16;

  function randomHex(bytes: number) {
    const u8 = new Uint8Array(bytes);
    crypto.getRandomValues(u8);
    return toHex(u8);
  }

  function ensureKeyIv() {
    const key = keyHex ? fromHex(keyHex) : fromHex(randomHex(needKeyBytes));
    if (key.length !== needKeyBytes) throw new Error(`Key must be ${needKeyBytes} bytes (${keyBits}-bit)`);
    let iv: Uint8Array | null = null;
    if (mode === "CBC") {
      iv = ivHex ? fromHex(ivHex) : fromHex(randomHex(needIvBytes));
      if (iv.length !== needIvBytes) throw new Error("IV must be 16 bytes for CBC");
    }
    if (!keyHex) setKeyHex(toHex(key));
    if (mode === "CBC" && !ivHex) setIvHex(toHex(iv!));
    return { key, iv };
  }

  async function encrypt() {
    try {
      const { key, iv } = ensureKeyIv();
      const plain = fromHex(inputHex);
      if (mode === "CBC") {
        const ct = aesCbcEncrypt(plain, key, iv!, padding); // (plain, key, iv, padding)
        setOutputHex(toHex(ct));
      } else {
        const ct = aesEcbEncrypt(plain, key, padding);
        setOutputHex(toHex(ct));
      }
    } catch (e: any) {
      setOutputHex(`error: ${e.message ?? String(e)}`);
    }
  }

  async function decrypt() {
    try {
      const { key, iv } = ensureKeyIv();
      const ct = fromHex(inputHex);
      if (mode === "CBC") {
        const pt = aesCbcDecrypt(ct, key, iv!, padding); // (ct, key, iv, padding)
        setOutputHex(toHex(pt));
      } else {
        const pt = aesEcbDecrypt(ct, key, padding);
        setOutputHex(toHex(pt));
      }
    } catch (e: any) {
      setOutputHex(`error: ${e.message ?? String(e)}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-950 text-slate-200 flex flex-col">
        <div className="p-4 text-lg font-bold border-b border-slate-800">Crypto Tool</div>
        <nav className="flex-1 p-3 text-sm space-y-1">
          <span className="block px-3 py-2 rounded-md bg-slate-800">AES</span>
        </nav>
        <div className="p-3 text-xs text-slate-500 border-t border-slate-800">
          CryptoJS (AES-CBC / AES-ECB)
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Card className="p-8 space-y-6 shadow-lg bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <h1 className="text-2xl font-bold">AES (Hex-only)</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CBC">CBC</SelectItem>
                <SelectItem value="ECB">ECB (compat)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={String(keyBits)} onValueChange={(v) => setKeyBits(Number(v) as 128 | 256)}>
              <SelectTrigger><SelectValue placeholder="Key size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="128">128-bit</SelectItem>
                <SelectItem value="256">256-bit</SelectItem>
              </SelectContent>
            </Select>

            <Select value={padding} onValueChange={(v) => setPadding(v as Padding)}>
              <SelectTrigger><SelectValue placeholder="Padding" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="PKCS7">PKCS7</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-xs text-slate-500">
              {mode === "ECB" ? "IV not used in ECB" : "CBC uses 16-byte IV"}
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">
              Key (hex, {needKeyBytes * 2} chars)
            </label>
            <div className="flex gap-2">
              <HexInput
                placeholder={needKeyBytes === 16 ? "32 hex chars" : "64 hex chars"}
                value={keyHex}
                onChange={(e) => setKeyHex(e.target.value)}
                expectedBytes={needKeyBytes}
              />
              <Button type="button" onClick={() => setKeyHex(randomHex(needKeyBytes))}>
                Random
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              IV (hex, 32 chars)
            </label>
            <div className="flex gap-2">
              <HexInput
                placeholder="32 hex chars"
                value={ivHex}
                onChange={(e) => setIvHex(e.target.value)}
                expectedBytes={16}
                disabled={mode === "ECB"}
              />
              <Button
                type="button"
                onClick={() => setIvHex(randomHex(16))}
                disabled={mode === "ECB"}
              >
                Random
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Input (hex)</label>
            <HexTextarea
              rows={4}
              placeholder="hex only (spaces/newlines ok)"
              value={inputHex}
              onChange={(e) => setInputHex(e.target.value)}
            // expectedBytes は任意。指定しないと色はグレー。
            />
          </div>

          <div className="flex gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={encrypt}>Encrypt</Button>
            <Button variant="secondary" className="border" onClick={decrypt}>Decrypt</Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Output (hex)</label>
            <HexTextarea
              rows={4}
              className="bg-slate-50"
              readOnly
              value={outputHex}
            />
          </div>
        </Card>
      </main>
    </div>
  );
}
