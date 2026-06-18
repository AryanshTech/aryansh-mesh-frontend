import { useState } from 'react';
import { DownloadIcon, PlayIcon } from 'lucide-react';
import { t } from '@/core/i18n';
import type {
  ContentAuditResponse,
  ContentAuditRowResponse,
  SocialPlatform,
} from '@/modules/marketing/types/api';
import { STUDIO_PLATFORMS } from '@/modules/marketing/components/studio/StyleReferenceCard';
import { Button } from '@/design-system/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/design-system/components/ui/field';
import { Input } from '@/design-system/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';

interface ContentAuditPanelProps {
  audits: ContentAuditResponse[];
  rows: ContentAuditRowResponse[];
  selectedAuditId: string | null;
  onSelectAudit: (auditId: string) => void;
  onTrigger: (payload: {
    sourceUrl: string;
    platform: SocialPlatform;
    maxPages?: number;
  }) => void;
  onExport: (auditId: string) => void;
  running?: boolean;
  disabled?: boolean;
}

export function ContentAuditPanel({
  audits,
  rows,
  selectedAuditId,
  onSelectAudit,
  onTrigger,
  onExport,
  running = false,
  disabled = false,
}: ContentAuditPanelProps) {
  const [sourceUrl, setSourceUrl] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>('LINKEDIN');

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display text-lg font-semibold">
          {t('studio.audits.runTitle')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('studio.audits.runDescription')}
        </p>
        <FieldGroup className="mt-4">
          <Field>
            <FieldLabel>{t('studio.styles.sourceUrl')}</FieldLabel>
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/blog"
              disabled={disabled}
            />
          </Field>
          <Field>
            <FieldLabel>{t('studio.styles.platform')}</FieldLabel>
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              disabled={disabled}
            >
              {STUDIO_PLATFORMS.map((item) => (
                <option key={item} value={item}>
                  {t(`studio.platforms.${item}`)}
                </option>
              ))}
            </select>
          </Field>
          <Button
            disabled={disabled || running || !sourceUrl.trim()}
            onClick={() =>
              onTrigger({ sourceUrl: sourceUrl.trim(), platform, maxPages: 20 })
            }
          >
            <PlayIcon data-icon="inline-start" />
            {running ? t('studio.audits.running') : t('studio.audits.run')}
          </Button>
        </FieldGroup>
      </div>

      {audits.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {audits.map((audit) => (
            <Button
              key={audit.id}
              size="sm"
              variant={selectedAuditId === audit.id ? 'default' : 'outline'}
              onClick={() => onSelectAudit(audit.id)}
            >
              {audit.sourceUrl.replace(/^https?:\/\//, '').slice(0, 32)} · {audit.rowCount}
            </Button>
          ))}
        </div>
      )}

      {selectedAuditId && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExport(selectedAuditId)}
            >
              <DownloadIcon data-icon="inline-start" />
              {t('studio.audits.export')}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('studio.audits.columns.title')}</TableHead>
                  <TableHead>{t('studio.audits.columns.format')}</TableHead>
                  <TableHead>{t('studio.audits.columns.pillar')}</TableHead>
                  <TableHead>{t('studio.audits.columns.summary')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-[180px] truncate">
                      {row.title ?? row.hook}
                    </TableCell>
                    <TableCell>{row.formatType}</TableCell>
                    <TableCell>{row.pillar}</TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {row.contentSummary}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
