import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { cn } from '@/design-system/lib/utils';
import { typographyClasses } from '@/design-system/tokens/typography';

type LinearPaginationProps = {
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  summaryLabel: string;
  className?: string;
};

export function LinearPagination({
  from,
  to,
  total,
  page,
  pageCount,
  onPageChange,
  summaryLabel,
  className,
}: LinearPaginationProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <p className={cn(typographyClasses.caption, 'text-muted-foreground')}>{summaryLabel}</p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            type="button"
            variant={p === page ? 'default' : 'outline'}
            size="icon"
            className="size-8"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
