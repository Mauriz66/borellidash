import * as React from "react";

import { cn } from "@/lib/utils";

type NativeTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export type TextareaProps = NativeTextareaProps;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[96px] w-full rounded-xl border border-input/60 bg-background/80 px-3.5 py-2.5 text-sm ring-offset-background shadow-xs transition-all duration-200 ease-out placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-2 focus:bg-background disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export default Textarea;
