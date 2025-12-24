import React, { useState, useEffect, useRef } from 'react';
import { User, Task, Message } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, assigneeIds: string[], dueDate: string, status: Task['status'], sourceMessage?: Message) => void;
  onEdit: (taskId: string, title: string, description: string, assigneeIds: string[], dueDate: string, status: Task['status']) => void;
  onAttach: (taskId: string, comment: string, sourceMessage?: Message) => void;
  users: User[];
  existingTasks: Task[];
  initialMessage?: Message | null;
  taskToEdit?: Task | null;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onEdit,
  onAttach,
  users, 
  existingTasks,
  initialMessage,
  taskToEdit
}) => {
  const [mode, setMode] = useState<'create' | 'existing' | 'edit'>('create');
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<Task['status']>('Pendente');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  
  // Dropdown States
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const topicDropdownRef = useRef<HTMLDivElement>(null);

  // Existing Mode State
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [comment, setComment] = useState('');

  // Handle click outside for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setIsAssigneeDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(event.target as Node)) {
        setIsTopicDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset or Preset state when opening
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setMode('edit');
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setDueDate(taskToEdit.dueDate || '');
        setStatus(taskToEdit.status);
        setSelectedAssigneeIds(taskToEdit.assignees.map(u => u.id));
      } else {
        setMode('create'); 
        setTitle('');
        setDescription('');
        setComment('');
        setDueDate('');
        setStatus('Pendente');
        setSelectedAssigneeIds([]);
        
        if (existingTasks.length > 0) {
          setSelectedTaskId(existingTasks[0].id);
        }
      }
    }
  }, [isOpen, existingTasks, taskToEdit]);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title, description, selectedAssigneeIds, dueDate, status, initialMessage || undefined);
      onClose();
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && taskToEdit) {
      onEdit(taskToEdit.id, title, description, selectedAssigneeIds, dueDate, status);
      onClose();
    }
  };

  const handleAttachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTaskId) {
      onAttach(selectedTaskId, comment, initialMessage || undefined);
      onClose();
    }
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssigneeIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Simplified color logic for cleaner UI
  const getStatusDotColor = (s: Task['status']) => {
    switch(s) {
      case 'Pendente': return 'bg-orange-500';
      case 'Em Progresso': return 'bg-blue-500';
      case 'Aprovado': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const senderName = initialMessage?.isMe ? 'Você' : users.find(u => u.id === initialMessage?.senderId)?.name || 'Cliente';
  const assignableUsers = users.filter(u => u.id !== 'techflow');
  const selectedTaskObj = existingTasks.find(t => t.id === selectedTaskId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] border border-gray-100">
        
        {/* Header */}
        <div className="px-8 py-5 flex justify-between items-center border-b border-gray-100 bg-white">
          <h3 className="font-bold text-text-main text-xl flex items-center gap-2 tracking-tight">
            {mode === 'edit' ? <span className="material-symbols-outlined text-primary text-2xl">edit_square</span> : <span className="material-symbols-outlined text-primary text-2xl">add_box</span>}
            {mode === 'edit' ? 'Editar Task' : 'Nova Atividade'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Message Context Preview */}
            {initialMessage && mode !== 'edit' && (
              <div className="px-8 mt-6">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                  <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-500">
                    <span className="material-symbols-outlined text-lg block">format_quote</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wide">{senderName}</div>
                    <div className="text-sm text-text-main italic leading-relaxed">
                        "{initialMessage.text || (initialMessage.imageUrl ? '📷 [Imagem]' : '')}"
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Radio Options (Styled as Cards) */}
            {!taskToEdit && (
              <div className="px-8 flex gap-3 my-6">
                <div 
                    onClick={() => setMode('create')}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${mode === 'create' ? 'border-black bg-gray-50 shadow-md scale-[1.02]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${mode === 'create' ? 'border-black' : 'border-gray-300'}`}>
                      {mode === 'create' && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                  </div>
                  <span className="text-sm font-bold text-text-main">Criar Nova Task</span>
                </div>

                <div 
                    onClick={() => setMode('existing')}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${mode === 'existing' ? 'border-black bg-gray-50 shadow-md scale-[1.02]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
                >
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${mode === 'existing' ? 'border-black' : 'border-gray-300'}`}>
                      {mode === 'existing' && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                  </div>
                  <span className="text-sm font-bold text-text-main">Vincular a Existente</span>
                </div>
              </div>
            )}
            
            {mode === 'existing' ? (
              <form onSubmit={handleAttachSubmit} className="px-8 pb-6 flex flex-col gap-5">
                <div ref={topicDropdownRef} className="relative">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Selecionar Tópico</label>
                  <button
                    type="button"
                    onClick={() => setIsTopicDropdownOpen(!isTopicDropdownOpen)}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-left flex items-center justify-between hover:border-gray-300 hover:shadow-sm focus:border-black focus:ring-1 focus:ring-black/5 transition-all outline-none"
                  >
                     {selectedTaskObj ? (
                        <span className="text-text-main font-medium truncate pr-2">
                             <span className="font-mono text-gray-400 mr-2">#{selectedTaskObj.code}</span>
                             {selectedTaskObj.title}
                        </span>
                     ) : (
                        <span className="text-gray-400">Selecione uma task...</span>
                     )}
                     <span className="material-symbols-outlined text-gray-400 text-[20px] shrink-0">expand_more</span>
                  </button>

                  {isTopicDropdownOpen && (
                     <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar p-1.5 animate-in fade-in zoom-in-95 duration-100">
                        {existingTasks.map(task => (
                           <div 
                              key={task.id}
                              onClick={() => { setSelectedTaskId(task.id); setIsTopicDropdownOpen(false); }}
                              className={`px-4 py-3 rounded-xl cursor-pointer transition-all flex items-center gap-2 ${selectedTaskId === task.id ? 'bg-black/5 font-medium' : 'hover:bg-gray-50 text-text-secondary'}`}
                           >
                              <span className="font-mono text-xs text-gray-400 shrink-0">#{task.code}</span>
                              <span className="truncate text-sm">{task.title}</span>
                              {selectedTaskId === task.id && <span className="material-symbols-outlined text-[16px] ml-auto text-black">check</span>}
                           </div>
                        ))}
                     </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Comentário</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-text-main focus:border-black focus:ring-1 focus:ring-black/5 focus:shadow-sm outline-none transition-all resize-none placeholder:text-gray-400"
                    placeholder="Escreva seu comentário aqui..."
                  />
                </div>
              </form>
            ) : (
              // CREATE OR EDIT FORM
              <form onSubmit={mode === 'edit' ? handleEditSubmit : handleCreateSubmit} className="px-8 pb-6 flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Título da Task</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-text-main focus:border-black focus:ring-1 focus:ring-black/5 focus:shadow-sm outline-none transition-all placeholder:text-gray-400"
                    placeholder="Ex: Corrigir erro no checkout"
                    required
                  />
                </div>

                {/* CUSTOM MULTI-SELECT ASSIGNEE - CLEANER UI */}
                <div className="relative" ref={assigneeDropdownRef}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Responsáveis</label>
                    <button
                        type="button"
                        onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-left flex items-center justify-between hover:border-gray-300 hover:shadow-sm focus:border-black focus:ring-1 focus:ring-black/5 transition-all outline-none min-h-[50px]"
                    >
                        {selectedAssigneeIds.length === 0 ? (
                            <span className="text-gray-400">Selecionar responsáveis...</span>
                        ) : (
                            <div className="flex flex-wrap gap-2 items-center">
                                {selectedAssigneeIds.map(id => {
                                    const user = users.find(u => u.id === id);
                                    return user ? (
                                        <div key={id} className="flex items-center gap-1.5 bg-white pl-1 pr-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
                                            <img 
                                                src={user.avatar} 
                                                alt={user.name} 
                                                className="h-5 w-5 rounded-full object-cover" 
                                            />
                                            <span className="text-xs font-medium text-text-main">{user.name.split(' ')[0]}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        )}
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">expand_more</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isAssigneeDropdownOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar p-1.5 animate-in fade-in zoom-in-95 duration-100">
                            {assignableUsers.map(user => {
                                const isSelected = selectedAssigneeIds.includes(user.id);
                                return (
                                    <div 
                                        key={user.id}
                                        onClick={() => toggleAssignee(user.id)}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                                                {isSelected && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                                        </div>
                                        <div 
                                            className="bg-center bg-no-repeat bg-cover rounded-full h-7 w-7 border border-gray-100 shrink-0" 
                                            style={{ backgroundImage: `url("${user.avatar}")` }}
                                        ></div>
                                        <span className={`text-sm ${isSelected ? 'font-bold text-text-main' : 'text-text-secondary'}`}>{user.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                    {/* STATUS DROPDOWN - CLEANER TRIGGER */}
                    <div className="relative" ref={statusDropdownRef}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Status</label>
                        <button
                            type="button"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className={`w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-left flex items-center justify-between hover:border-gray-300 hover:shadow-sm focus:border-black focus:ring-1 focus:ring-black/5 transition-all outline-none h-[46px]`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(status)}`}></div>
                                <span className="text-text-main font-medium">{status}</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">expand_more</span>
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-100">
                                {['Pendente', 'Em Progresso', 'Aprovado'].map((s) => {
                                    const dotColor = getStatusDotColor(s as Task['status']);
                                    return (
                                        <div 
                                            key={s}
                                            onClick={() => { setStatus(s as Task['status']); setIsStatusDropdownOpen(false); }}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${status === s ? 'bg-gray-50' : ''}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                                            <span className={`text-sm font-medium text-text-main`}>{s}</span>
                                            {status === s && <span className="material-symbols-outlined text-[16px] ml-auto text-black">check</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* DUE DATE */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Prazo</label>
                        <input 
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-text-main focus:border-black focus:ring-1 focus:ring-black/5 focus:shadow-sm outline-none transition-all h-[46px]"
                        />
                    </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                      {mode === 'edit' ? 'Descrição' : 'Descrição / Detalhes'}
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-text-main focus:border-black focus:ring-1 focus:ring-black/5 focus:shadow-sm outline-none transition-all resize-none placeholder:text-gray-400"
                    placeholder={mode === 'edit' ? "Descrição da tarefa..." : "Adicione detalhes..."}
                  />
                </div>
              </form>
            )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
            <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-text-main hover:bg-gray-200 transition-colors"
            >
            Cancelar
            </button>
            <button 
            onClick={mode === 'existing' ? handleAttachSubmit : (mode === 'edit' ? handleEditSubmit : handleCreateSubmit)}
            className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-black hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
            {mode === 'edit' ? 'Salvar Alterações' : (mode === 'existing' ? 'Adicionar Comentário' : 'Criar Task')}
            </button>
        </div>
      </div>
    </div>
  );
};