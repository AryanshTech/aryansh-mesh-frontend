import { useMemo, useState } from 'react';
import { GripVertical, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensors,
  useSensor,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/design-system/lib/utils';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/design-system/components/ui/dropdown-menu';

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface KanbanItem {
  id: string;
  columnId: string;
  title: string;
  subtitle?: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onMove: (itemId: string, toColumnId: string) => void;
  disabled?: boolean;
}

function KanbanCard({
  item,
  columns,
  isDragging,
  onMove,
  disabled,
}: {
  item: KanbanItem;
  columns: KanbanColumn[];
  isDragging?: boolean;
  onMove: (itemId: string, toColumnId: string) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id, data: { columnId: item.columnId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const moveTargets = columns.filter((column) => column.id !== item.columnId);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'px-2 py-2 shadow-whisper',
        (isDragging || isSortableDragging) && 'opacity-50',
      )}
    >
      <div className="flex items-start gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'mt-0.5 size-7 shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing',
            disabled && 'pointer-events-none opacity-40',
          )}
          aria-label={t('kanban.dragHandle')}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          {item.subtitle ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.subtitle}</p>
          ) : null}
        </div>
        {moveTargets.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground"
                disabled={disabled}
                aria-label={t('kanban.moveMenu')}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t('kanban.moveMenu')}</DropdownMenuLabel>
              {moveTargets.map((column) => (
                <DropdownMenuItem
                  key={column.id}
                  onClick={() => onMove(item.id, column.id)}
                >
                  {t('kanban.moveTo', { column: column.title })}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </Card>
  );
}

function KanbanColumnPanel({
  column,
  items,
  columns,
  onMove,
  disabled,
}: {
  column: KanbanColumn;
  items: KanbanItem[];
  columns: KanbanColumn[];
  onMove: (itemId: string, toColumnId: string) => void;
  disabled?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex min-w-[260px] flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      <Card
        ref={setNodeRef}
        className={cn(
          'flex min-h-[120px] flex-1 flex-col gap-2 border-dashed bg-muted/50 p-2 shadow-none transition-colors',
          isOver && 'border-primary/40 bg-primary/5',
        )}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              columns={columns}
              onMove={onMove}
              disabled={disabled}
            />
          ))}
        </SortableContext>
      </Card>
    </div>
  );
}

export function KanbanBoard({
  columns,
  items,
  onMove,
  disabled = false,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const itemsByColumn = useMemo(() => {
    const map = new Map<string, KanbanItem[]>();
    for (const column of columns) {
      map.set(column.id, []);
    }
    for (const item of items) {
      const list = map.get(item.columnId);
      if (list) {
        list.push(item);
      }
    }
    return map;
  }, [columns, items]);

  const activeItem = activeId ? items.find((item) => item.id === activeId) : undefined;

  const handleDragStart = (event: DragStartEvent) => {
    if (disabled) return;
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (disabled) return;

    const { active, over } = event;
    if (!over) return;

    const itemId = String(active.id);
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const overId = String(over.id);
    const targetColumnId = columns.some((c) => c.id === overId)
      ? overId
      : items.find((i) => i.id === overId)?.columnId;

    if (targetColumnId && targetColumnId !== item.columnId) {
      onMove(itemId, targetColumnId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-w-0 gap-4 overflow-x-auto pb-2">
        {columns.map((column) => (
          <KanbanColumnPanel
            key={column.id}
            column={column}
            items={itemsByColumn.get(column.id) ?? []}
            columns={columns}
            onMove={onMove}
            disabled={disabled}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <KanbanCard
            item={activeItem}
            columns={columns}
            isDragging
            onMove={onMove}
            disabled={disabled}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
