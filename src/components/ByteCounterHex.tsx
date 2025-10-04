import * as React from "react";
import { cleanHex } from "@/utils/encoding";

type Props = { value: string; expectedBytes?: number; className?: string };

export function ByteCounterHex({ value, expectedBytes, className }: Props) {
  const h = cleanHex(value);
  const isHex = /^[0-9a-f]*$/i.test(h);
  const even  = h.length % 2 === 0;
  const bytes = Math.floor(h.length / 2);

  let color = "text-slate-400";
  if (!isHex || !even) color = "text-rose-600";
  else if (expectedBytes != null && bytes === expectedBytes) color = "text-emerald-600";
  else if (expectedBytes != null && bytes !== expectedBytes) color = "text-amber-600";

  const title =
    `digits:${h.length} bytes:${bytes}` +
    (expectedBytes != null ? ` expected:${expectedBytes}` : "") +
    (!isHex ? " (non-hex!)" : "") +
    (!even ? " (odd digits!)" : "");

  return (
    <span
      className={`pointer-events-none absolute right-2 top-2 text-[11px] ${color} ${className ?? ""}`}
      title={title}
    >
      {bytes} B
    </span>
  );
}
