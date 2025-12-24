import React, { useState } from 'react';
import { Conversation } from '../types';

interface SidebarLeftProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ 
  conversations, 
  activeConversationId, 
  onSelectConversation 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'mentions'>('all');

  // Helper to filter individual conversations
  const isConversationVisible = (conv: Conversation) => {
    // 1. Search Filter
    const matchesSearch = conv.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Status Filter
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'unread' ? conv.unreadCount > 0 :
      filterType === 'mentions' ? conv.mentionsMe : true;

    return matchesSearch && matchesFilter;
  };

  const clientConversations = conversations.filter(c => c.type === 'client' && isConversationVisible(c));
  const internalConversations = conversations.filter(c => c.type === 'internal' && isConversationVisible(c));

  const renderConversationItem = (conv: Conversation) => {
    // Determine Badge Style based on priority: Mention > Internal Unread > Client Unread
    let badgeContent = null;
    let badgeStyle = '';
    
    // Logic for Main Chat Badge (The standard one)
    if (conv.unreadCount > 0) {
        if (conv.mentionsMe) {
            badgeStyle = 'bg-orange-500 text-white border-white'; // High priority mention
            badgeContent = <span className="material-symbols-outlined text-[10px]">alternate_email</span>;
        } else if (conv.type === 'internal') {
            badgeStyle = 'bg-slate-600 text-white border-white'; // Internal message - Changed from lock to number
            badgeContent = <span className="text-[10px] font-bold">{conv.unreadCount}</span>;
        } else {
            badgeStyle = 'bg-red-500 text-white border-white'; // Standard client message
            badgeContent = <span className="text-[10px] font-bold">{conv.unreadCount}</span>;
        }
    }

    // Blinking effect class
    // Blinks RED if it's a client message and has unread count
    const blinkClass = (conv.unreadCount > 0 && conv.type === 'client') ? 'animate-flash-red' : '';

    return (
        <div 
        key={conv.id}
        onClick={() => onSelectConversation(conv.id)}
        className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-l-4 transition-all ${blinkClass} ${
            activeConversationId === conv.id 
            ? 'border-primary bg-gradient-to-r from-primary/10 to-transparent' 
            : 'border-transparent hover:bg-gray-50'
        }`}
        >
        <div className="relative shrink-0">
            {conv.user.avatar ? (
            <div 
                className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border border-gray-100" 
                style={{ backgroundImage: `url("${conv.user.avatar}")` }}
            ></div>
            ) : (
            <div className="rounded-full h-12 w-12 border border-gray-100 bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                {conv.user.name.split(' ').map(n => n[0]).join('').substring(0,2)}
            </div>
            )}
            
            {/* Context Aware Notification Badge (Main Chat) */}
            {conv.unreadCount > 0 && (
            <div className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 shadow-sm ${badgeStyle}`}>
                {badgeContent}
            </div>
            )}

            {/* Online Indicator for Internal Chat */}
            {conv.type === 'internal' && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
            <h3 className={`text-sm ${activeConversationId === conv.id ? 'font-bold' : 'font-medium'} text-text-main truncate`}>
                {conv.user.name}
            </h3>
            {/* Task Updates Badge (Aggregated) */}
            <div className="flex items-center gap-2">
                 {(conv.unreadTaskCount && conv.unreadTaskCount > 0) ? (
                    <div className="flex items-center gap-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full border border-red-200" title={`${conv.unreadTaskCount} atualizações em tasks`}>
                        <span className="material-symbols-outlined text-[12px] animate-pulse">forum</span>
                        <span className="text-[10px] font-bold">{conv.unreadTaskCount}</span>
                    </div>
                ) : null}
                <span className={`text-xs ${conv.unreadCount > 0 ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                    {conv.time}
                </span>
            </div>
            </div>
            <p className="text-xs text-text-secondary truncate group-hover:text-text-main transition-colors flex items-center gap-1">
                {conv.mentionsMe && <span className="text-orange-500 font-bold bg-orange-50 px-1 rounded text-[10px]">@você</span>}
                <span className={`${activeConversationId === conv.id ? 'text-text-main font-medium' : ''} truncate`}>{conv.lastMessage}</span>
            </p>
        </div>
        </div>
    );
  };

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col border-r border-neutral-border bg-white z-10 h-full">
      <style>{`
        @keyframes flash-red {
          0%, 100% { background-color: transparent; }
          50% { background-color: #fee2e2; } /* red-100 */
        }
        .animate-flash-red {
          animation: flash-red 2s infinite;
        }
      `}</style>
      
      {/* Search Header */}
      <div className="px-4 pt-4 pb-4 border-b border-neutral-border">
        <h2 className="text-sm font-bold text-text-main mb-3">Mensagens</h2>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input 
            className="block w-full p-2.5 pl-10 text-sm text-text-main bg-gray-50 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all" 
            placeholder="Buscar..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all ${filterType === 'all' ? 'text-white bg-black hover:scale-105 shadow-sm' : 'text-text-secondary bg-gray-100 hover:bg-gray-200'}`}
          >
            Tudo
          </button>
          <button 
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all ${filterType === 'unread' ? 'text-white bg-black hover:scale-105 shadow-sm' : 'text-text-secondary bg-gray-100 hover:bg-gray-200'}`}
          >
            Não lidos
          </button>
          <button 
            onClick={() => setFilterType('mentions')}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all ${filterType === 'mentions' ? 'text-white bg-black hover:scale-105 shadow-sm' : 'text-text-secondary bg-gray-100 hover:bg-gray-200'}`}
          >
            Mentions
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
        
        {/* CLIENTS SECTION */}
        {clientConversations.length > 0 && (
            <div className="mb-2">
                <div className="px-4 pt-4 pb-2 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">folder_shared</span>
                        Projetos / Clientes
                    </h3>
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-medium">{clientConversations.length}</span>
                </div>
                {clientConversations.map(renderConversationItem)}
            </div>
        )}

        {/* TEAM SECTION */}
        {internalConversations.length > 0 && (
            <div className="mb-2">
                 <div className="px-4 pt-4 pb-2 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-t border-gray-50 mt-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">groups</span>
                        Equipe Interna
                    </h3>
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-medium">{internalConversations.length}</span>
                </div>
                {internalConversations.map(renderConversationItem)}
            </div>
        )}

        {clientConversations.length === 0 && internalConversations.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">
            Nenhuma conversa encontrada.
          </div>
        )}
      </div>
    </aside>
  );
};