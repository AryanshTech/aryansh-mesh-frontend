import { useTranslation } from 'react-i18next';
import { Button } from '@/design-system/components/ui/button';
import type { LinkedInProposedRule } from '@/modules/marketing/api/use-linkedin';

interface Props {
  rules: LinkedInProposedRule[];
  onChange: (rules: LinkedInProposedRule[]) => void;
  onSave: () => void;
  saving?: boolean;
}

export function LinkedInLearnRulesCard({ rules, onChange, onSave, saving }: Props) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <h4 className="typo-card-title text-foreground">{t('marketing.linkedin.learnTitle')}</h4>
      <p className="mt-1 typo-body-sm text-muted-foreground">{t('marketing.linkedin.learnSubtitle')}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {rules.map((rule) => (
          <li key={rule.id} className="rounded-lg border border-border bg-card px-3 py-2">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={rule.enabled}
                onChange={(e) =>
                  onChange(
                    rules.map((r) =>
                      r.id === rule.id ? { ...r, enabled: e.target.checked } : r,
                    ),
                  )
                }
              />
              <span className="min-w-0">
                <span className="block typo-body-sm text-foreground">{rule.rule}</span>
                <span className="mt-0.5 block typo-eyebrow text-muted-foreground">{rule.evidence}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <Button type="button" className="mt-3" disabled={saving} onClick={onSave}>
        {t('marketing.linkedin.saveRules')}
      </Button>
    </div>
  );
}
