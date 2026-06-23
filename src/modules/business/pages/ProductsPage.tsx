import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Package, Search } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { ViewToggle } from '@/shared/components/ViewToggle';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CardGridSkeleton, ListSkeleton } from '@/shared/components/Skeletons';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import { useViewMode } from '@/shared/hooks/use-view-mode';
import { useDebounce } from '@/shared/hooks/use-debounce';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type ProductFilters,
} from '@/modules/business/api/hooks/use-products';
import type {
  ProductView as Product,
  ProductInput,
  ProductStatus,
} from '@/modules/business/types/entities';
import { cn } from '@/design-system/lib/utils';

type ProductDraft = Omit<ProductInput, 'price' | 'currency'> & {
  priceDisplay: string;
  currency: string;
};

const NEW_DRAFT: ProductDraft = {
  name: '',
  description: '',
  sku: '',
  priceDisplay: '',
  currency: 'CAD',
  status: 'DRAFT',
  category: '',
};

function statusTone(status: ProductStatus) {
  if (status === 'PUBLISHED') return 'success' as const;
  if (status === 'DRAFT') return 'default' as const;
  return 'warning' as const;
}

function toDraft(p: Product): ProductDraft {
  return {
    name: p.name,
    description: p.description ?? '',
    sku: p.sku ?? '',
    priceDisplay: p.price.toFixed(2),
    currency: p.currency,
    status: p.status,
    category: p.category ?? '',
  };
}

function fromDraft(d: ProductDraft): ProductInput {
  const price = parseFloat(d.priceDisplay || '0') || 0;
  return {
    name: d.name.trim(),
    description: d.description?.trim() || undefined,
    sku: d.sku?.trim() || undefined,
    price,
    currency: d.currency,
    status: d.status,
    category: d.category?.trim() || undefined,
  };
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const [view, setView] = useViewMode('products', 'card');
  const [filters, setFilters] = useState<ProductFilters>({ status: 'ALL' });
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 250);

  const queryFilters: ProductFilters = useMemo(
    () => ({ ...filters, search: debounced || undefined }),
    [filters, debounced],
  );

  const { data, isLoading, isError, refetch } = useProducts(queryFilters);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [selected, setSelected] = useState<Product | null>(null);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [isNew, setIsNew] = useState(false);

  const products = data?.items ?? [];

  const openNew = () => {
    setSelected(null);
    setIsNew(true);
    setDraft({ ...NEW_DRAFT });
  };

  const openProduct = (p: Product) => {
    setSelected(p);
    setIsNew(false);
    setDraft(toDraft(p));
  };

  const closeDrawer = () => {
    setSelected(null);
    setDraft(null);
    setIsNew(false);
  };

  const onSave = async () => {
    if (!draft) return;
    const input = fromDraft(draft);
    if (!input.name) {
      toast.error(t('products.errorNameRequired'));
      return;
    }
    try {
      if (isNew) {
        await createMutation.mutateAsync(input);
        toast.success(t('products.created'));
      } else if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, input });
        toast.success(t('products.updated'));
      }
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('products.saveFailed'));
    }
  };

  const onDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast.success(t('products.deleted'));
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('products.deleteFailed'));
    }
  };

  const drawerOpen = !!draft;

  const masterContent = (
    <div className="flex flex-col gap-4">
      <FilterBar
        search={search}
        onSearch={setSearch}
        status={filters.status ?? 'ALL'}
        onStatus={(s) => setFilters((f) => ({ ...f, status: s }))}
        resultCount={products.length}
      />

      {isLoading ? (
        view === 'card' ? <CardGridSkeleton /> : <ListSkeleton />
      ) : isError ? (
        <ErrorState
          title={t('products.errorTitle')}
          onRetry={() => void refetch()}
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title={t('products.emptyTitle')}
          description={t('products.emptyDescription')}
          action={
            <Button onClick={openNew}>
              <Plus className="size-4" />
              {t('products.addProduct')}
            </Button>
          }
        />
      ) : view === 'card' ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => openProduct(p)}
              selected={selected?.id === p.id}
            />
          ))}
        </div>
      ) : (
        <ProductList
          products={products}
          selected={selected?.id}
          onSelect={openProduct}
        />
      )}
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={t('products.title')}
        description={t('products.subtitle')}
        toggle={<ViewToggle mode={view} onChange={setView} />}
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            {t('products.addProduct')}
          </Button>
        }
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={(o) => (o ? null : closeDrawer())}
        title={isNew ? t('products.newProduct') : selected?.name ?? ''}
        description={
          isNew ? t('products.newProductSubtitle') : selected?.sku ?? undefined
        }
        master={masterContent}
        footer={
          <div className="flex items-center justify-between gap-2">
            {!isNew && selected ? (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => void onDelete()}
                disabled={deleteMutation.isPending}
              >
                {t('common.delete')}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={closeDrawer}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => void onSave()}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? t('common.loading')
                  : t('common.save')}
              </Button>
            </div>
          </div>
        }
      >
        {draft ? <ProductForm draft={draft} onChange={setDraft} /> : null}
      </DetailDrawer>
    </PageShell>
  );
}

function FilterBar({
  search,
  onSearch,
  status,
  onStatus,
  resultCount,
}: {
  search: string;
  onSearch: (s: string) => void;
  status: NonNullable<ProductFilters['status']>;
  onStatus: (s: NonNullable<ProductFilters['status']>) => void;
  resultCount: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="pl-8 h-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => onStatus(v as never)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('products.statusAll')}</SelectItem>
            <SelectItem value="PUBLISHED">{t('products.statusPublished')}</SelectItem>
            <SelectItem value="DRAFT">{t('products.statusDraft')}</SelectItem>
            <SelectItem value="ARCHIVED">{t('products.statusArchived')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">
        {t('products.resultCount', { count: resultCount })}
      </p>
    </div>
  );
}

function ProductCard({
  product,
  onClick,
  selected,
}: {
  product: Product;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-col gap-3 rounded-xl border bg-card p-3 text-left transition-all duration-150',
        'hover:border-hairline-strong hover:shadow-card',
        selected ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid size-full place-items-center text-faint">
            <Package className="size-6" />
          </div>
        )}
        <span className="absolute top-2 left-2">
          <StatusBadge label={product.status} tone={statusTone(product.status)} />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="typo-card-title text-foreground truncate">{product.name}</p>
        <p className="typo-body-sm text-muted-foreground tabular-nums">
          {product.currency} {product.price.toFixed(2)}
        </p>
      </div>
    </button>
  );
}

function ProductList({
  products,
  selected,
  onSelect,
}: {
  products: Product[];
  selected?: string;
  onSelect: (p: Product) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30 text-left">
          <tr>
            <th className="px-4 py-2.5 w-12" />
            <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
              Name
            </th>
            <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
              SKU
            </th>
            <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium text-right">
              Price
            </th>
            <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr
              key={p.id}
              onClick={() => onSelect(p)}
              className={cn(
                'cursor-pointer border-b border-border last:border-b-0 transition-colors',
                selected === p.id ? 'bg-primary/5' : 'hover:bg-muted/30',
              )}
            >
              <td className="px-4 py-2.5">
                <div className="size-8 rounded-md bg-muted overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-faint">
                      <Package className="size-3.5" />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex flex-col">
                  <span className="text-foreground font-medium">{p.name}</span>
                  {p.category ? (
                    <span className="text-xs text-muted-foreground">{p.category}</span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                {p.sku ?? '—'}
              </td>
              <td className="px-4 py-2.5 text-right text-foreground tabular-nums">
                {p.currency} {p.price.toFixed(2)}
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge label={p.status} tone={statusTone(p.status)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductForm({
  draft,
  onChange,
}: {
  draft: ProductDraft;
  onChange: (next: ProductDraft) => void;
}) {
  const { t } = useTranslation();
  const update = (patch: Partial<ProductDraft>) => onChange({ ...draft, ...patch });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-name">{t('products.fieldName')}</Label>
        <Input
          id="p-name"
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-desc">{t('products.fieldDescription')}</Label>
        <Textarea
          id="p-desc"
          value={draft.description ?? ''}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-sku">{t('products.fieldSku')}</Label>
          <Input
            id="p-sku"
            value={draft.sku ?? ''}
            onChange={(e) => update({ sku: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-category">{t('products.fieldCategory')}</Label>
          <Input
            id="p-category"
            value={draft.category ?? ''}
            onChange={(e) => update({ category: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_100px] gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-price">{t('products.fieldPrice')}</Label>
          <Input
            id="p-price"
            inputMode="decimal"
            value={draft.priceDisplay}
            onChange={(e) => update({ priceDisplay: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-currency">{t('products.fieldCurrency')}</Label>
          <Input
            id="p-currency"
            value={draft.currency}
            onChange={(e) => update({ currency: e.target.value.toUpperCase() })}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>{t('products.fieldStatus')}</Label>
        <Select
          value={draft.status}
          onValueChange={(v) => update({ status: v as ProductStatus })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">{t('products.statusDraft')}</SelectItem>
            <SelectItem value="PUBLISHED">{t('products.statusPublished')}</SelectItem>
            <SelectItem value="ARCHIVED">{t('products.statusArchived')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
