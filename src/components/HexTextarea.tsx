import * as React from "react";
import { ByteCounterHex } from "./ByteCounterHex";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  expectedBytes?: number;
  value: string; // 必須
};

export const HexTextarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ expectedBytes, value, className, ...props }, ref) => (
    <div className="relative w-full">
      <Textarea
        ref={ref}
        value={value}
        {...props}
        className={cn("font-mono text-sm pr-16", className)}
      />
      <ByteCounterHex value={value} expectedBytes={expectedBytes} />
    </div>
  )
);
HexTextarea.displayName = "HexTextarea";
