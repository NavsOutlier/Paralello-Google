import React, { useState, useEffect, useRef } from 'react';
import { User, Task, Message } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, assigneeIds: string[], dueDate: string, status: Task['status'], tags: string[], sourceMessage?: Message) => void;
  onEdit: (taskId: string, title: string, description: string, assigneeIds: string[], dueDate: string, status: Task['status'], tags: string[]) => void;
  onAttach: (taskId: string, comment: string, sourceMessage?: Message) => void;
  users: User[];
  existingTasks: Task[];
  initialMessage?: Message | null;
  taskToEdit?: Task | null;
}

// Consistent colors based on string hash
const getTagStyles = (tag: string) => {
  const colors = [
    'bg-red-50 text-red-700 border-red-200',
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-green-50 text-green-700 border-green-200',
    'bg-purple-50 text-purple-700 border-purple-200',
    'bg-orange-50 text-orange-700 border-orange-200',
    'bg-pink-50 text-pink-700 border-pink-200',
    'bg-indigo-50 text-indigo-700 border-indigo-200',
    'bg-teal-50 text-teal-700 border-teal-200',
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Status Colors (Pill Style)
const getStatusPillStyle = (status: Task['status']) => {
  switch(status) {
    case 'Pendente': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Em Progresso': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Aprovado': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

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
  
  // Tags State
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // Dropdown States
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const topicDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Existing Mode State
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [comment, setComment] = useState('');

  // Derived Data
  const allExistingTags = Array.from(new Set(existingTasks.flatMap(t => t.tags)));
  const suggestedTags = allExistingTags.filter(tag => 
    !tags.includes(tag) && 
    tag.toLowerCase().includes(tagInput.toLowerCase())
  );

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
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
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
        setTags(taskToEdit.tags || []);
      } else {
        setMode('create'); 
        setTitle('');
        setDescription('');
        setComment('');
        setDueDate('');
        setStatus('Pendente');
        setSelectedAssigneeIds([]);
        setTags([]);
        setTagInput('');
        
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
      onSave(title, description, selectedAssigneeIds, dueDate, status, tags, initialMessage || undefined);
      onClose();
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && taskToEdit) {
      onEdit(taskToEdit.id, title, description, selectedAssigneeIds, dueDate, status, tags);
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

  // Tag Handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        const newTag = tagInput.trim();
        if (!tags.includes(newTag)) {
          setTags([...tags, newTag]);
        }
        setTagInput('');
      }
    }
  };

  const selectTagFromList = (tag: string) => {
    if (!tags.includes(tag)) {
        setTags([...tags, tag]);
    }
    setTagInput('');
    setIsTagDropdownOpen(true); 
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssigneeIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
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
                  <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${mode === 'create' ? 'bg-black text-white' : 'text-gray-400'}`}>
                      <span className="material-symbols-outlined text-[18px]">add</span>
                  </div>
                  <span className="text-sm font-bold text-text-main">Criar Nova Task</span>
                </div>

                <div 
                    onClick={() => setMode('existing')}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${mode === 'existing' ? 'border-black bg-gray-50 shadow-md scale-[1.02]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
                >
                   <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${mode === 'existing' ? 'bg-black text-white' : 'text-gray-400'}`}>
                      <span className="material-symbols-outlined text-[18px]">question_answer</span>
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
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Comentário / Atualização</label>
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

                {/* CUSTOM MULTI-SELECT ASSIGNEE - UPDATED LAYOUT */}
                <div className="relative" ref={assigneeDropdownRef}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Responsáveis</label>
                    <div
                        onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-2 py-2 text-sm min-h-[50px] flex items-center justify-between cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group"
                    >
                         <div className="flex flex-wrap gap-1.5 flex-1 px-2">
                            {selectedAssigneeIds.length === 0 && (
                                <span className="text-gray-400 py-1">Selecionar responsáveis...</span>
                            )}
                            {selectedAssigneeIds.map(id => {
                                const user = users.find(u => u.id === id);
                                if (!user) return null;
                                return (
                                    <div key={id} className="flex items-center gap-1.5 bg-gray-50 pl-1 pr-2 py-1 rounded-full border border-gray-200">
                                         <div 
                                            className="bg-center bg-no-repeat bg-cover rounded-full h-5 w-5 border border-white" 
                                            style={{ backgroundImage: `url("${user.avatar}")` }}
                                        ></div>
                                        <span className="text-xs font-semibold text-text-main">{user.name.split(' ')[0]}</span>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleAssignee(user.id);
                                            }}
                                            className="ml-0.5 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center w-4 h-4"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                );
                            })}
                         </div>
                        <div className="px-2 text-gray-400 border-l border-gray-100 pl-2 ml-1 group-hover:text-gray-600 transition-colors">
                             <span className="material-symbols-outlined text-[20px] flex">expand_more</span>
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isAssigneeDropdownOpen && (
                        <div className="absolute z-30 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar p-2 animate-in fade-in zoom-in-95 duration-100">
                             <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider mb-1">Sugestões</div>
                            {assignableUsers.map(user => {
                                const isSelected = selectedAssigneeIds.includes(user.id);
                                return (
                                    <div 
                                        key={user.id}
                                        onClick={() => toggleAssignee(user.id)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 border border-gray-200 group-hover:border-gray-300 transition-colors" 
                                                style={{ backgroundImage: `url("${user.avatar}")` }}
                                            ></div>
                                            <div>
                                                <div className={`text-sm ${isSelected ? 'font-bold text-text-main' : 'font-medium text-text-main'}`}>{user.name}</div>
                                                <div className="text-[11px] text-gray-400">@{user.id}</div>
                                            </div>
                                        </div>
                                        
                                        {isSelected && (
                                            <div className="bg-black text-white rounded-full p-1 flex items-center justify-center">
                                                 <span className="material-symbols-outlined text-[14px]">check</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                    {/* STATUS DROPDOWN - UPDATED TO PILLS */}
                    <div className="relative" ref={statusDropdownRef}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Status</label>
                        <button
                            type="button"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className={`w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-left flex items-center justify-between hover:border-gray-300 hover:shadow-sm focus:border-black focus:ring-1 focus:ring-black/5 transition-all outline-none h-[50px]`}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusPillStyle(status)}`}>
                                    {status}
                                </span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">expand_more</span>
                        </button>

                        {isStatusDropdownOpen && (
                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-100">
                                {['Pendente', 'Em Progresso', 'Aprovado'].map((s) => {
                                    return (
                                        <div 
                                            key={s}
                                            onClick={() => { setStatus(s as Task['status']); setIsStatusDropdownOpen(false); }}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${status === s ? 'bg-gray-50' : ''}`}
                                        >
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusPillStyle(s as Task['status'])}`}>
                                                {s}
                                            </span>
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
                            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-text-main focus:border-black focus:ring-1 focus:ring-black/5 focus:shadow-sm outline-none transition-all h-[50px]"
                        />
                    </div>
                </div>

                 {/* TAGS SECTION WITH AUTOCOMPLETE */}
                 <div className="relative" ref={tagDropdownRef}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Etiquetas</label>
                    <div 
                        className="w-full bg-white border border-gray-200 rounded-2xl px-2 py-2 text-sm focus-within:border-black focus-within:ring-1 focus-within:ring-black/5 focus-within:shadow-sm transition-all flex flex-wrap gap-2 items-center min-h-[50px] cursor-text"
                        onClick={() => {
                            // Focus the input when clicking container
                            const inputEl = document.getElementById('tag-input-field');
                            if(inputEl) inputEl.focus();
                        }}
                    >
                        {tags.map(tag => (
                            <span 
                              key={tag} 
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${getTagStyles(tag)}`}
                            >
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </span>
                        ))}
                        <input 
                            id="tag-input-field"
                            type="text" 
                            value={tagInput}
                            onChange={(e) => {
                                setTagInput(e.target.value);
                                setIsTagDropdownOpen(true);
                            }}
                            onFocus={() => setIsTagDropdownOpen(true)}
                            onKeyDown={handleAddTag}
                            placeholder={tags.length === 0 ? "Adicionar tag (digite)..." : "Adicionar..."}
                            className="flex-1 min-w-[120px] bg-transparent outline-none border-none text-sm text-text-main placeholder:text-gray-400 ml-1"
                            autoComplete="off"
                        />
                    </div>

                    {/* Tag Suggestions Dropdown */}
                    {isTagDropdownOpen && (suggestedTags.length > 0 || tagInput) && (
                         <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar p-1.5 animate-in fade-in zoom-in-95 duration-100">
                            {suggestedTags.length > 0 && (
                                <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider mb-1">Sugestões</div>
                            )}
                            
                            {/* Option to add what user typed if it's new */}
                            {tagInput && !tags.includes(tagInput) && !suggestedTags.includes(tagInput) && (
                                 <button 
                                    type="button"
                                    onClick={() => {
                                        if (tagInput.trim()) {
                                            setTags([...tags, tagInput.trim()]);
                                            setTagInput('');
                                        }
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-text-main flex items-center gap-2 transition-colors mb-1"
                                >
                                    <span className="material-symbols-outlined text-[16px] text-gray-400">add</span>
                                    Criar "{tagInput}"
                                </button>
                            )}

                            {suggestedTags.map(tag => (
                                <button 
                                    key={tag}
                                    type="button"
                                    onClick={() => selectTagFromList(tag)}
                                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-text-main flex items-center gap-2 transition-colors"
                                >
                                    <span className={`w-2 h-2 rounded-full ${getTagStyles(tag).split(' ')[0]}`}></span>
                                    {tag}
                                </button>
                            ))}
                            
                            {suggestedTags.length === 0 && !tagInput && (
                                <div className="px-3 py-2 text-xs text-gray-400 italic text-center">
                                    Nenhuma tag encontrada
                                </div>
                            )}
                         </div>
                    )}
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
            className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-black hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
            >
             {mode === 'existing' && <span className="material-symbols-outlined text-[18px]">send</span>}
             {mode === 'create' && <span className="material-symbols-outlined text-[18px]">add</span>}
             {mode === 'edit' && <span className="material-symbols-outlined text-[18px]">save</span>}
            {mode === 'edit' ? 'Salvar' : (mode === 'existing' ? 'Adicionar Comentário' : 'Criar Task')}
            </button>
        </div>
      </div>
    </div>
  );
};