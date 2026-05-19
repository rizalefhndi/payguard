import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-[15px] font-bold whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] outline-none select-none focus-visible:border-ring focus-visible:ring-[4px] focus-visible:ring-[var(--color-sky-blue)]/50 active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-[var(--color-accent-gold)] to-[var(--color-accent-dark)] text-[#2C3E50] shadow-[var(--shadow-accent-glow)] tracking-[2px] uppercase overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/40 before:to-transparent hover:opacity-90 active:opacity-90",
        outline:
          "border-[1.5px] border-[var(--color-primary)] bg-white text-[var(--color-primary)] shadow-[var(--shadow-teal-glow)] hover:bg-[var(--color-primary-bg)] active:scale-96",
        secondary:
          "bg-white text-[var(--color-primary)] shadow-[var(--shadow-card)] hover:bg-[var(--color-primary-bg)]",
        ghost:
          "hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary)]",
        destructive:
          "bg-[var(--color-coral)] text-white shadow-[var(--shadow-coral-glow)] hover:opacity-90",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-12 gap-2 px-6",
        sm: "h-10 gap-1.5 px-4 text-sm",
        lg: "h-14 gap-2.5 px-8 text-lg",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
