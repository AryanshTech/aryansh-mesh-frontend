import { Navigate, useParams, useSearchParams } from 'react-router-dom';

/** Legacy project social URL → workspace Calendar tab. */
export default function SocialCalendarPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const next = new URLSearchParams();
  next.set('tab', 'calendar');
  const platform = searchParams.get('platform');
  if (platform) next.set('platform', platform);
  if (searchParams.get('compose') === '1') {
    next.set('compose', '1');
    const topic = searchParams.get('topic');
    const brief = searchParams.get('brief');
    if (topic) next.set('topic', topic);
    if (brief) next.set('brief', brief);
    if (platform) next.set('platform', platform);
  }
  // Keep project deep-links working by landing on marketing workspace.
  void projectId;
  return <Navigate to={`/marketing?${next.toString()}`} replace />;
}
