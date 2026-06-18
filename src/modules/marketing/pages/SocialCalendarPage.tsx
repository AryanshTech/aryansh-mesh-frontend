import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socialPostsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { PageShell } from '@/modules/marketing/components/layout/page-shell';
import { t } from '@/core/i18n';
import type { SocialPostResponse } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Skeleton } from '@/design-system/components/ui/skeleton';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function SocialCalendarPage() {
  const { projectId = '' } = useParams();
  const { getToken } = useAuth();
  const [posts, setPosts] = useState<SocialPostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = useMemo(() => getMonday(new Date()), []);

  const weekDates = useMemo(
    () => WEEKDAYS.map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const postsByDate = useMemo(() => {
    const map: Record<string, SocialPostResponse[]> = {};
    for (const post of posts) {
      const key = post.scheduledDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(post);
    }
    return map;
  }, [posts]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiFetchWithRetry(
          (token) => socialPostsApi.list(token, projectId),
          getToken
        );
        setPosts(res);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [projectId, getToken]);

  return (
    <PageShell
      scrollable
      title={t('social.title')}
      description={t('social.subtitle')}
    >
      {loading ? (
        <div className="grid gap-4 md:grid-cols-5">
          {WEEKDAYS.map((day) => (
            <Skeleton key={day} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          {WEEKDAYS.map((day, index) => {
            const date = weekDates[index];
            const dateKey = toDateKey(date);
            const dayPosts = postsByDate[dateKey] ?? [];

            return (
              <Card key={day}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t(`social.days.${day}`)}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {date.toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayPosts.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t('social.emptyDay')}</p>
                  ) : (
                    dayPosts.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-lg border bg-secondary/50 p-2 text-xs"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px]">
                            {t(`socialPlatforms.${post.platform}`)}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {t(`socialStatus.${post.status}`)}
                          </Badge>
                        </div>
                        <p className="line-clamp-3">{post.content}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
