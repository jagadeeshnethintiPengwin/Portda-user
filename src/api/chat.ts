import { api } from './client';
import type { ChatRoom, ChatMessage } from './types';

export const chatApi = {
  rooms: () => api<ChatRoom[]>('/chat/rooms'),

  // Unread incoming messages across all rooms — for the Chat tab badge.
  unreadCount: () => api<{ count: number }>('/chat/unread-count'),

  openRoom: (data: {
    counterparty_user_id: number;
    service_request_id?: number | null;
    order_id?: number | null;
  }) =>
    api<ChatRoom>('/chat/rooms', { method: 'POST', body: JSON.stringify(data) }),

  messages: (roomId: number | string) =>
    api<ChatMessage[]>(`/chat/rooms/${roomId}`),

  sendText: (roomId: number | string, body: string) => {
    const formData = new FormData();
    formData.append('type', 'text');
    formData.append('body', body);
    return api<ChatMessage>(`/chat/rooms/${roomId}/messages`, { method: 'POST', body: formData });
  },

  sendFile: (
    roomId: number | string,
    type: 'image' | 'file',
    attachment: { uri: string; name: string; type: string },
    body?: string,
  ) => {
    const formData = new FormData();
    formData.append('type', type);
    if (body) formData.append('body', body);
    formData.append('attachment', attachment as any);
    return api<ChatMessage>(
      `/chat/rooms/${roomId}/messages`,
      { method: 'POST', body: formData },
    );
  },

  markRead: (roomId: number | string) =>
    api<void>(`/chat/rooms/${roomId}/read`, { method: 'POST' }),
};
