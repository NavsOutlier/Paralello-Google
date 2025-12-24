import React from 'react';
import { Notification, NotificationType } from '../types';

interface NotificationsDropdownProps {
  isOpen: boolean;
  notifications: Notification[];
  onReadAndNavigate: (notification: Notification) => void;
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  notifications,
  onReadAndNavigate,
  onClose,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'mention':
        return <span className="material-symbols-outlined text-white text-[16px]">alternate_email</span>;
      case 'internal_message':
        return <span className="material-symbols-outlined text-white text-[16px]">lock</span>;
      case 'client_message':
      default:
        return <span className="material-symbols-outlined text-white text-[16px]">chat</span>;
    }
  };

  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case 'mention':
        return 'bg-orange-500 shadow-orange-200';
      case 'internal_message':
        return 'bg-slate-600 shadow-slate-200';
      case 'client_message':
        return 'bg-blue-500 shadow-blue-200';
      default:
        return 'bg-gray-500';
    }
  };

  const getLabel = (type: NotificationType) => {
    switch (type) {
      case 'mention': return 'Menção';
      case 'internal_message': return 'Interno';
      case 'client_message': return 'Cliente';
      default: return '';
    }
  };

  // Sort by read status (unread first) then date
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read === b.read) return 0;
    return a.read ? 1 : -1;
  });

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute top-16 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-text-main text-sm">Notificações</h3>
          <button 
            onClick={onMarkAllRead}
            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Marcar todas como lidas
          </button>
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {sortedNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_off</span>
              <p className="text-xs">Nenhuma notificação nova.</p>
            </div>
          ) : (
            sortedNotifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => onReadAndNavigate(notif)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 flex gap-3 items-start relative ${!notif.read ? 'bg-blue-50/30' : 'bg-white'}`}
              >
                {/* Status Dot for Unread */}
                {!notif.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-sm"></span>
                )}

                <div className="relative shrink-0">
                    <div 
                        className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200"
                        style={{ backgroundImage: `url("${notif.senderUser.avatar}")` }}
                    ></div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md ${getTypeStyles(notif.type)}`}>
                        {getIcon(notif.type)}
                    </div>
                </div>

                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            notif.type === 'mention' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            notif.type === 'internal_message' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                            {getLabel(notif.type)}
                        </span>
                        <span className="text-[10px] text-gray-400">{notif.time}</span>
                    </div>
                    <h4 className={`text-sm text-text-main mb-0.5 leading-tight ${!notif.read ? 'font-bold' : 'font-medium'}`}>
                        {notif.title}
                    </h4>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {notif.text}
                    </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-center">
            <button className="text-xs font-bold text-gray-500 hover:text-text-main transition-colors">
                Ver histórico completo
            </button>
        </div>
      </div>
    </>
  );
};
