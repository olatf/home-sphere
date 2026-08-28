'use client';

import {
  CheckSquare,
  Edit3,
  Inbox,
  Loader2,
  MailOpen,
  RefreshCw,
  Search,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { useReducer } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { baseClass } from '@/config/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  useDeleteMessages,
  useMarkMessagesRead,
  useMessages,
  useSendMessage,
  useUnreadCount,
} from '@/hooks/useMessages';
import { useRovingTabIndex } from '@/hooks/useRovingTabIndex';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/property';
import { BrandButton } from '../common/BrandButton';
import { BrandInput, type FormValue } from '../common/BrandInput';
import { type ComposeFormData, ComposeModal } from './ComposeModal';
import { MessageDetailContent } from './MessageDetailContent';
import { MessageDetail } from './MessageDetails';
import { MessageRow } from './MessageRow';

export const TYPE_COLORS: Record<string, string> = {
  notification: 'text-brand bg-brand/10',
  message: 'text-blue-600 bg-blue-50',
  task: 'text-amber-600 bg-amber-50',
  property: 'text-emerald-600 bg-emerald-50',
  payment: 'text-purple-600 bg-purple-50',
  system: 'text-gray-500 bg-gray-100',
};

export const TYPE_LABELS: Record<string, string> = {
  notification: 'Notification',
  message: 'Message',
  task: 'Task',
  property: 'Property',
  payment: 'Payment',
  system: 'System',
};

type Tab =
  | 'all'
  | 'unread'
  | 'message'
  | 'payment'
  | 'task'
  | 'property'
  | 'notification';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'message', label: 'Messages' },
  { key: 'notification', label: 'Notifications' },
  { key: 'payment', label: 'Payments' },
  { key: 'task', label: 'Tasks' },
  { key: 'property', label: 'Properties' },
];

interface State {
  tab: Tab;
  page: number;
  search: string;
  selected: Set<string>;
  openMessage: Message | null;
  composing: boolean;
}

type Action =
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'TOGGLE_SELECT'; id: string }
  | { type: 'SELECT_ALL'; ids: string[] }
  | { type: 'CLEAR_SELECT' }
  | { type: 'OPEN_MESSAGE'; message: Message }
  | { type: 'CLOSE_MESSAGE' }
  | { type: 'SET_COMPOSING'; open: boolean };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET_TAB':
      return {
        ...s,
        tab: a.tab,
        page: 1,
        selected: new Set<string>(),
        openMessage: null,
      };
    case 'SET_PAGE':
      return { ...s, page: a.page };
    case 'SET_SEARCH':
      return { ...s, search: a.search, page: 1 };
    case 'TOGGLE_SELECT': {
      const next = new Set(s.selected);
      if (next.has(a.id)) {
        next.delete(a.id);
      } else {
        next.add(a.id);
      }
      return { ...s, selected: next };
    }
    case 'SELECT_ALL':
      return { ...s, selected: new Set(a.ids) };
    case 'CLEAR_SELECT':
      return { ...s, selected: new Set<string>() };
    case 'OPEN_MESSAGE':
      return { ...s, openMessage: a.message, selected: new Set<string>() };
    case 'CLOSE_MESSAGE':
      return { ...s, openMessage: null };
    case 'SET_COMPOSING':
      return { ...s, composing: a.open };
    default:
      return s;
  }
}

export const MessageReview = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [state, dispatch] = useReducer(reducer, {
    tab: 'all',
    page: 1,
    search: '',
    selected: new Set<string>(),
    openMessage: null,
    composing: false,
  });

  const { tab, page, search, selected, openMessage, composing } = state;

  const filters = {
    type: tab !== 'all' && tab !== 'unread' ? tab : undefined,
    unreadOnly: tab === 'unread',
    page,
  };

  const { data, isLoading, refetch, isRefetching } = useMessages(filters);
  const { data: unreadData } = useUnreadCount();
  const markRead = useMarkMessagesRead();
  const deleteMsgs = useDeleteMessages();
  const sendMessage = useSendMessage();

  const messages = (data?.data ?? []) as Message[];
  const totalPages = data?.totalPages ?? 0;
  const totalCount = data?.total ?? 0;
  const unreadCount = (unreadData ?? 0) as number;

  const filtered = search.trim()
    ? messages.filter(
        m =>
          m.subject.toLowerCase().includes(search.toLowerCase()) ||
          m.body
            .replace(/<[^>]*>/g, '')
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (m.author_name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : messages;

  const allIds = filtered.map(m => m.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  const selectedIds = Array.from(selected);

  async function handleMarkRead(ids: string[]) {
    await markRead.mutateAsync(ids);
    toast.success(
      ids.length > 1
        ? `${ids.length} messages marked as read`
        : 'Marked as read'
    );
    dispatch({ type: 'CLEAR_SELECT' });
  }

  async function handleDelete(ids: string[]) {
    await deleteMsgs.mutateAsync(ids);
    toast.success(
      ids.length > 1 ? `${ids.length} messages deleted` : 'Message deleted'
    );
    dispatch({ type: 'CLEAR_SELECT' });
    if (openMessage && ids.includes(openMessage.id))
      dispatch({ type: 'CLOSE_MESSAGE' });
  }

  async function handleOpenMessage(message: Message) {
    dispatch({ type: 'OPEN_MESSAGE', message });
    if (!message.is_read) await markRead.mutateAsync([message.id]);
  }

  const messageList = useRovingTabIndex({
    itemCount: filtered.length,
    onSelect: index => {
      const message = filtered[index];
      if (message) handleOpenMessage(message);
    },
  });

  async function handleSend(data: ComposeFormData) {
    await sendMessage.mutateAsync(data);
    toast.success('Message sent');
    dispatch({ type: 'SET_COMPOSING', open: false });
  }

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="font-bold font-primary text-gray-900 text-xl">
            Messages
          </h1>
          {totalCount > 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-secondary text-gray-500 text-xs">
              {totalCount}
            </span>
          )}
          {unreadCount > 0 && (
            <span className="rounded-full bg-brand px-2 py-0.5 font-medium font-secondary text-white text-xs">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selected.size > 0 ? (
            <>
              <span className="font-secondary text-gray-500 text-xs">
                {selected.size} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkRead(selectedIds)}
              >
                <MailOpen className="mr-1.5 h-3.5 w-3.5" /> Mark Read
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleDelete(selectedIds)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dispatch({ type: 'CLEAR_SELECT' })}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw
                  className={cn('h-3.5 w-3.5', isRefetching && 'animate-spin')}
                />
              </Button>
              <Button
                size="sm"
                className="bg-brand hover:bg-brand-dark"
                onClick={() => dispatch({ type: 'SET_COMPOSING', open: true })}
              >
                <Edit3 className="mr-2 h-3.5 w-3.5" /> Compose
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="scrollbar-none flex items-center gap-1 overflow-x-auto border-b bg-white px-4 py-2">
        {TABS.map(t => (
          <BrandButton
            key={t.key}
            onClick={() => dispatch({ type: 'SET_TAB', tab: t.key })}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 font-medium text-xs transition',
              tab === t.key
                ? 'bg-brand text-white'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            {t.label}
          </BrandButton>
        ))}
      </div>

      <div className="border-b bg-gray-50 px-4 py-2">
        <div className="relative">
          <BrandInput
            name="search"
            type="search"
            placeholder="Search messages..."
            value={search}
            onChange={(value: FormValue) => {
              dispatch({ type: 'SET_SEARCH', search: value?.toString() ?? '' });
            }}
            className={cn('border-none bg-white px-10 shadow-sm', baseClass)}
            leftElement={<Search className="size-4 text-gray-400" />}
            rightElement={
              search && (
                <BrandButton
                  onClick={() => dispatch({ type: 'SET_SEARCH', search: '' })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </BrandButton>
              )
            }
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Message list */}
        <div
          className={cn(
            'flex flex-col overflow-y-auto border-r bg-white',
            openMessage && !isMobile ? 'w-80 shrink-0' : 'flex-1'
          )}
        >
          {filtered.length > 0 && (
            <div className="flex items-center gap-3 border-b px-4 py-2">
              <BrandButton
                size="sm"
                variant="outline"
                onClick={() =>
                  allSelected
                    ? dispatch({ type: 'CLEAR_SELECT' })
                    : dispatch({ type: 'SELECT_ALL', ids: allIds })
                }
                leftIcon={
                  allSelected ? (
                    <CheckSquare className="h-4 w-4 text-brand" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-300" />
                  )
                }
              ></BrandButton>
              <span className="font-secondary text-gray-400 text-xs">
                Select all
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-7 animate-spin text-brand" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
                <Inbox className="h-6 w-6 text-brand" />
              </div>
              <p className="font-primary font-semibold text-gray-600 text-sm">
                No messages
              </p>
              <p className="font-secondary text-gray-400 text-xs">
                {search ? 'No results for your search' : 'Your inbox is empty'}
              </p>
            </div>
          ) : (
            <div
              role="listbox"
              aria-label="Messages"
              onKeyDown={messageList.handleKeyDown}
            >
              {filtered.map((m, i) => (
                <MessageRow
                  key={m.id}
                  message={m}
                  isSelected={selected.has(m.id)}
                  isOpen={openMessage?.id === m.id}
                  onSelect={() => dispatch({ type: 'TOGGLE_SELECT', id: m.id })}
                  onOpen={() => handleOpenMessage(m)}
                  onDelete={() => handleDelete([m.id])}
                  onMarkRead={() => handleMarkRead([m.id])}
                  itemProps={messageList.getItemProps(i)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <BrandButton
                disabled={page <= 1}
                onClick={() => dispatch({ type: 'SET_PAGE', page: page - 1 })}
                className="rounded-lg px-3 py-1.5 font-secondary text-gray-500 text-xs hover:bg-gray-100 disabled:opacity-40"
              >
                ← Prev
              </BrandButton>
              <span className="font-secondary text-gray-400 text-xs">
                {page} / {totalPages}
              </span>
              <BrandButton
                disabled={page >= totalPages}
                onClick={() => dispatch({ type: 'SET_PAGE', page: page + 1 })}
                className="rounded-lg px-3 py-1.5 font-secondary text-gray-500 text-xs hover:bg-gray-100 disabled:opacity-40"
              >
                Next →
              </BrandButton>
            </div>
          )}
        </div>

        {/* Detail panel — desktop */}
        {openMessage && !isMobile && (
          <MessageDetail
            message={openMessage}
            onClose={() => dispatch({ type: 'CLOSE_MESSAGE' })}
            onDelete={() => handleDelete([openMessage.id])}
          />
        )}
      </div>

      {/* Detail drawer — mobile */}
      {isMobile && (
        <Drawer
          open={!!openMessage}
          onOpenChange={o => !o && dispatch({ type: 'CLOSE_MESSAGE' })}
        >
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle className="text-left font-primary">
                {openMessage?.subject}
              </DrawerTitle>
            </DrawerHeader>
            {openMessage && (
              <div className="overflow-y-auto px-4 pb-8">
                <MessageDetailContent message={openMessage} />
              </div>
            )}
          </DrawerContent>
        </Drawer>
      )}

      {/* Compose modal */}
      <ComposeModal
        open={composing}
        onClose={() => dispatch({ type: 'SET_COMPOSING', open: false })}
        onSend={handleSend}
        sending={sendMessage.isPending}
        isMobile={isMobile}
      />
    </div>
  );
};
