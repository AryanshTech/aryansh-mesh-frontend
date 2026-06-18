import { useMemo, useState } from 'react';
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
  isDragging,
}: {
  item: KanbanItem;
  isDragging?: boolean;
}) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab rounded-lg border border-border bg-card px-3 py-2 shadow-sm active:cursor-grabbing',
        (isDragging || isSortableDragging) && 'opacity-50'
      )}
    >
      <p className="text-sm font-medium text-foreground">{item.title}</p>
      {item.subtitle && (
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {item.subtitle}
        </p>
      )}
    </div>
  );
}

function KanbanColumnPanel({
  column,
  items,
}: {
  column: KanbanColumn;
  items: KanbanItem[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex min-w-[220px] flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
          {items.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl border border-border bg-secondary/30 p-2 transition-colors',
          isOver && 'border-primary/40 bg-primary/5'
        )}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} />
          ))}
        </SortableContext>
      </div>
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
    useSensor(KeyboardSensor)
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

  const activeItem = activeId
    ? items.find((item) => item.id === activeId)
    : undefined;

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
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((column) => (
          <KanbanColumnPanel
            key={column.id}
            column={column}
            items={itemsByColumn.get(column.id) ?? []}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? <KanbanCard item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
