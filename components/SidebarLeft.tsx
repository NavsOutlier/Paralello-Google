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

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'unread' ? conv.unreadCount > 0 :
      filterType === 'mentions' ? conv.mentionsMe : true;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col border-r border-neutral-border bg-white z-10 h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-neutral-border">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input 
            className="block w-full p-2.5 pl-10 text-sm text-text-main bg-gray-50 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all" 
            placeholder="Buscar clientes ou equipe..." 
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
        {conversations.length > 0 && (
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">clientes</h3>
            <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-medium">{filteredConversations.length}</span>
          </div>
        )}

        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Nenhuma conversa encontrada.
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-l-4 transition-all ${
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
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold border border-white">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className={`text-sm ${activeConversationId === conv.id ? 'font-bold' : 'font-medium'} text-text-main truncate`}>
                    {conv.user.name}
                  </h3>
                  <span className={`text-xs ${conv.unreadCount > 0 ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                    {conv.time}
                  </span>
                </div>
                <p className="text-xs text-text-secondary truncate group-hover:text-text-main transition-colors">
                  {conv.mentionsMe && <span className="text-primary font-bold">@você </span>}
                  <span className={activeConversationId === conv.id ? 'text-text-main font-medium' : ''}>{conv.lastMessage}</span>
                </p>
              </div>
            </div>
          ))
        )}

        <div className="px-4 pt-5 pb-2 mt-6 border-t border-neutral-border flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Colaboradoes</h3>
        </div>

        <div className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent transition-colors" onClick={() => alert("Exemplo estático de colaborador")}>
          <div className="relative shrink-0">
            <div 
              className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border border-gray-100" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAjoiT6O1vgdxpuuvqrqE145AM4Ziv-K5hR5u2r-cnNncYiMQCpZG43V8oHtr0V6oYLn1YVWsBEFUMcGM5XP8g6hZI7xP6p8O7VvRh4M0IGC0nhvcoiUlCfec9Mm8afw5sMLx4z7eleAGa0Z7O7GWbuP0XPNYYhwj79LsfTdM16Q3h7RcUlCYHbZjcpwEhacVzzv7paQJ_uNujfT41zrUUg-AJ2PDBfkACI512dahbhDjXQ_G36UQG_ul6sqEtJHPXLVWskCSUyhwE")' }}
            ></div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
              <h3 className="text-sm font-medium text-text-main truncate">Carlos Silva</h3>
              <span className="text-xs text-text-secondary">Ontem</span>
            </div>
            <p className="text-xs text-text-secondary truncate group-hover:text-text-main transition-colors">Relatório enviado no canal #geral</p>
          </div>
          <div className="text-yellow-400">
            <span className="material-symbols-outlined text-[18px] fill-current">star</span>
          </div>
        </div>
      </div>
    </aside>
  );
};