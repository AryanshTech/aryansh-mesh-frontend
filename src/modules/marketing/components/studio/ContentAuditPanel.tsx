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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/design-system/components/ui/field';
import { Input } from '@/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
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
    <div className="space-y-lg">
      <Card>
        <CardHeader>
          <CardTitle>{t('studio.audits.runTitle')}</CardTitle>
          <CardDescription>{t('studio.audits.runDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
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
              <Select
                value={platform}
                onValueChange={(value) => setPlatform(value as SocialPlatform)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STUDIO_PLATFORMS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {t(`studio.platforms.${item}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </CardContent>
      </Card>

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
        <div className="space-y-md">
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
          <Card className="overflow-hidden p-0">
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
          </Card>
        </div>
      )}
    </div>
  );
}
