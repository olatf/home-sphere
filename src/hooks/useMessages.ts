'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUnreadCount,
  getUserMessages,
  markMessagesRead,
} from '@/actions/messages';
import { QUERY_KEYS } from '@/config/property';

interface MessagesFilters {
  type?: string;
  unreadOnly?: boolean;
  page?: number;
}

export function useMessages(filters?: MessagesFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.messages(filters),
    queryFn: () => getUserMessages(filters),
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: QUERY_KEYS.unreadCount(),
    queryFn: getUnreadCount,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}

export function useMarkMessagesRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => markMessagesRead(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      qc.invalidateQueries({ queryKey: ['messages-unread-count'] });
    },
  });
}

export function useDeleteMessages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch('/api/messages/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error('Failed to delete messages');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      qc.invalidateQueries({ queryKey: ['messages-unread-count'] });
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      to,
      subject,
      body,
    }: {
      to: string;
      subject: string;
      body: string;
    }) => {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
