import React, { useState, useRef, useEffect } from 'react';
import { Task, User, TaskComment, ChecklistItem, Message } from '../types';

interface SidebarRightTasksProps {
  tasks: Task[];
  onAddTask: () => void;
  currentUser: User;
  onUpdateTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onNavigateToMessage: (messageId: string) => void;
  onEditTask: (task: Task) => void;
}

// Consistent colors based on string hash (same as in Modal)
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

export const SidebarRightTasks: React.FC<SidebarRightTasksProps> = ({ 
  tasks, 
  onAddTask,
  currentUser,
  onUpdateTask,
  onArchiveTask,
  onNavigateToMessage,
  onEditTask
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  
  // Tag state
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  
  // Menu states
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isAutomationMenuOpen, setIsAutomationMenuOpen] = useState(false);
  const [activeStatusMenuTaskId, setActiveStatusMenuTaskId] = useState<string | null>(null);
  
  // Mention State
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState<'status' | 'assignee' | 'tags' | null>(null);
  const [filterCriteria, setFilterCriteria] = useState<{
    status: string | null;
    assignee: string | null;
    tag: string | null;
  }>({ status: null, assignee: null, tag: null });

  const statusMenuRef = useRef<HTMLDivElement>(null);
  const automationMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const tagInputContainerRef = useRef<HTMLDivElement>(null); // New Ref for tag input area

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Derived data for filters and mentions
  const uniqueAssignees = Array.from(new Map(tasks.flatMap(t => t.assignees).map(u => [u.id, u])).values());
  const uniqueTags = Array.from(new Set(tasks.flatMap(t => t.tags)));

  // Auto scroll comments
  useEffect(() => {
    if (selectedTask && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTask?.comments, selectedTaskId]);

  // Handle outside click for Menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      
      if (statusMenuRef.current && !statusMenuRef.current.contains(target as Node)) {
        setIsStatusMenuOpen(false);
      }
      if (automationMenuRef.current && !automationMenuRef.current.contains(target as Node)) {
        setIsAutomationMenuOpen(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(target as Node)) {
        setActiveFilter(null);
      }
      // Close tag input if clicked outside
      if (tagInputContainerRef.current && !tagInputContainerRef.current.contains(target as Node)) {
        setIsAddingTag(false);
        setNewTagText('');
      }
      // Close quick status menu if clicking outside any trigger
      if (!target.closest('.status-menu-trigger')) {
        setActiveStatusMenuTaskId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getStatusColor = (status: Task['status']) => {
    switch(status) {
      case 'Pendente': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Em Progresso': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Aprovado': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const updateStatus = (status: Task['status'], taskToUpdate: Task = selectedTask!) => {
    onUpdateTask({ ...taskToUpdate, status: status });
    setIsStatusMenuOpen(false);
  };

  const handleQuickStatusUpdate = (newStatus: Task['status'], task: Task) => {
    onUpdateTask({ ...task, status: newStatus });
    setActiveStatusMenuTaskId(null);
  };

  // --- ACTIONS ---

  const handleArchive = () => {
    if (selectedTask) {
      if(window.confirm('Deseja realmente arquivar esta tarefa?')) {
        onArchiveTask(selectedTask.id);
        setSelectedTaskId(null);
      }
    }
  }

  const handleIntegration = (platform: string) => {
    alert(`Integração iniciada: Enviando dados para ${platform}...`);
    setIsAutomationMenuOpen(false);
  }

  // --- CHECKLIST ---

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newChecklistItem.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistItem,
      completed: false
    };

    const updatedTask = {
      ...selectedTask,
      checklist: [...selectedTask.checklist, newItem]
    };
    
    onUpdateTask(updatedTask);
    setNewChecklistItem('');
  };

  const toggleChecklist = (itemId: string) => {
    if (!selectedTask) return;

    const updatedTask = {
      ...selectedTask,
      checklist: selectedTask.checklist.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    };
    onUpdateTask(updatedTask);
  };

  const deleteChecklist = (itemId: string) => {
    if (!selectedTask) return;
    const updatedTask = {
      ...selectedTask,
      checklist: selectedTask.checklist.filter(item => item.id !== itemId)
    };
    onUpdateTask(updatedTask);
  };

  // --- TAGS ---
  
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newTagText.trim()) return;
    
    const textToAdd = newTagText.trim();
    
    // Check if tag already exists (case insensitive) to prevent duplicates like "Design" and "design"
    const existingTag = uniqueTags.find(t => t.toLowerCase() === textToAdd.toLowerCase());
    const finalTag = existingTag || textToAdd;

    if (selectedTask.tags.includes(finalTag)) {
      setNewTagText('');
      setIsAddingTag(false);
      return;
    }

    const updatedTask = {
        ...selectedTask,
        tags: [...selectedTask.tags, finalTag]
    };
    onUpdateTask(updatedTask);
    setNewTagText('');
    setIsAddingTag(false);
  };

  const handleSelectExistingTag = (tag: string) => {
    if (!selectedTask) return;
    if (selectedTask.tags.includes(tag)) {
        setNewTagText('');
        setIsAddingTag(false);
        return;
    }
    const updatedTask = {
        ...selectedTask,
        tags: [...selectedTask.tags, tag]
    };
    onUpdateTask(updatedTask);
    setNewTagText('');
    setIsAddingTag(false);
  }

  const removeTag = (tagToRemove: string) => {
    if (!selectedTask) return;
    const updatedTask = {
        ...selectedTask,
        tags: selectedTask.tags.filter(tag => tag !== tagToRemove)
    };
    onUpdateTask(updatedTask);
  };

  // --- COMMENTS & MENTIONS ---

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);

    // Simple mention detection: Check if the current word being typed starts with @
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const words = textBeforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];

    if (currentWord.startsWith('@')) {
      setMentionQuery(currentWord.slice(1));
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (userName: string) => {
    if (!commentInputRef.current) return;
    
    const cursorPosition = commentInputRef.current.selectionStart;
    const textBeforeCursor = newComment.slice(0, cursorPosition);
    const textAfterCursor = newComment.slice(cursorPosition);
    
    // Find where the last '@' started
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textPreMention = textBeforeCursor.slice(0, lastAtIndex);
    
    const newText = `${textPreMention}@${userName} ${textAfterCursor}`;
    
    setNewComment(newText);
    setMentionQuery(null);
    
    // Focus back and set cursor
    setTimeout(() => {
        if (commentInputRef.current) {
            commentInputRef.current.focus();
            // Optional: Set cursor position after the inserted name
        }
    }, 0);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;

    const comment: TaskComment = {
      id: Date.now().toString(),
      text: newComment,
      sender: currentUser,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedTask = {
      ...selectedTask,
      comments: [...selectedTask.comments, comment],
      commentsCount: selectedTask.commentsCount + 1
    };

    onUpdateTask(updatedTask);
    setNewComment('');
    setMentionQuery(null);
  };

  const renderSourceMessageSnippet = (message: Message, context: 'comment-me' | 'comment-other' | 'standalone' = 'standalone') => {
    let bgClass = "bg-gray-50";
    let borderClass = "border-l-[4px] border-gray-300";
    let textClass = "text-gray-500";
    
    if (context === 'comment-me') {
      bgClass = "bg-white/50"; 
      borderClass = "border-l-[4px] border-blue-400";
      textClass = "text-blue-600";
    } else if (context === 'comment-other') {
      bgClass = "bg-gray-50";
      borderClass = "border-l-[4px] border-orange-500";
      textClass = "text-orange-600";
    } else {
        bgClass = "bg-gray-50 border border-gray-200";
        borderClass = "border-l-[4px] border-primary";
        textClass = "text-primary-dark";
    }

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onNavigateToMessage(message.id);
        }}
        className={`${bgClass} ${borderClass} rounded-lg p-2 mb-1.5 cursor-pointer hover:opacity-80 transition-opacity select-none`}
      >
        <span className={`text-[11px] font-bold ${textClass} block mb-0.5 leading-none`}>
          {message.isMe ? 'Você' : 'Cliente'}
        </span>
        <p className="text-xs text-text-main/70 line-clamp-1 truncate">
          {message.text || (message.imageUrl ? '📷 Imagem' : '...')}
        </p>
      </div>
    );
  };

  // Format Date for Display
  const formatDateDisplay = (dateStr?: string) => {
      if (!dateStr) return '';
      try {
          const date = new Date(dateStr + 'T00:00:00');
          return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
      } catch (e) {
          return dateStr;
      }
  }

  // --- DETAIL VIEW ---
  if (selectedTask) {
    const completedCount = selectedTask.checklist.filter(c => c.completed).length;
    const totalCount = selectedTask.checklist.length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Filter tags for suggestions (excluding tags already added to this task)
    // Show all tags if input is empty, otherwise filter
    const availableTags = uniqueTags.filter(t => 
        !selectedTask.tags.includes(t) && 
        (newTagText === '' || t.toLowerCase().includes(newTagText.toLowerCase()))
    );

    return (
      <>
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-200 shadow-xl relative z-10 border-l border-neutral-border">
          {/* Detail Header */}
          <div className="px-5 py-3 border-b border-neutral-border flex items-center justify-between shrink-0 bg-white z-20 h-[60px]">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedTaskId(null)}
                className="p-1.5 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
               {/* Automation Button / Menu */}
               <div className="relative" ref={automationMenuRef}>
                 <button 
                  onClick={() => setIsAutomationMenuOpen(!isAutomationMenuOpen)}
                  className={`p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 border border-transparent hover:border-yellow-200 transition-all group ${isAutomationMenuOpen ? 'bg-yellow-50 border-yellow-200' : ''}`}
                  title="Automações e Integrações"
                >
                   <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform fill-current">bolt</span>
                </button>
                {isAutomationMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-50 animate-in zoom-in-95 duration-100 origin-top-right">
                        <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider border-b border-gray-50 mb-1">Integrar com</div>
                        
                        <button onClick={() => handleIntegration('Trello')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-main hover:bg-blue-50 hover:text-blue-700 transition-colors group/item">
                            <span className="material-symbols-outlined text-[18px] text-blue-500 group-hover/item:text-blue-700">view_kanban</span>
                            Trello
                        </button>
                        
                        <button onClick={() => handleIntegration('ClickUp')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-main hover:bg-purple-50 hover:text-purple-700 transition-colors group/item">
                            <span className="material-symbols-outlined text-[18px] text-purple-500 group-hover/item:text-purple-700">check_circle</span>
                            ClickUp
                        </button>

                        <button onClick={() => handleIntegration('Monday')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-main hover:bg-red-50 hover:text-red-700 transition-colors group/item">
                             <span className="material-symbols-outlined text-[18px] text-red-500 group-hover/item:text-red-700">table_chart</span>
                            Monday
                        </button>
                    </div>
                )}
               </div>
              
              {/* Edit Button */}
              <button 
                onClick={() => onEditTask(selectedTask)}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
                title="Editar Task"
              >
                 <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>

              {/* Archive Button */}
              <button 
                onClick={handleArchive}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                title="Arquivar Task"
              >
                 <span className="material-symbols-outlined text-[20px]">archive</span>
              </button>

              <div className="w-px h-4 bg-gray-200 mx-1"></div>

              {/* IMPROVED STATUS MENU */}
              <div className="relative" ref={statusMenuRef}>
                <button
                  onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                  className={`flex items-center gap-2 ${getStatusColor(selectedTask.status)} border text-xs px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide hover:shadow-md transition-all`}
                >
                    {selectedTask.status}
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>

                {isStatusMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-50 animate-in zoom-in-95 duration-100 origin-top-right">
                        <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">Alterar Status</div>
                        {[
                            { label: 'Pendente', icon: 'schedule', color: 'text-orange-600', bg: 'hover:bg-orange-50' },
                            { label: 'Em Progresso', icon: 'pending', color: 'text-blue-600', bg: 'hover:bg-blue-50' },
                            { label: 'Aprovado', icon: 'check_circle', color: 'text-green-600', bg: 'hover:bg-green-50' }
                        ].map((opt) => (
                            <button
                                key={opt.label}
                                onClick={() => updateStatus(opt.label as Task['status'])}
                                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-text-main transition-colors ${opt.bg} ${selectedTask.status === opt.label ? 'bg-gray-100' : ''}`}
                            >
                                <span className={`material-symbols-outlined text-[18px] ${opt.color}`}>{opt.icon}</span>
                                {opt.label}
                                {selectedTask.status === opt.label && <span className="material-symbols-outlined text-[16px] ml-auto text-gray-400">check</span>}
                            </button>
                        ))}
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Container - Split View */}
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* UPPER SECTION: Details Only */}
            <div className="shrink-0 p-5 bg-white shadow-sm z-10">
              
              {/* Title */}
              <h2 className="text-lg font-bold text-text-main mb-3 leading-tight">{selectedTask.title}</h2>
              
              {/* Row 1: Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4 relative z-50">
                {selectedTask.tags.map(tag => (
                    <div key={tag} className={`group/tag flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${getTagStyles(tag)}`}>
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-600 hover:scale-110 transition-all opacity-60 hover:opacity-100">
                            <span className="material-symbols-outlined text-[14px] flex">cancel</span>
                        </button>
                    </div>
                ))}
                
                {isAddingTag ? (
                    <div ref={tagInputContainerRef} className="relative flex flex-col animate-in fade-in zoom-in-95 duration-200">
                         {/* Styled Input Container with Plus Button integrated */}
                         <div className="relative group">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[16px]">tag</span>
                            <input 
                                autoFocus
                                type="text"
                                value={newTagText}
                                onChange={e => setNewTagText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTag(e);
                                    if (e.key === 'Escape') { setIsAddingTag(false); setNewTagText(''); }
                                }}
                                className="w-48 pl-8 pr-8 py-1.5 text-xs border border-primary ring-2 ring-primary/10 rounded-lg outline-none shadow-lg text-text-main font-medium bg-white transition-all"
                                placeholder="Nova tag..."
                            />
                            {/* Action Button inside Input */}
                            <button 
                                onClick={handleAddTag}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-primary hover:bg-gray-50 transition-colors"
                                title="Adicionar (Enter)"
                            >
                                <span className="material-symbols-outlined text-[18px]">{newTagText ? 'check_circle' : 'add_circle'}</span>
                            </button>
                        </div>

                        {/* EXISTING TAGS SUGGESTIONS */}
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1">
                            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{newTagText ? 'Sugestões' : 'Existentes'}</span>
                                <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 rounded">ESC para sair</span>
                            </div>
                            <div className="max-h-40 overflow-y-auto custom-scrollbar p-1">
                                {availableTags.length === 0 && (
                                    <div className="px-3 py-3 text-xs text-gray-400 italic text-center">
                                        {newTagText ? (
                                            <span className="flex items-center justify-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">add</span>
                                                Criar "{newTagText}"
                                            </span>
                                        ) : 'Nenhuma tag disponível'}
                                    </div>
                                )}
                                {availableTags.map(tag => (
                                    <button 
                                        key={tag}
                                        onClick={() => handleSelectExistingTag(tag)}
                                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-gray-50 text-text-main flex items-center gap-2 transition-colors group/opt"
                                    >
                                        <span className={`w-2 h-2 rounded-full ${getTagStyles(tag).split(' ')[0]}`}></span>
                                        <span className="font-medium">{tag}</span>
                                        <span className="material-symbols-outlined text-[16px] ml-auto text-gray-300 opacity-0 group-hover/opt:opacity-100 transition-opacity text-primary">add_circle</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsAddingTag(true)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white text-gray-500 hover:text-primary hover:border-primary rounded-full text-[11px] font-medium border border-dashed border-gray-300 transition-all hover:shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Tag
                    </button>
                )}
              </div>

              {/* Row 2: Metadata Footer (Due Date, Assignees, Checklist) */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 relative z-10">
                <div className="flex items-center gap-3">
                    {/* Due Date */}
                    {selectedTask.dueDate && (
                        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold border border-red-100 shadow-sm" title="Prazo de Entrega">
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            {formatDateDisplay(selectedTask.dueDate)}
                        </div>
                    )}

                    {/* Assignee Stack */}
                    <div className="flex items-center gap-2 bg-gray-50 pl-1 pr-3 py-1.5 rounded-full border border-gray-200" title="Responsáveis">
                        <div className="flex items-center -space-x-2">
                            {selectedTask.assignees.slice(0, 3).map((assignee, index) => (
                                <div 
                                    key={index}
                                    className="bg-center bg-no-repeat bg-cover rounded-full h-7 w-7 border-2 border-white shadow-sm relative z-10 hover:z-20 hover:scale-110 transition-transform" 
                                    style={{ backgroundImage: `url("${assignee.avatar}")` }}
                                    title={assignee.name}
                                ></div>
                            ))}
                            {selectedTask.assignees.length > 3 && (
                                <div className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-600 relative z-0">
                                    +{selectedTask.assignees.length - 3}
                                </div>
                            )}
                        </div>
                         {selectedTask.assignees.length > 0 && (
                             <span className="text-xs font-medium text-text-main truncate max-w-[80px] hidden sm:block">
                                {selectedTask.assignees.length === 1 ? selectedTask.assignees[0].name.split(' ')[0] : 'Equipe'}
                             </span>
                         )}
                    </div>
                </div>

                {/* Checklist Button */}
                <button 
                  onClick={() => setIsChecklistOpen(true)}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-text-secondary px-3 py-1.5 rounded-lg border border-gray-200 transition-all hover:border-primary/50 group hover:shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:text-primary">check_box</span>
                  <span className="text-xs font-medium">
                    Checklist <span className="text-gray-400 font-normal ml-0.5">({completedCount}/{totalCount})</span>
                  </span>
                </button>
              </div>
            </div>

            {/* LOWER SECTION: Internal Chat Interface */}
            <div className="flex-1 flex flex-col bg-chat-bg-internal relative border-t border-gray-200 min-h-0 z-0">
              
              {/* Chat Header */}
              <div className="px-4 py-2 bg-white/50 backdrop-blur-sm border-b border-gray-200/50 flex items-center gap-2 z-10 shrink-0">
                 <span className="material-symbols-outlined text-text-secondary text-[16px]">forum</span>
                 <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Discussão Interna</span>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2 relative z-10">
                {selectedTask.comments.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-60">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                       <span className="material-symbols-outlined text-2xl text-gray-400">lock</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Equipe apenas</p>
                  </div>
                ) : (
                  selectedTask.comments.map(comment => {
                    const isMe = comment.sender.id === currentUser.id;
                    const parts = comment.text.split(/(@\w+(?:\s\w+)?)/g); // Simple split for highlighting

                    return (
                      <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full animate-in slide-in-from-bottom-2 duration-200`}>
                        <div className={`p-2 rounded-lg shadow-sm text-sm relative max-w-[90%] min-w-[120px] border ${
                          isMe 
                            ? 'bg-blue-50 text-text-main border-blue-100 rounded-tr-none' 
                            : 'bg-white text-text-main border-gray-200 rounded-tl-none'
                        }`}>
                          {/* Source Message Preview inside Comment */}
                          {comment.sourceMessage && renderSourceMessageSnippet(comment.sourceMessage, isMe ? 'comment-me' : 'comment-other')}

                          {/* Sender Name for Others */}
                          {!isMe && (
                            <div className="text-[10px] font-bold text-slate-600 mb-0.5 leading-tight px-1">
                              {comment.sender.name}
                            </div>
                          )}
                          
                          <p className="whitespace-pre-wrap leading-relaxed text-sm mb-1 px-1">
                            {parts.map((part, index) => 
                                part.startsWith('@') ? <span key={index} className="text-blue-600 font-bold bg-blue-50 px-1 rounded">{part}</span> : part
                            )}
                          </p>
                          
                          {/* Timestamp & Status */}
                          <div className="flex items-center justify-end gap-1 select-none px-1">
                            <span className="text-[9px] text-gray-400">{comment.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleAddComment} className="p-3 bg-white border-t border-gray-200 z-10 relative">
                
                {/* MENTION DROPDOWN */}
                {mentionQuery !== null && (
                    <div className="absolute bottom-full left-3 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-bottom-2">
                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mencionar</span>
                             <span className="text-[10px] text-gray-400">@{mentionQuery}</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                            {uniqueAssignees
                                .filter(u => u.name.toLowerCase().includes(mentionQuery!.toLowerCase()))
                                .map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => insertMention(user.name.split(' ')[0])} // Just first name for simplicity
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                >
                                    <div 
                                        className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 border border-gray-200 group-hover:border-blue-200" 
                                        style={{ backgroundImage: `url("${user.avatar}")` }}
                                    ></div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-bold text-text-main group-hover:text-blue-700">{user.name}</span>
                                        <span className="text-[10px] text-gray-400">@{user.name.toLowerCase().replace(/\s/g, '')}</span>
                                    </div>
                                </button>
                            ))}
                            {uniqueAssignees.filter(u => u.name.toLowerCase().includes(mentionQuery!.toLowerCase())).length === 0 && (
                                <div className="px-4 py-3 text-xs text-gray-400 text-center italic">
                                    Ninguém encontrado...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 items-end">
                  <div className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl flex items-center px-3 py-1.5 focus-within:ring-1 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all shadow-inner">
                    <button type="button" className="text-gray-400 hover:text-gray-600 p-1 mr-1">
                      <span className="material-symbols-outlined text-[20px]">mood</span>
                    </button>
                    <textarea 
                      ref={commentInputRef}
                      value={newComment}
                      onChange={handleCommentChange}
                      placeholder="Comentário interno (use @ para mencionar)..."
                      rows={1}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none resize-none max-h-24 py-1.5 placeholder:text-gray-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                           if (mentionQuery !== null) {
                               e.preventDefault(); // Prevent submit if selecting mention via keyboard (basic impl)
                               // Ideally handle arrow keys here
                           } else {
                               e.preventDefault();
                               handleAddComment(e);
                           }
                        }
                      }}
                    />
                    <button type="button" className="text-gray-400 hover:text-gray-600 p-1 ml-1">
                      <span className="material-symbols-outlined text-[20px]">attach_file</span>
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full h-[40px] w-[40px] flex items-center justify-center transition-all shadow-sm shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px] ml-0.5">send</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* CHECKLIST MODAL (Unchanged) */}
        {isChecklistOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px] p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 flex flex-col max-h-[80%] animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
                <h3 className="font-bold text-text-main flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">check_box</span>
                  Checklist
                </h3>
                <button 
                  onClick={() => setIsChecklistOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Progress */}
              <div className="px-4 pt-3">
                <div className="flex justify-between items-end mb-1">
                   <span className="text-xs font-medium text-gray-500">Progresso</span>
                   <span className="text-xs font-bold text-text-main">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {selectedTask.checklist.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-4">Nenhum item na lista ainda.</p>
                )}
                {selectedTask.checklist.map(item => (
                  <div key={item.id} className="group flex items-start gap-3 p-2 rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white transition-all">
                    <button 
                      onClick={() => toggleChecklist(item.id)}
                      className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${item.completed ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'}`}
                    >
                      {item.completed && <span className="material-symbols-outlined text-[12px]">check</span>}
                    </button>
                    <span className={`text-sm flex-1 leading-tight mt-0.5 ${item.completed ? 'text-gray-400 line-through' : 'text-text-main'}`}>
                      {item.text}
                    </span>
                    <button 
                      onClick={() => deleteChecklist(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Input */}
              <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                 <form onSubmit={handleAddChecklist} className="relative">
                  <input 
                    type="text" 
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Adicionar item..."
                    className="w-full pl-3 pr-9 py-2 text-sm bg-white border border-gray-200 focus:border-primary rounded-lg transition-all outline-none shadow-sm placeholder:text-gray-400"
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    disabled={!newChecklistItem.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary disabled:text-gray-300 transition-colors hover:scale-110"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-border bg-white flex justify-between items-center shrink-0 h-[65px]">
        <h2 className="text-text-main font-bold text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary">folder_open</span>
          Tasks do Projeto
        </h2>
        <button 
          onClick={onAddTask}
          className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm active:scale-95 transform"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nova Task
        </button>
      </div>

      {/* CUSTOM FILTERS - UPDATED UI */}
      {/* Removed overflow-x-auto to prevent clipping of absolute dropdowns */}
      <div className="px-5 py-3 border-b border-neutral-border/50 bg-white/50 flex flex-wrap gap-2 backdrop-blur-sm sticky top-0 z-30" ref={filterMenuRef}>
        
        {/* Status Filter */}
        <div className="relative">
          <button 
            onClick={() => setActiveFilter(activeFilter === 'status' ? null : 'status')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all shadow-sm ${filterCriteria.status ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-text-main hover:border-gray-300'}`}
          >
            {filterCriteria.status || 'Status'}
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
          
          {activeFilter === 'status' && (
             <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider mb-1">Filtrar por Status</div>
                <button 
                  onClick={() => { setFilterCriteria({...filterCriteria, status: null}); setActiveFilter(null); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-text-secondary transition-colors"
                >
                  Todos
                </button>
                {['Pendente', 'Em Progresso', 'Aprovado'].map(status => (
                  <button 
                    key={status}
                    onClick={() => { setFilterCriteria({...filterCriteria, status}); setActiveFilter(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-text-main transition-colors"
                  >
                     <span className={`w-2 h-2 rounded-full ${status === 'Pendente' ? 'bg-orange-500' : status === 'Em Progresso' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                     {status}
                  </button>
                ))}
             </div>
          )}
        </div>

        {/* Assignee Filter */}
        <div className="relative">
          <button 
            onClick={() => setActiveFilter(activeFilter === 'assignee' ? null : 'assignee')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all shadow-sm ${filterCriteria.assignee ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-text-main hover:border-gray-300'}`}
          >
             {filterCriteria.assignee ? 'Resp: ' + uniqueAssignees.find(u => u.id === filterCriteria.assignee)?.name.split(' ')[0] : 'Responsável'}
             <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>

          {activeFilter === 'assignee' && (
             <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider mb-1">Filtrar por Pessoa</div>
                <button 
                  onClick={() => { setFilterCriteria({...filterCriteria, assignee: null}); setActiveFilter(null); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-text-secondary transition-colors"
                >
                  Todos
                </button>
                {uniqueAssignees.map(user => (
                   <button 
                    key={user.id}
                    onClick={() => { setFilterCriteria({...filterCriteria, assignee: user.id}); setActiveFilter(null); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                     <div 
                        className="bg-center bg-no-repeat bg-cover rounded-full h-6 w-6 border border-gray-200" 
                        style={{ backgroundImage: `url("${user.avatar}")` }}
                    ></div>
                     <span className="text-sm font-medium text-text-main">{user.name}</span>
                  </button>
                ))}
             </div>
          )}
        </div>

        {/* Tag Filter */}
        <div className="relative">
          <button 
            onClick={() => setActiveFilter(activeFilter === 'tags' ? null : 'tags')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all shadow-sm ${filterCriteria.tag ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-text-main hover:border-gray-300'}`}
          >
             {filterCriteria.tag ? '#' + filterCriteria.tag : 'Etiqueta'}
             <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>

          {activeFilter === 'tags' && (
             <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider mb-1">Filtrar por Tag</div>
                <button 
                  onClick={() => { setFilterCriteria({...filterCriteria, tag: null}); setActiveFilter(null); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-text-secondary transition-colors"
                >
                  Todas
                </button>
                {uniqueTags.length === 0 && <div className="px-3 py-2 text-xs text-gray-400 italic">Nenhuma tag criada</div>}
                {uniqueTags.map(tag => (
                   <button 
                    key={tag}
                    onClick={() => { setFilterCriteria({...filterCriteria, tag}); setActiveFilter(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 text-text-main transition-colors"
                  >
                     <span className={`w-3 h-3 rounded-full mr-1 ${getTagStyles(tag).split(' ')[0]}`}></span>
                     {tag}
                  </button>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
        {tasks
         .filter(t => !filterCriteria.status || t.status === filterCriteria.status)
         .filter(t => !filterCriteria.assignee || t.assignees.some(u => u.id === filterCriteria.assignee))
         .filter(t => !filterCriteria.tag || t.tags.includes(filterCriteria.tag!))
         .map(task => (
          <div 
            key={task.id} 
            onClick={() => setSelectedTaskId(task.id)}
            className={`bg-white p-4 rounded-xl shadow-card hover:shadow-card-hover border border-transparent hover:border-primary/20 transition-all cursor-pointer group relative ${task.status === 'Aprovado' ? 'opacity-75 bg-gray-50' : ''}`}
          >
            {/* Unread Task Comments Badge */}
            {(task.unreadCommentsCount && task.unreadCommentsCount > 0) ? (
                <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm z-10 ring-2 ring-white">
                    {task.unreadCommentsCount}
                </div>
            ) : null}

            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                
                {/* NEW CUSTOM STATUS DROPDOWN (Replaces native select) */}
                <div className="relative status-menu-trigger">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveStatusMenuTaskId(activeStatusMenuTaskId === task.id ? null : task.id);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm group/btn"
                    >
                        <div className={`w-2 h-2 rounded-full ${
                            task.status === 'Pendente' ? 'bg-orange-500' :
                            task.status === 'Em Progresso' ? 'bg-blue-500' :
                            'bg-green-500'
                        }`}></div>
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide group-hover/btn:text-text-main">{task.status}</span>
                        <span className="material-symbols-outlined text-[12px] text-gray-400">expand_more</span>
                    </button>

                    {activeStatusMenuTaskId === task.id && (
                        <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-50 animate-in zoom-in-95 duration-100 origin-top-left">
                            {['Pendente', 'Em Progresso', 'Aprovado'].map((s) => (
                                <button
                                    key={s}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickStatusUpdate(s as Task['status'], task);
                                    }}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50 ${task.status === s ? 'bg-gray-50 text-black font-bold' : 'text-gray-600'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        s === 'Pendente' ? 'bg-orange-500' :
                                        s === 'Em Progresso' ? 'bg-blue-500' :
                                        'bg-green-500'
                                    }`}></div>
                                    {s}
                                    {task.status === s && <span className="material-symbols-outlined text-[14px] ml-auto">check</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
              </div>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">{task.date}</span>
            </div>
            
            <h3 className="text-sm font-bold text-text-main mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{task.title}</h3>
            
             {/* TAGS ROW - MOVED BELOW TITLE */}
             {task.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {task.tags.map(tag => (
                    <span key={tag} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTagStyles(tag)}`}>
                        {tag}
                    </span>
                    ))}
                </div>
            )}

            {/* BOTTOM ROW: Deadline + Assignees + Checklist + Comments */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-3">
                    {/* Due Date */}
                    {task.dueDate && (
                        <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded border border-red-100" title="Prazo">
                            <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                            {formatDateDisplay(task.dueDate)}
                        </div>
                    )}

                    {/* Assignees */}
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                            {task.assignees.slice(0, 3).map((assignee, index) => (
                                <div 
                                    key={index}
                                    className="bg-center bg-no-repeat bg-cover rounded-full h-6 w-6 border-2 border-white shadow-sm" 
                                    style={{ backgroundImage: `url("${assignee.avatar || 'https://via.placeholder.com/24'}")` }}
                                    title={assignee.name}
                                ></div>
                            ))}
                            {task.assignees.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                                    +{task.assignees.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                     {task.checklist.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100" title="Checklist">
                            <span className="material-symbols-outlined text-[14px]">check_box</span> 
                            <span className="font-medium">{task.checklist.filter(c => c.completed).length}/{task.checklist.length}</span>
                        </div>
                    )}
                     {/* Comments */}
                     <div className="flex items-center gap-1 text-gray-400 text-xs">
                         <span className="material-symbols-outlined text-[14px]">chat_bubble</span> {task.commentsCount}
                     </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};