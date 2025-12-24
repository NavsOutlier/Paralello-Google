import React, { useState, useRef, useEffect } from 'react';
import { Message, User } from '../types';

interface ChatAreaProps {
  currentUser: User;
  messages: Message[];
  activeUser: User;
  onOpenClientInfo: () => void;
  onSendMessage: (text: string) => void;
  onQuickTask: (message: Message) => void;
  highlightedMessageId: string | null;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  currentUser, 
  messages, 
  activeUser,
  onOpenClientInfo,
  onSendMessage,
  onQuickTask,
  highlightedMessageId
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom only if no specific message is highlighted initially
  useEffect(() => {
    if (!highlightedMessageId) {
      scrollToBottom();
    }
  }, [messages, highlightedMessageId]);

  // Handle scrolling to highlighted message
  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      messageRefs.current[highlightedMessageId]?.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      });
    }
  }, [highlightedMessageId]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="flex-1 flex flex-col min-w-[400px] bg-chat-bg-client relative h-full shadow-inner">
      {/* Background Pattern - Made subtler */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none bg-repeat mix-blend-multiply" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwS70-8ES6acsoQCBre4tC4nHX22qTxWZmmJLlNnBVbkWb6eA_6AJuDTcU1cKJXCP3VtDSVJfEZTyZmmmB_fFykL7soH-bXg6RcpnGy-soYZIV8iZBDrtlzavESlv2Ft1cr6qKddkqi81HCtfRdJ3tY3HpRDG-VOjtIf2o-NzWkCt7IkxjiOAtYg3t5KSJV6awvUcKDK889TmaqsVCsfmBD4jH1SNdGziIUqChmg8lnxuDTZN53sI2aE7iB0_C-fy4lctrfAOiVOo')" }}
      ></div>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-neutral-border px-6 py-3 flex items-center justify-between shrink-0 z-10 shadow-sm h-[65px]">
        <div className="flex items-center gap-4">
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 border border-gray-200 shadow-sm" 
            style={{ backgroundImage: `url("${activeUser.avatar || 'https://via.placeholder.com/40'}")` }}
          ></div>
          <div className="flex flex-col">
            <h1 className="text-text-main text-base font-bold leading-tight">{activeUser.name} - Projeto Website</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]"></span>
              <span className="text-text-secondary text-xs font-medium">Online agora</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => alert("Buscar mensagem em breve...")} className="p-2 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors" title="Pesquisar na conversa">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <button onClick={() => alert("Opções adicionais em breve...")} className="p-2 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors" title="Mais opções">
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          <button 
            onClick={onOpenClientInfo}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-text-secondary hover:text-primary rounded-lg border border-gray-200 transition-all group shadow-sm" 
            title="Ver Informações do Cliente"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-105 transition-transform">contact_page</span>
            <span className="text-sm font-medium hidden lg:inline">Info. Cliente</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar relative z-0">
        <div className="flex justify-center my-2 sticky top-0 z-10">
          <span className="bg-white/80 text-text-secondary text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm backdrop-blur-md border border-gray-100">Hoje</span>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id}
            ref={(el) => { messageRefs.current[msg.id] = el; }}
            className={`flex flex-col ${msg.isMe ? 'items-end self-end' : 'items-start self-start'} max-w-[85%] group relative transition-all duration-500 ${highlightedMessageId === msg.id ? 'scale-105' : ''}`}
          >
            <div 
              className={`rounded-xl p-3 shadow-sm text-sm text-text-main relative border transition-all duration-300
                ${msg.isMe 
                  ? 'bg-[#e7ffdb] border-[#e7ffdb] rounded-tr-none hover:shadow-md' // Fresher green
                  : 'bg-white border-white rounded-tl-none hover:shadow-md'
                }
                ${highlightedMessageId === msg.id ? 'ring-4 ring-yellow-200 shadow-lg' : ''}
              `}
            >
              {/* Sender Name Signature */}
              {!msg.isMe && (
                <div className="text-xs font-bold text-orange-600 mb-1 leading-none">
                  {activeUser.name}
                </div>
              )}

              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              {msg.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-black/5 max-w-[280px]">
                  <img src={msg.imageUrl} alt="Attachment" className="w-full h-auto object-cover" />
                </div>
              )}
              <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                <span className="text-[10px] font-medium">{msg.timestamp.split(' ')[1] || '10:00'}</span>
                {msg.isMe && (
                   <span className={`material-symbols-outlined text-[14px] ${msg.read ? 'text-blue-500' : 'text-gray-400'}`}>
                     {msg.read ? 'done_all' : 'done'}
                   </span>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS (Hover) */}
            <div className={`
              absolute top-0 bottom-0
              ${msg.isMe ? 'right-full pr-2' : 'left-full pl-2'}
              flex items-center
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
            `}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickTask(msg);
                }}
                className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:text-white hover:bg-black hover:border-black transition-all transform hover:scale-110 active:scale-95" 
                title="Criar Task a partir desta mensagem"
              >
                <span className="material-symbols-outlined text-[18px]">add_task</span>
              </button>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="bg-gray-50/90 backdrop-blur-sm px-4 py-3 shrink-0 z-10 border-t border-neutral-border">
        <div className="flex items-end gap-2">
          <div className="flex gap-1 pb-2">
            <button onClick={() => alert("Anexar arquivo em desenvolvimento")} className="text-gray-400 hover:text-text-secondary p-2 rounded-full hover:bg-gray-200 transition-colors">
              <span className="material-symbols-outlined">add</span>
            </button>
            <button onClick={() => alert("Emojis em breve!")} className="text-gray-400 hover:text-text-secondary p-2 rounded-full hover:bg-gray-200 transition-colors">
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </button>
          </div>
          <div className="flex-1 bg-white border border-gray-300 rounded-2xl flex items-center p-2 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all shadow-sm">
            <textarea 
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm text-text-main placeholder:text-gray-400 focus:outline-none" 
              placeholder="Digite uma mensagem..." 
              rows={1}
              style={{ minHeight: '24px' }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            ></textarea>
            <button onClick={() => alert("Upload de arquivo")} className="text-gray-400 hover:text-text-secondary p-1">
              <span className="material-symbols-outlined text-[20px]">attach_file</span>
            </button>
          </div>
          <button 
            onClick={handleSend}
            className="bg-primary hover:bg-primary-dark text-white rounded-full p-3 shadow-md transition-all flex items-center justify-center h-[46px] w-[46px] hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px] text-black">send</span>
          </button>
        </div>
      </footer>
    </section>
  );
};