import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/design-system/lib/utils"
import { typographyClasses, mutedBodySm } from "@/design-system/tokens/typography"

const cardVariants = cva(
  "rounded-card border border-border bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-whisper",
        floating: "shadow-floating",
        interactive: "cursor-pointer shadow-whisper transition-colors hover:bg-muted/50",
      },
      size: {
        default: "",
        dense: "",
      },
    },
    defaultVariants: {
      variant: "elevated",
      size: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { dense?: boolean }
>(({ className, dense, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-2 pb-4 pt-5",
      dense ? "px-5" : "px-7 pt-7",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(typographyClasses.cardTitle, className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(mutedBodySm, className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { dense?: boolean }
>(({ className, dense, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("pt-0", dense ? "px-5 pb-5" : "px-7 pb-7", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
