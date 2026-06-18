import { useEffect, useState } from 'react';
import { projectsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { t } from '@/core/i18n';
import { Button } from '@/design-system/components/ui/button';
import { Textarea } from '@/design-system/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/design-system/components/ui/sheet';
import { Spinner } from '@/design-system/components/ui/spinner';

interface BriefEditorProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export function BriefEditor({ projectId, open, onClose }: BriefEditorProps) {
  const { getToken } = useAuth();
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void apiFetchWithRetry(
      (token) => projectsApi.getBrief(token, projectId),
      getToken
    )
      .then((res) => setBrief(res.brief))
      .finally(() => setLoading(false));
  }, [open, projectId, getToken]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetchWithRetry(
        (token) => projectsApi.updateBrief(token, projectId, { brief }),
        getToken
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t('workspace.briefTitle')}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-6" />
            </div>
          ) : (
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={t('workspace.briefPlaceholder')}
              rows={16}
              maxLength={32000}
              className="flex-1 resize-none"
            />
          )}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? t('workspace.saving') : t('workspace.saveBrief')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
