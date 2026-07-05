import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/design-system/lib/utils"
import { typographyClasses } from "@/design-system/tokens/typography"
import { OverlayPortalTarget } from "@/shared/components/OverlayPortalTarget"
import {
  isSelectPopoverTarget,
  shouldBlockRadixDismiss,
  RADIX_OPEN_GUARD_MS,
} from "@/shared/hooks/radix-dismiss-guard"

function isFormDialogTriggerTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return Boolean(el?.closest("[data-form-dialog-trigger]"))
}

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 dialog-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * Context that carries an external stamp ref from FormDialog down to DialogContent.
 * FormDialog stamps onMouseDown (capture phase, before Radix mounts the overlay).
 * DialogContent reads this stamp so its onPointerDownOutside/onInteractOutside
 * guards fire with the correct timestamp instead of the stale mount-time stamp.
 */
const DialogOpenStampContext = React.createContext<React.RefObject<number> | null>(null)

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, onPointerDownOutside, onInteractOutside, onFocusOutside, ...props }, ref) => {
  const mountStampRef = React.useRef(0)
  const externalStampRef = React.useContext(DialogOpenStampContext)

  React.useLayoutEffect(() => {
    mountStampRef.current = performance.now()
  }, [])

  const getEffectiveStamp = () =>
    Math.max(mountStampRef.current, externalStampRef?.current ?? 0)

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-floating duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-card",
          className
        )}
        onPointerDownOutside={(e) => {
          if (isFormDialogTriggerTarget(e.target)) {
            e.preventDefault()
            onPointerDownOutside?.(e)
            return
          }
          if (shouldBlockRadixDismiss(getEffectiveStamp())) {
            e.preventDefault()
          }
          onPointerDownOutside?.(e)
        }}
        onInteractOutside={(e) => {
          if (isSelectPopoverTarget(e.target)) {
            e.preventDefault()
            onInteractOutside?.(e)
            return
          }
          if (isFormDialogTriggerTarget(e.target)) {
            e.preventDefault()
            onInteractOutside?.(e)
            return
          }
          if (shouldBlockRadixDismiss(getEffectiveStamp())) {
            e.preventDefault()
          }
          onInteractOutside?.(e)
        }}
        onFocusOutside={(e) => {
          if (isSelectPopoverTarget(e.target)) {
            e.preventDefault()
            onFocusOutside?.(e)
            return
          }
          if (isFormDialogTriggerTarget(e.target)) {
            e.preventDefault()
            onFocusOutside?.(e)
            return
          }
          if (shouldBlockRadixDismiss(getEffectiveStamp())) {
            e.preventDefault()
          }
          onFocusOutside?.(e)
        }}
        {...props}
      >
        <OverlayPortalTarget className="contents">
          {children}
        </OverlayPortalTarget>
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

/** Wrap Dialog onOpenChange to ignore spurious close during open guard window. */
function useGuardedDialogOpenChange(
  open: boolean,
  onOpenChange?: (open: boolean) => void,
  externalStampRef?: React.RefObject<number>,
) {
  const openedAtRef = React.useRef(0)
  const wasOpenRef = React.useRef(false)

  if (open && !wasOpenRef.current) {
    openedAtRef.current = performance.now()
  }
  wasOpenRef.current = open

  React.useLayoutEffect(() => {
    if (open) {
      openedAtRef.current = performance.now()
    }
  }, [open])

  return React.useCallback(
    (next: boolean) => {
      if (next) {
        openedAtRef.current = performance.now()
        if (externalStampRef) {
          externalStampRef.current = Math.max(
            externalStampRef.current,
            openedAtRef.current,
          )
        }
      }
      onOpenChange?.(next)
    },
    [onOpenChange, externalStampRef],
  )
}

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      typographyClasses.cardTitle,
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(typographyClasses.bodySm, "text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogOpenStampContext,
  useGuardedDialogOpenChange,
  RADIX_OPEN_GUARD_MS,
}
