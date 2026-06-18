import { formatDateTime, t } from '@/core/i18n';
import type { FeedEventResponse } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Card, CardContent } from '@/design-system/components/ui/card';

interface FeedTimelineProps {
  events: FeedEventResponse[];
}

export function FeedTimeline({ events }: FeedTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t('studio.feed.empty')}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li key={`${event.type}-${event.entityId}-${event.occurredAt}`}>
          <Card className="py-4">
            <CardContent className="flex flex-col gap-2 px-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {t(`studio.feedEventTypes.${event.type}`)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(event.occurredAt)}
                </span>
              </div>
              <p className="font-medium">{event.title}</p>
              {event.summary && (
                <p className="text-sm text-muted-foreground">{event.summary}</p>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
