import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import { FormDialog, useFormDialogOpen } from '@/shared/components/FormDialog';
import { cn } from '@/design-system/lib/utils';

interface Props {
  /** Called with trimmed feedback (may be empty). */
  onRevise: (feedback: string) => Promise<void>;
  hasContent: boolean;
  disabled?: boolean;
  busy?: boolean;
  size?: 'sm' | 'default';
  className?: string;
  /** Controlled open — e.g. open from Dislike. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Revise any AI draft: optional feedback, then regenerate incorporating it.
 */
export function ReviseWithFeedback({
  onRevise,
  hasContent,
  disabled,
  busy,
  size = 'sm',
  className,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const { t } = useTranslation();
  const { scheduleOpen, triggerProps } = useFormDialogOpen();
  const [internalOpen, setInternalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const locked = disabled || busy || submitting || !hasContent;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onRevise(feedback.trim());
      setFeedback('');
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size={size}
        variant="outline"
        className={cn(className)}
        disabled={locked}
        {...triggerProps}
        onClick={() => scheduleOpen(() => setOpen(true))}
      >
        {busy || submitting ? (
          <Loader2 className={cn(size === 'sm' ? 'size-3.5' : 'size-4', 'animate-spin')} />
        ) : (
          <RefreshCw className={size === 'sm' ? 'size-3.5' : 'size-4'} />
        )}
        {t('marketing.revise.button')}
      </Button>

      <FormDialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('marketing.revise.title')}</DialogTitle>
            <DialogDescription>{t('marketing.revise.description')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-1">
            <Label htmlFor="revise-feedback">{t('marketing.revise.feedbackLabel')}</Label>
            <Textarea
              id="revise-feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('marketing.revise.feedbackPlaceholder')}
              disabled={submitting || busy}
              className="min-h-[100px] resize-y"
            />
            <p className="typo-eyebrow text-muted-foreground">{t('marketing.revise.feedbackHint')}</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting || busy}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting || busy || !hasContent}
            >
              {submitting || busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              {t('marketing.revise.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </>
  );
}
