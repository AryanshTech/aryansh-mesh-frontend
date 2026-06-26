import { toast } from 'sonner';
import type { TFunction } from 'i18next';
import type { InviteResponse } from '@/modules/business/types/invite';

export async function toastInviteResult(
  t: TFunction,
  email: string,
  result: InviteResponse,
): Promise<void> {
  if (result.emailSent) {
    toast.success(
      result.resent
        ? t('invite.resentEmail', { email })
        : t('invite.sentEmail', { email }),
    );
  } else {
    toast.success(result.resent ? t('invite.resentLink') : t('invite.sentLink'));
  }

  if (result.acceptUrl) {
    try {
      await navigator.clipboard.writeText(result.acceptUrl);
      toast.message(t('invite.linkCopied'));
    } catch {
      toast.message(t('invite.copyLinkHint'));
    }
  }
}
