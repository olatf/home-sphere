import { CheckSquare, MailOpen, Square, Trash2 } from 'lucide-react';
import { TimeInterval } from '@/helpers/date.helpers';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/property';
import { BrandButton } from '../common/BrandButton';
import { TYPE_COLORS, TYPE_LABELS } from './MessageReview';

export const MessageRow = ({
  message: m,
  isSelected,
  isOpen,
  onSelect,
  onOpen,
  onDelete,
  onMarkRead,
  itemProps: { ref: itemRef, tabIndex: itemTabIndex, onFocus: itemOnFocus },
}: {
  message: Message;
  isSelected: boolean;
  isOpen: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onDelete: () => void;
  onMarkRead: () => void;
  itemProps: {
    ref: (el: HTMLElement | null) => void;
    tabIndex: number;
    onFocus: () => void;
  };
}) => {
  const typeColor =
    TYPE_COLORS[m.type ?? 'notification'] ?? TYPE_COLORS.notification;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation is handled by the roving-tabindex listbox ancestor (see MessageReview)
    <div
      ref={itemRef}
      tabIndex={itemTabIndex}
      onFocus={itemOnFocus}
      role="option"
      aria-selected={isOpen}
      onClick={onOpen}
      className={cn(
        'group flex cursor-pointer items-start gap-3 border-b px-4 py-3 outline-none transition',
        isOpen && 'bg-brand/5',
        !m.is_read && !isOpen && 'bg-blue-50/40',
        isSelected && 'bg-brand/10',
        !isOpen && !isSelected && 'hover:bg-gray-50',
        'focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset'
      )}
    >
      <BrandButton
        onClick={e => {
          e.stopPropagation();
          onSelect();
        }}
        className="mt-0.5 shrink-0 opacity-0 transition group-hover:opacity-100"
        style={{ opacity: isSelected ? 1 : undefined }}
        rightIcon={
          isSelected ? (
            <CheckSquare className="h-4 w-4 text-brand" />
          ) : (
            <Square className="h-4 w-4 text-gray-300" />
          )
        }
      />

      <span
        className={cn(
          'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-[10px] uppercase',
          typeColor
        )}
      >
        {(m.type ?? 'N')[0].toUpperCase()}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              'truncate font-primary text-sm',
              !m.is_read
                ? 'font-semibold text-gray-900'
                : 'font-medium text-gray-700'
            )}
          >
            {m.subject}
          </p>
          <span className="shrink-0 font-secondary text-gray-400 text-xs">
            {TimeInterval(m.created_at)}
          </span>
        </div>
        <p className="mt-0.5 truncate font-secondary text-gray-400 text-xs">
          {m.author_name && (
            <span className="text-gray-500">{m.author_name} · </span>
          )}
          {m.body
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 80)}
        </p>
        {m.type && m.type !== 'message' && (
          <span
            className={cn(
              'mt-1 inline-flex rounded-full px-1.5 py-0.5 font-medium text-[10px]',
              typeColor
            )}
          >
            {TYPE_LABELS[m.type]}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
        {!m.is_read && (
          <BrandButton
            onClick={e => {
              e.stopPropagation();
              onMarkRead();
            }}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            title="Mark read"
            rightIcon={<MailOpen className="size-3.5" />}
          />
        )}
        <BrandButton
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-full p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-500"
          title="Delete"
          rightIcon={<Trash2 className="size-3.5" />}
        />
      </div>
    </div>
  );
};
