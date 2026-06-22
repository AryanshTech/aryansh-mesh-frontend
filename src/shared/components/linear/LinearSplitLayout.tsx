import type { ReactNode } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/design-system/components/ui/resizable';
import { cn } from '@/design-system/lib/utils';
import { layout } from '@/design-system/tokens/layout';

type LinearSplitLayoutProps = {
  left: ReactNode;
  center: ReactNode;
  right?: ReactNode;
  leftDefaultSize?: number;
  rightDefaultSize?: number;
  leftWidth?: number;
  fullBleed?: boolean;
  className?: string;
};

export function LinearSplitLayout({
  left,
  center,
  right,
  leftDefaultSize = 20,
  rightDefaultSize = 25,
  leftWidth,
  fullBleed = false,
  className,
}: LinearSplitLayoutProps) {
  if (leftWidth !== undefined) {
    return (
      <div className={cn(layout.dashboard.splitPane, fullBleed && 'min-h-0 flex-1', className)}>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div
            className="shrink-0 overflow-hidden border-r border-border"
            style={{ width: leftWidth }}
          >
            {left}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">{center}</div>
          {right ? (
            <div className="shrink-0 overflow-hidden border-l border-border" style={{ width: 320 }}>
              {right}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(layout.dashboard.splitPane, className)}>
      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize={leftDefaultSize} minSize={15} maxSize={35}>
          {left}
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-border" />
        <ResizablePanel defaultSize={right ? 100 - leftDefaultSize - rightDefaultSize : 100 - leftDefaultSize} minSize={30}>
          {center}
        </ResizablePanel>
        {right ? (
          <>
            <ResizableHandle withHandle className="bg-border" />
            <ResizablePanel defaultSize={rightDefaultSize} minSize={20} maxSize={40}>
              {right}
            </ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>
    </div>
  );
}
