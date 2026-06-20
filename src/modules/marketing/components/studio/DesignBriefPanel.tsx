import { useEffect, useState } from 'react';
import { t } from '@/core/i18n';
import type { MarketingStyleProfileResponse } from '@/modules/marketing/types/api';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/design-system/components/ui/field';
import { Input } from '@/design-system/components/ui/input';
import { Textarea } from '@/design-system/components/ui/textarea';

interface DesignBriefPanelProps {
  profile: MarketingStyleProfileResponse | null;
  onSave: (data: {
    industry?: string;
    tone?: string;
    contentPillars?: string[];
    briefMarkdown: string;
  }) => void;
  saving?: boolean;
  disabled?: boolean;
}

export function DesignBriefPanel({
  profile,
  onSave,
  saving = false,
  disabled = false,
}: DesignBriefPanelProps) {
  const [industry, setIndustry] = useState('');
  const [tone, setTone] = useState('');
  const [pillars, setPillars] = useState('');
  const [briefMarkdown, setBriefMarkdown] = useState('');

  useEffect(() => {
    setIndustry(profile?.industry ?? '');
    setTone(profile?.tone ?? '');
    setPillars(profile?.contentPillars?.join(', ') ?? '');
    setBriefMarkdown(profile?.briefMarkdown ?? '');
  }, [profile]);

  const handleSave = () => {
    const contentPillars = pillars
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    onSave({
      industry: industry || undefined,
      tone: tone || undefined,
      contentPillars: contentPillars.length > 0 ? contentPillars : undefined,
      briefMarkdown,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('studio.styles.briefTitle')}</CardTitle>
        <CardDescription>{t('studio.styles.briefDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>{t('studio.styles.industry')}</FieldLabel>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={disabled}
              placeholder={t('studio.styles.industryPlaceholder')}
            />
          </Field>
          <Field>
            <FieldLabel>{t('studio.styles.tone')}</FieldLabel>
            <Input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={disabled}
              placeholder={t('studio.styles.tonePlaceholder')}
            />
          </Field>
          <Field>
            <FieldLabel>{t('studio.styles.pillars')}</FieldLabel>
            <Input
              value={pillars}
              onChange={(e) => setPillars(e.target.value)}
              disabled={disabled}
              placeholder={t('studio.styles.pillarsPlaceholder')}
            />
          </Field>
          <Field>
            <FieldLabel>{t('studio.styles.briefMarkdown')}</FieldLabel>
            <Textarea
              value={briefMarkdown}
              onChange={(e) => setBriefMarkdown(e.target.value)}
              disabled={disabled}
              rows={8}
              placeholder={t('studio.styles.briefPlaceholder')}
            />
          </Field>
        </FieldGroup>

        <Button
          className="mt-4"
          disabled={disabled || saving || !briefMarkdown.trim()}
          onClick={handleSave}
        >
          {saving ? t('common.loading') : t('studio.styles.saveBrief')}
        </Button>
      </CardContent>
    </Card>
  );
}
