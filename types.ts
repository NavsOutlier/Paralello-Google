
export interface User {
  id: string;
  name: string;
  avatar: string;
  status?: 'online' | 'offline' | 'busy';
  role?: string;
}

export interface Message {
  id: string;
  conversationId: string; // Links message to a specific conversation/client
  text?: string;
  senderId: string;
  timestamp: string;
  isMe: boolean;
  type: 'text' | 'image';
  imageUrl?: string;
  read?: boolean;
  delivered?: boolean;
}

export interface TaskComment {
  id: string;
  text: string;
  sender: User;
  timestamp: string;
  sourceMessage?: Message; // Link back to a chat message
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  conversationId: string; // Links task to a specific conversation/client
  code: string;
  title: string;
  description: string;
  status: 'Pendente' | 'Em Progresso' | 'Aprovado';
  date: string;
  dueDate?: string; 
  tags: string[];
  assignees: User[]; // Changed from single assignee to array
  commentsCount: number;
  checklist: ChecklistItem[];
  comments: TaskComment[];
  sourceMessage?: Message;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isGroup?: boolean;
  mentionsMe?: boolean;
}

export type RightPanelMode = 'tasks' | 'client-info';