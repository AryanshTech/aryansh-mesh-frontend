import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

interface CopyCodeBlockProps {
  label: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
  minHeight?: string;
}

export function CopyCodeBlock({
  label,
  value,
  copyLabel,
  copiedLabel,
  minHeight = 'min-h-[120px]',
}: CopyCodeBlockProps) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(copiedLabel);
    } catch {
      toast.error(copyLabel);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label className={typographyClasses.button}>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
          <Copy className="size-4" />
          {copyLabel}
        </Button>
      </div>
      <Textarea
        readOnly
        value={value}
        className={cn('resize-y', typographyClasses.mono, minHeight)}
      />
    </div>
  );
}
