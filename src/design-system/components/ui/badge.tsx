import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/design-system/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-muted text-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-border text-foreground",
        eyebrow: "rounded-sm border-transparent bg-transparent text-xs font-medium uppercase font-mono text-muted-foreground font-medium",
        outputGi: "border-transparent bg-primary/10 text-primary",
        outputSp: "border-transparent bg-violet/10 text-violet",
        outputLp: "border-transparent bg-pink/10 text-pink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
