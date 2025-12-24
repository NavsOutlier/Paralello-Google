import React, { useState } from 'react';
import { SidebarLeft } from './components/SidebarLeft';
import { ChatArea } from './components/ChatArea';
import { SidebarRightTasks } from './components/SidebarRightTasks';
import { ClientInfoPanel } from './components/ClientInfoPanel';
import { NewTaskModal } from './components/NewTaskModal';
import { NotificationsDropdown } from './components/NotificationsDropdown';
import { Conversation, Message, RightPanelMode, Task, User, TaskComment, ChecklistItem, Notification } from './types';

// --- MOCK DATA ---

const USERS: Record<string, User> = {
  me: { id: 'me', name: 'Você', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjoiT6O1vgdxpuuvqrqE145AM4Ziv-K5hR5u2r-cnNncYiMQCpZG43V8oHtr0V6oYLn1YVWsBEFUMcGM5XP8g6hZI7xP6p8O7VvRh4M0IGC0nhvcoiUlCfec9Mm8afw5sMLx4z7eleAGa0Z7O7GWbuP0XPNYYhwj79LsfTdM16Q3h7RcUlCYHbZjcpwEhacVzzv7paQJ_uNujfT41zrUUg-AJ2PDBfkACI512dahbhDjXQ_G36UQG_ul6sqEtJHPXLVWskCSUyhwE' },
  ana: { id: 'ana', name: 'Ana Souza', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU8fr2APzLDTQ-gEk1n5CEOLv6elsKqNbrsSl_80ww3VdJVaf5hKe91k_wWeda1Mm_yMgmKKimQEpQ52FGgcOBoTsGyZSR5LHXQJ4G6xRayrb4Iz6ri8hb9RgXcfHAq1q2ZqKyyCSYMPAfgej8IATTGwHXgzvbP6vCT_xMSwX8ofzIDrjuyWN8-X1lR77N9f51plMIZ8T7IjI_9EyVNVE3lulUhBq9oIsFN4YWEi_ITzppXLbaUuorcJayjJJ8ndzCs6EJzVTp6Oc' },
  rafael: { id: 'rafael', name: 'Rafael (Dev)', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ8I3WEgF2rf_WoOWwx76C-Y02b-w0EYYWioQ_y4tb46IDqD7PJmpKyt8EcsBa8D89zA5YPJZMp0x-ZuaY5qJU3upSWb5mRzduCrm63X7o8Q7Z-5aQod58Qj6_5FMubje6I_G4p0zGfzkpCvts0m8-p-DUCWEOtGmY2Fve1L2cb9GFrd3PUi5xXQVnExb3Ni8HocLtnP_vDd_oDMk9c2OOMboHABX4uSEioTdecYnOhusslOiZ-ucNd4kq7eF3R2gUbFirGJiyfjQ' },
  julia: { id: 'julia', name: 'Julia (Design)', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0n3c2JnGNrW818xkw5jXn3Bd4Xo6pkma7v2QD0qIKneENUYD8u_IhP3bW8S0mMxdKcGT8k4sIPpy-vZ22PFcfIKINi41Qs1grR_8Sc1eG4Qp7mjvGD6dWlmb18GCZA-4HB_N3ijdcGCQQHXFdj77ZRKKno7oT13u6_Gn8M4dxAOR5XJKbb-A1I36vTXepnp8ynWDeoKV1YUqk3doLUu_IBsW5DQ2ad6-sgSvCGITYA26WUPuSe1gkFYvXZJb2E4xiCrQlj4gNnMs' },
  lucas: { id: 'lucas', name: 'Lucas (Backend)', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFg1NHngG8ASHAAPyW4ggA4pUSV_jfJFXyU3t9-ggXS7V2EGFjJP2pTacj091Ip9VEeU18SCikpLnA4bOynsfe9S2bEIF8mKfiRt4OnehntnlzX-HuqwgG7ZMXhnFLUzGMSYO7pxoeMjiSt4GTXVmMCFouepgiFV57AM9bqa5dOHFZA89uuHmqWbkkQGk786m-UWQjAD-c0dQXjUQL4XdkYCCyjJUYLaqDzOumSyHfZe3HWx-n5xXD98iYO7wUOAN3gSCEgyoOCKM' },
  techflow: { id: 'techflow', name: 'TechFlow Inc.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmdKXfkzlzna-VWe9BAh_QN1-_lkoUHDch3G9F3NXuS2TpHc3u22cRhxbkuUg-UFR4ORHp6DrGsIJQ9PHzYvy-pP7F-HHlKVkhSwnvZIqP_rnh_6pv_1j6ys6YVBoTQ4qrNdcC245cdpT0ntaC7qIU7ejCuGRZVqqWD0uZ-Sq-MhuOMmHzA9TWYe5_XLvhc0JK1C7Pp1dQwRW9lBE5qtAIVwpRHLgKYHwdR8tlRgOkiXoNW_Bgr6CyvWcSSoRVZNafPt4YnYlP-B8' },
  mj: { id: 'mj', name: 'Maria Julia', avatar: '' }
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  // Clients
  { id: '1', user: USERS.ana, lastMessage: 'Preciso alterar o prazo do projeto...', time: '10:42', unreadCount: 0, unreadTaskCount: 3, type: 'client' }, // 3 unread task comments
  { id: '2', user: USERS.techflow, lastMessage: 'pode verificar isso?', time: '09:15', unreadCount: 2, unreadTaskCount: 0, mentionsMe: true, type: 'client' }, // Chat unread
  { id: '3', user: USERS.mj, lastMessage: 'Ok, combinado.', time: 'Sex', unreadCount: 0, unreadTaskCount: 0, type: 'client' },
  // Internal
  { id: '4', user: USERS.rafael, lastMessage: 'Deploy em produção finalizado.', time: '11:20', unreadCount: 1, type: 'internal' },
  { id: '5', user: USERS.julia, lastMessage: 'Te mandei os assets no Figma.', time: 'Ontem', unreadCount: 0, type: 'internal' },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { 
    id: 'n1', 
    type: 'mention', 
    title: 'TechFlow Inc. mencionou você', 
    text: '@você pode verificar isso?', 
    time: '09:15', 
    read: false, 
    conversationId: '2',
    senderUser: USERS.techflow
  },
  { 
    id: 'n2', 
    type: 'client_message', 
    title: 'Nova mensagem de TechFlow Inc.', 
    text: 'Olá equipe, o servidor de staging está instável.', 
    time: '09:10', 
    read: false, 
    conversationId: '2',
    senderUser: USERS.techflow
  },
  { 
    id: 'n3', 
    type: 'internal_message', 
    title: 'Rafael (Dev) enviou uma mensagem', 
    text: 'Deploy em produção finalizado. Pode testar?', 
    time: '11:20', 
    read: false, 
    conversationId: '4',
    senderUser: USERS.rafael
  },
  { 
    id: 'n4', 
    type: 'client_message', 
    title: 'Ana Souza enviou um anexo', 
    text: 'Também notei um pequeno bug no checkout mobile...', 
    time: 'Ontem', 
    read: true, 
    conversationId: '1',
    senderUser: USERS.ana
  }
];

const INITIAL_MESSAGES: Message[] = [
  // CONVERSATION 1 (Ana)
  { id: '1', conversationId: '1', senderId: 'ana', timestamp: '2023-10-15 10:30', text: 'Bom dia! Poderiam me dar um status sobre a alteração do layout da home?', type: 'text', isMe: false },
  { id: '2', conversationId: '1', senderId: 'ana', timestamp: '2023-10-15 10:32', text: 'Também notei um pequeno bug no checkout mobile. Segue o print.', type: 'image', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjd_tLAM1XwHg0Dg2WVuvKBrOS5B2gZYMANfMg-gcCGznLPkmD63Yp0VRzoSTBivJ44MnSBEHyUYTTjI-atjr0cbbjI5iYnGpNzOeISVHBs1jsHeVdu-sbg8rChK-V9V-jOVBCFT-Rf5wPQDohCYBfGbo9QU6Mn4o5FHThFw1b7gwpi_R24gQJ30ju2u5qbslU-77pleHgyNyD5Ovj5u4vTbENsJqmWueUwkqFYHqGRJp3FOTQF0QZfkc2NZXTdn00f9GaXD1eIEg', isMe: false },
  { id: '3', conversationId: '1', senderId: 'me', timestamp: '2023-10-15 10:35', text: 'Oi Ana! Vamos verificar isso agora mesmo.', type: 'text', isMe: true, read: true },
  { id: '4', conversationId: '1', senderId: 'me', timestamp: '2023-10-15 10:36', text: 'Já criei uma task para a equipe de desenvolvimento analisar o bug do checkout. Te aviso assim que tivermos uma previsão.', type: 'text', isMe: true, read: false },
  
  // CONVERSATION 2 (TechFlow)
  { id: '5', conversationId: '2', senderId: 'techflow', timestamp: '09:10', text: 'Olá equipe, o servidor de staging está instável.', type: 'text', isMe: false },
  { id: '6', conversationId: '2', senderId: 'techflow', timestamp: '09:15', text: '@Rafael (Dev) pode verificar isso?', type: 'text', isMe: false },
  
  // CONVERSATION 3 (Maria Julia)
  { id: '7', conversationId: '3', senderId: 'me', timestamp: 'Sex', text: 'Enviamos o orçamento revisado.', type: 'text', isMe: true, read: true },
  { id: '8', conversationId: '3', senderId: 'mj', timestamp: 'Sex', text: 'Ok, combinado. Vou aprovar na segunda.', type: 'text', isMe: false },

  // CONVERSATION 4 (Rafael)
  { id: '9', conversationId: '4', senderId: 'rafael', timestamp: '11:15', text: 'Cara, terminei o fix daquele bug de pagamento.', type: 'text', isMe: false },
  { id: '10', conversationId: '4', senderId: 'rafael', timestamp: '11:20', text: 'Deploy em produção finalizado. Pode testar?', type: 'text', isMe: false },

  // CONVERSATION 5 (Julia)
  { id: '11', conversationId: '5', senderId: 'julia', timestamp: 'Ontem', text: 'Te mandei os assets no Figma.', type: 'text', isMe: false },
  { id: '12', conversationId: '5', senderId: 'me', timestamp: 'Ontem', text: 'Valeu, vou baixar agora.', type: 'text', isMe: true, read: true },
];

const INITIAL_TASKS: Task[] = [
  // CONVERSATION 1 TASKS
  { 
    id: '1', 
    conversationId: '1',
    code: 'TK-402', 
    title: 'Bug: Erro ao finalizar compra no mobile (Checkout)', 
    description: 'Cliente reportou erro na tela de pagamento. Ocorre apenas no iOS.', 
    status: 'Pendente', 
    date: '12 Out', 
    dueDate: '2023-10-20',
    tags: [], 
    assignees: [USERS.rafael], 
    commentsCount: 2,
    unreadCommentsCount: 2, // UNREAD IN TASK
    checklist: [
      { id: 'c1', text: 'Reproduzir bug no iOS Simulator', completed: true },
      { id: 'c2', text: 'Verificar logs do servidor', completed: false },
      { id: 'c3', text: 'Aplicar correção no frontend', completed: false },
    ],
    comments: [
      { id: 'm1', text: 'Reproduzi o erro no iPhone 12 Pro.', sender: USERS.rafael, timestamp: '10:00' },
      { id: 'm2', text: 'Ótimo, vou verificar os logs.', sender: USERS.lucas, timestamp: '10:15' },
    ]
  },
  { 
    id: '2', 
    conversationId: '1',
    code: 'TK-398', 
    title: 'Alteração de Layout: Home Page Banner', 
    description: 'Atualizar o banner principal com a nova campanha de verão.', 
    status: 'Em Progresso', 
    date: '10 Out', 
    tags: ['Design', 'Urgente'], 
    assignees: [USERS.julia, USERS.lucas], 
    commentsCount: 5,
    unreadCommentsCount: 1, // UNREAD IN TASK
    checklist: [],
    comments: []
  },
  { 
    id: '3', 
    conversationId: '1',
    code: 'TK-380', 
    title: 'Integração API de Pagamentos', 
    description: '', 
    status: 'Aprovado', 
    date: '08 Out', 
    tags: [], 
    assignees: [USERS.lucas], 
    commentsCount: 12,
    unreadCommentsCount: 0,
    checklist: [
      { id: 'c1', text: 'Criar conta de sandbox', completed: true },
    ],
    comments: []
  },

  // CONVERSATION 2 TASKS (TechFlow)
  { 
    id: '4', 
    conversationId: '2',
    code: 'TK-550', 
    title: 'Instabilidade Servidor Staging', 
    description: 'Verificar picos de CPU reportados no dashboard.', 
    status: 'Pendente', 
    date: 'Hoje', 
    tags: ['DevOps', 'Urgente'], 
    assignees: [USERS.rafael], 
    commentsCount: 0,
    checklist: [],
    comments: []
  },
];

const App: React.FC = () => {
  // State
  const [activeConversationId, setActiveConversationId] = useState('1');
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('tasks');
  const [resizing, setResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(380);
  
  // Data State
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  
  // UI State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedMessageForTask, setSelectedMessageForTask] = useState<Message | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeUser = activeConversation.user;
  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Filter Data based on Active Conversation
  const activeMessages = messages.filter(m => m.conversationId === activeConversationId);
  const activeTasks = tasks.filter(t => t.conversationId === activeConversationId);

  // Actions
  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId: activeConversationId, // Bind to current chat
      text,
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'text',
      read: false
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation last message preview
    setConversations(prev => prev.map(c => 
      c.id === activeConversationId 
        ? { ...c, lastMessage: text, time: 'Agora' }
        : c
    ));
  };

  const handleAddTask = (title: string, description: string, assigneeIds: string[], dueDate: string, status: Task['status'], tags: string[], sourceMessage?: Message) => {
    // Map IDs to User objects
    const assignees = assigneeIds.map(id => Object.values(USERS).find(u => u.id === id)).filter(Boolean) as User[];
    // Default to 'me' if empty, or just leave empty depending on logic. Let's default to me if nothing selected.
    const finalAssignees = assignees.length > 0 ? assignees : [USERS.me];
    
    const initialComments: TaskComment[] = [];
    if (sourceMessage) {
      initialComments.push({
        id: Date.now().toString(),
        text: description,
        sender: USERS.me,
        timestamp: 'Agora',
        sourceMessage: sourceMessage
      });
    }

    const newTask: Task = {
      id: Date.now().toString(),
      conversationId: activeConversationId, // Bind to current client
      code: `TK-${Math.floor(Math.random() * 900) + 100}`,
      title,
      description: sourceMessage ? '' : description,
      status: status, // Use the selected status
      date: 'Hoje',
      dueDate: dueDate,
      tags: tags,
      assignees: finalAssignees, 
      commentsCount: initialComments.length,
      unreadCommentsCount: 0,
      checklist: [],
      comments: initialComments,
      sourceMessage: sourceMessage
    };
    setTasks(prev => [newTask, ...prev]);
    setRightPanelMode('tasks');
  };

  const handleEditTask = (taskId: string, title: string, description: string, assigneeIds: string[], dueDate: string, status: Task['status'], tags: string[]) => {
      const assignees = assigneeIds.map(id => Object.values(USERS).find(u => u.id === id)).filter(Boolean) as User[];
      const finalAssignees = assignees.length > 0 ? assignees : [USERS.me];

      setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
              return {
                  ...t,
                  title,
                  description,
                  assignees: finalAssignees,
                  dueDate,
                  status, // Update status
                  tags
              };
          }
          return t;
      }));
  }

  const handleAttachToTask = (taskId: string, comment: string, sourceMessage?: Message) => {
    const newComment: TaskComment = {
      id: Date.now().toString(),
      text: comment,
      sender: USERS.me,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceMessage: sourceMessage
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          comments: [...t.comments, newComment],
          commentsCount: t.commentsCount + 1 
        };
      }
      return t;
    }));
    setRightPanelMode('tasks');
    alert(`Comentário adicionado à task com sucesso!\n"${comment}"`);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleArchiveTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleQuickTaskFromChat = (message: Message) => {
    setSelectedMessageForTask(message);
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const openNewTaskModal = () => {
    setSelectedMessageForTask(null);
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  }

  const openEditTaskModal = (task: Task) => {
      setSelectedMessageForTask(null);
      setTaskToEdit(task);
      setIsTaskModalOpen(true);
  }

  const handleNavigateToMessage = (messageId: string) => {
    setHighlightedMessageId(messageId);
    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 3000);
  };

  // --- NOTIFICATION HANDLERS ---
  const handleNotificationClick = (notification: Notification) => {
    // 1. Mark as read
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    
    // 2. Navigate to conversation
    if (notification.conversationId) {
        setActiveConversationId(notification.conversationId);
        
        // Also update unread count for conversation if applicable
        setConversations(prev => prev.map(c => {
            if (c.id === notification.conversationId) {
                // Determine if we should clear mention flag or decrease count
                // Simplified logic: clicking notification clears the specific unread count related to it roughly
                // For a robust system, we'd need to link specific messages to notifications deeper
                const newCount = Math.max(0, c.unreadCount - 1);
                return { 
                    ...c, 
                    unreadCount: newCount,
                    mentionsMe: notification.type === 'mention' ? false : c.mentionsMe
                };
            }
            return c;
        }));
    }
    
    setIsNotificationsOpen(false);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Also clear conversation badges for visual consistency
    setConversations(prev => prev.map(c => ({ ...c, unreadCount: 0, mentionsMe: false })));
  };

  // Resize Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const newWidth = document.body.clientWidth - e.clientX;
    if (newWidth > 280 && newWidth < 600) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Navigation */}
      <header className="flex shrink-0 items-center justify-between whitespace-nowrap border-b border-neutral-border bg-white px-6 py-3 h-16 z-20 relative">
        <div className="flex items-center gap-3 text-text-main">
          <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
            <span className="material-symbols-outlined text-2xl">grid_view</span>
          </div>
          <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em]">Paralello</h2>
        </div>
        <div className="flex gap-3 relative">
          <div className="hidden md:flex items-center gap-2 text-sm text-text-secondary mr-4">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Online</span>
          </div>
          
          {/* Notification Button */}
          <button 
            className={`flex items-center justify-center overflow-hidden rounded-lg h-9 w-9 transition-colors relative ${isNotificationsOpen ? 'bg-primary text-black shadow-inner' : 'bg-neutral-100 hover:bg-neutral-200 text-text-main'}`}
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>
          
          <NotificationsDropdown 
             isOpen={isNotificationsOpen}
             notifications={notifications}
             onReadAndNavigate={handleNotificationClick}
             onClose={() => setIsNotificationsOpen(false)}
             onMarkAllRead={handleMarkAllNotificationsRead}
          />

          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary hover:bg-primary-dark transition-colors text-text-main text-sm font-bold shadow-sm">
            <span className="truncate">Meu Perfil</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 w-full h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Sidebar */}
        <SidebarLeft 
          conversations={conversations} 
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
        />

        {/* Chat Area */}
        <ChatArea 
          currentUser={USERS.me}
          activeUser={activeUser}
          messages={activeMessages}
          onOpenClientInfo={() => setRightPanelMode('client-info')}
          onSendMessage={handleSendMessage}
          onQuickTask={handleQuickTaskFromChat}
          highlightedMessageId={highlightedMessageId}
        />

        {/* Resize Handle */}
        <div 
          className="w-2 bg-gray-50 border-l border-r border-neutral-border hover:bg-gray-100 cursor-col-resize flex items-center justify-center z-20 flex-shrink-0 transition-colors group"
          onMouseDown={handleMouseDown}
          title="Redimensionar"
        >
          <div className={`h-8 w-1 rounded-full transition-colors ${resizing ? 'bg-primary' : 'bg-gray-300 group-hover:bg-primary'}`}></div>
        </div>

        {/* Right Sidebar */}
        <aside 
          className="flex-shrink-0 z-10 overflow-hidden"
          style={{ width: sidebarWidth }}
        >
          {rightPanelMode === 'tasks' ? (
            <SidebarRightTasks 
              tasks={activeTasks} 
              onAddTask={openNewTaskModal}
              currentUser={USERS.me}
              onUpdateTask={handleUpdateTask}
              onArchiveTask={handleArchiveTask}
              onNavigateToMessage={handleNavigateToMessage}
              onEditTask={openEditTaskModal}
            />
          ) : (
            <ClientInfoPanel onBack={() => setRightPanelMode('tasks')} />
          )}
        </aside>

      </main>

      <NewTaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleAddTask}
        onEdit={handleEditTask}
        onAttach={handleAttachToTask}
        users={Object.values(USERS)}
        existingTasks={activeTasks}
        initialMessage={selectedMessageForTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

export default App;