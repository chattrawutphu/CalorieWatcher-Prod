"use client";

import React, { useMemo } from 'react';
import { useVirtualScrolling } from '@/lib/hooks/use-performance';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 3,
  onScroll,
}: VirtualListProps<T>) {
  const {
    visibleItems,
    visibleRange,
    handleScroll,
    totalHeight,
    offsetY,
  } = useVirtualScrolling(items, itemHeight, containerHeight);

  const handleScrollEvent = (e: React.UIEvent<HTMLElement>) => {
    handleScroll(e);
    onScroll?.(e.currentTarget.scrollTop);
  };

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScrollEvent}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Grid virtual scrolling for 2D layouts
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gap?: number;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  className,
  gap = 0,
}: VirtualGridProps<T>) {
  const columnsPerRow = Math.floor(containerWidth / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const rowHeight = itemHeight + gap;

  const {
    visibleItems: visibleRows,
    visibleRange,
    handleScroll,
    totalHeight,
    offsetY,
  } = useVirtualScrolling(
    Array.from({ length: totalRows }, (_, i) => i),
    rowHeight,
    containerHeight
  );

  const visibleItems = useMemo(() => {
    const result: { item: T; index: number; row: number; col: number }[] = [];
    
    visibleRows.forEach((rowIndex) => {
      for (let col = 0; col < columnsPerRow; col++) {
        const itemIndex = rowIndex * columnsPerRow + col;
        if (itemIndex < items.length) {
          result.push({
            item: items[itemIndex],
            index: itemIndex,
            row: rowIndex,
            col,
          });
        }
      }
    });
    
    return result;
  }, [visibleRows, items, columnsPerRow]);

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index, row, col }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: col * (itemWidth + gap),
                top: (row - visibleRange.start) * rowHeight,
                width: itemWidth,
                height: itemHeight,
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualList;