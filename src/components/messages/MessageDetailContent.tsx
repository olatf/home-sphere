import { TimeInterval } from '@/helpers/date.helpers';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/property';
import { TYPE_COLORS, TYPE_LABELS } from './MessageReview';

export const MessageDetailContent = ({ message: m }: { message: Message }) => {
  const typeColor =
    TYPE_COLORS[m.type ?? 'notification'] ?? TYPE_COLORS.notification;
  return (
    <div className="space-y-4">
      <h2 className="font-bold font-primary text-gray-900 text-xl">
        {m.subject}
      </h2>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm',
            typeColor
          )}
        >
          {(m.author_name ?? 'H')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-primary font-semibold text-gray-800 text-sm">
            {m.author_name ?? 'HomeSphere'}
          </p>
          {m.author_email && (
            <p className="font-secondary text-gray-400 text-xs">
              {m.author_email}
            </p>
          )}
        </div>
        <div className="ml-auto text-right">
          <p className="font-secondary text-gray-400 text-xs">
            {TimeInterval(m.created_at)}
          </p>
          {m.type && (
            <span
              className={cn(
                'mt-0.5 inline-flex rounded-full px-2 py-0.5 font-medium text-[10px]',
                typeColor
              )}
            >
              {TYPE_LABELS[m.type] ?? m.type}
            </span>
          )}
        </div>
      </div>
      <div
        className="rounded-xl border bg-gray-50 p-5 font-secondary text-gray-700 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: m.body }}
      />
    </div>
  );
};
