import * as React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/design-system/lib/utils';
import { Input } from '@/design-system/components/ui/input';

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<'input'>, 'type'>
>(({ className, ...props }, ref) => {
  const { t } = useTranslation();
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        className={cn('pr-11', className)}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
      >
        {visible ? <EyeOffIcon className="size-4" aria-hidden /> : <EyeIcon className="size-4" aria-hidden />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
