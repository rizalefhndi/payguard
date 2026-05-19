import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-[var(--radius-md)] border-[1.5px] border-[#E0E0E0] bg-[var(--color-cream)] px-4 py-2 text-center font-bold text-base transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-[var(--color-sky-blue)] focus-visible:shadow-[var(--shadow-focus)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[var(--shadow-focus)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
