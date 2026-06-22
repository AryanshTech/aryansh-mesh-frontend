import { platformColors } from '@/design-system/tokens/platformColors';
import { formatDateTime, safeT, t } from '@/core/i18n';
import type { SocialPlatform, StyleReferenceResponse } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { cn } from '@/design-system/lib/utils';

interface StyleReferenceCardProps {
  reference: StyleReferenceResponse;
  onAnalyze?: (id: string) => void;
  onUseForPost?: (reference: StyleReferenceResponse) => void;
  analyzing?: boolean;
  disabled?: boolean;
}

export function StyleReferenceCard({
  reference,
  onAnalyze,
  onUseForPost,
  analyzing = false,
  disabled = false,
}: StyleReferenceCardProps) {
  const platformColor = platformColors[reference.platform];

  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium">
            {reference.displayName || reference.sourceUrl}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(platformColor && 'border-transparent')}
            style={
              platformColor
                ? { backgroundColor: `${platformColor}22`, color: platformColor }
                : undefined
            }
          >
            {safeT(`studio.platforms.${reference.platform}`, reference.platform)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        <a
          href={reference.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-xs text-primary hover:underline"
        >
          {reference.sourceUrl}
        </a>
        {reference.notesMarkdown && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {reference.notesMarkdown}
          </p>
        )}
        {reference.analyzedStyleMarkdown && (
          <p className="line-clamp-3 text-xs text-muted-foreground">
            {reference.analyzedStyleMarkdown}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">
            {safeT(`studio.analyzeStatus.${reference.analyzeStatus}`, reference.analyzeStatus)}
          </Badge>
          {reference.formatTags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-4 pt-0">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDateTime(reference.updatedAt)}
          </span>
          {onAnalyze && reference.analyzeStatus !== 'COMPLETE' && (
            <Button
              size="sm"
              variant="outline"
              disabled={disabled || analyzing || reference.analyzeStatus === 'PENDING'}
              onClick={() => onAnalyze(reference.id)}
            >
              {analyzing ? t('studio.styles.analyzing') : t('studio.styles.analyze')}
            </Button>
          )}
          {onUseForPost && reference.analyzeStatus === 'COMPLETE' && (
            <Button
              size="sm"
              variant="secondary"
              disabled={disabled}
              onClick={() => onUseForPost(reference)}
            >
              {t('studio.captures.useForPost')}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export const STUDIO_PLATFORMS: SocialPlatform[] = [
  'INSTAGRAM',
  'TIKTOK',
  'LINKEDIN',
  'PRODUCT_HUNT',
  'X',
  'YOUTUBE',
];
