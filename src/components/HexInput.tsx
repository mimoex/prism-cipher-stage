import * as React from "react";
import { ByteCounterHex } from "./ByteCounterHex";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  expectedBytes?: number;
  value: string; // 必須にして誤用を防止
};

export const HexInput = React.forwardRef<HTMLInputElement, Props>(
  ({ expectedBytes, value, className, ...props }, ref) => (
    <div className="relative w-full">
      <input
        ref={ref}
        value={value}
        {...props}
        className={cn(
          "w-full border rounded px-3 py-2 font-mono text-sm pr-16",
          className
        )}
      />
      <ByteCounterHex value={value} expectedBytes={expectedBytes} />
    </div>
  )
);
HexInput.displayName = "HexInput";
