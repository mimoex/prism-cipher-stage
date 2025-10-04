# prism-cipher-stage ✨

A sparkly, **browser-only cryptography workbench**.  
Today it ships **AES-ECB / AES-CBC** with **PKCS7/None** padding, **128/256-bit** keys, and **hex-only** I/O.  
Next acts on the stage: **RSA-OAEP**, **RSASSA-PSS**, and **ECDSA**.

## Features

- **100% client-side** — All operations run locally in your browser. No servers, no telemetry.
- **Hex-first UX** — Inputs/outputs are hex only; each field shows a tiny **byte counter** in the top-right.
- **AES-ECB / AES-CBC**
  - Padding: **PKCS7** or **None**
  - Key sizes: **128 / 256 bit**
  - Random **Key/IV** generators
- **Lightweight & fast** — React + Vite + Tailwind (shadcn/ui minimal set), CryptoJS for AES.
- **Extensible** — Designed to add RSA-OAEP, RSASSA-PSS, ECDSA panels next.

## What’s in v1

- AES **Encrypt/Decrypt**
- Modes: **ECB**, **CBC**
- Hex I/O only (spaces/newlines tolerated)
- Byte counters per field
- Random Key/IV buttons
- Padding selector (**PKCS7 / None**)
- Key size selector (**128 / 256**)


## 🚀 Quick Start

```bash
npm install
npm run dev
# open http://localhost:5173
```

> This project targets modern evergreen browsers.


## How to Use

1. Choose **Mode**: `CBC` or `ECB`.
2. Pick **Key size**: `128` or `256`.
3. Choose **Padding**: `PKCS7` or `None`.
4. Enter **Key (hex)** and (for CBC) **IV (hex)** — or click **Random** to generate.
5. Paste **Input (hex)**:

   * **Encrypt**: plaintext hex → ciphertext hex.
   * **Decrypt**: ciphertext hex → plaintext hex.
6. Watch the tiny **byte badges** to confirm lengths (Key 16/32 bytes, IV 16 bytes, input multiple of 16 if `None`).


## Project Structure

```
src/
  crypto/
    aes.ts               # CryptoJS-only AES (ECB/CBC) with PKCS7/None
  components/
    HexInput.tsx         # <input> with a top-right byte counter
    HexTextarea.tsx      # <textarea> with a top-right byte counter
    ByteCounterHex.tsx   # the tiny badge component
    ui/                  # shadcn/ui primitives (button, card, select, textarea...)
  utils/
    encoding.ts          # hex <-> Uint8Array helpers
    pkcs7.ts             # pad/unpad (kept for validation & potential reuse)
  App.tsx                # main UI (mode/key/iv/padding, hex I/O)
```

## Roadmap

* [ ] **RSA-OAEP** (label, 2048/3072/4096, JWK/PEM import)
* [ ] **RSASSA-PSS** (SHA-256/384/512, configurable `saltLength`)
* [ ] **ECDSA** (P-256/P-384; DER/JOSE signature formats)
* [ ] Key import/export (PEM/SPKI/PKCS8/JWK)
* [ ] Test vectors (NIST/Wycheproof) + Vitest
* [ ] PWA (offline install)
* [ ] Clipboard and file I/O for `.bin` / `.hex`


## License

Theme code: MIT License (see [LICENSE](LICENSE))