import React, { useState, useEffect } from 'react';
import { AppState, Schedule, Speaker } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Search, Plus, Trash2, Phone, MapPin, User, Calendar, Edit2, Save, X, MoreVertical } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SpeakersProps {
  state: AppState;
  onAddSpeaker: (speaker: Omit<Speaker, 'id' | 'isDeleted'>) => void;
  onUpdateSpeaker: (id: string, data: Partial<Speaker>) => void;
  onUpdateSchedule: (id: string, data: Partial<Schedule>) => void;
  onDeleteSpeaker: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
  highlightedSpeakerId?: string | null;
}

export const Speakers: React.FC<SpeakersProps> = ({ state, onAddSpeaker, onUpdateSpeaker, onUpdateSchedule, onDeleteSpeaker, onDeleteSchedule, highlightedSpeakerId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  
  // Highlight effect
  useEffect(() => {
    if (highlightedSpeakerId) {
        const speaker = state.speakers.find(s => s.id === highlightedSpeakerId);
        if (speaker) {
            setSearchTerm(speaker.name);
            // Optional: scroll into view logic could go here
        }
    }
  }, [highlightedSpeakerId, state.speakers]);

  // New Speaker Form State
  const [newName, setNewName] = useState('');
  const [newCongregation, setNewCongregation] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Edit Speaker Form State
  const [editName, setEditName] = useState('');
  const [editCongregation, setEditCongregation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  // Edit Schedule Form State: mapping scheduleId -> outlineNumber
  const [editedScheduleValues, setEditedScheduleValues] = useState<Record<string, number>>({});

  const filteredSpeakers = state.speakers.filter(s => 
    !s.isDeleted && 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.congregation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newCongregation) {
      onAddSpeaker({
        name: newName,
        congregation: newCongregation,
        phone: newPhone
      });
      setIsAdding(false);
      setNewName('');
      setNewCongregation('');
      setNewPhone('');
    }
  };

  const getSpeakerSchedules = (speakerId: string) => {
    return state.schedules
        .filter(s => s.speakerId === speakerId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const startEditing = (speaker: Speaker) => {
      setEditingSpeakerId(speaker.id);
      setEditName(speaker.name);
      setEditCongregation(speaker.congregation);
      setEditPhone(speaker.phone);
      
      // Load current outline numbers into temp state
      const speakerSchedules = getSpeakerSchedules(speaker.id);
      const initialScheduleMap: Record<string, number> = {};
      speakerSchedules.forEach(s => initialScheduleMap[s.id] = s.outlineNumber);
      setEditedScheduleValues(initialScheduleMap);
  };

  const saveEditing = (id: string) => {
      if (editName && editCongregation) {
          // Update Speaker Details
          onUpdateSpeaker(id, {
              name: editName,
              congregation: editCongregation,
              phone: editPhone
          });
          
          // Update Schedule Details
          Object.entries(editedScheduleValues).forEach(([schId, outlineNum]) => {
              if (outlineNum && outlineNum > 0) {
                onUpdateSchedule(schId, { outlineNumber: outlineNum });
              }
          });

          setEditingSpeakerId(null);
      }
  };
  
  const handleScheduleChange = (schId: string, newVal: number) => {
      setEditedScheduleValues(prev => ({
          ...prev,
          [schId]: newVal
      }));
  };

  if (isAdding) {
    return (
      <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4">
        <Card title="Cadastrar Orador">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded text-slate-900 dark:text-white focus:ring-2 focus:ring-[#bb9829] outline-none" required autoFocus />
            </div>
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Congregação</label>
              <input value={newCongregation} onChange={e => setNewCongregation(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded text-slate-900 dark:text-white focus:ring-2 focus:ring-[#bb9829] outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Telefone (Opcional)</label>
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded text-slate-900 dark:text-white focus:ring-2 focus:ring-[#bb9829] outline-none" placeholder="(11) 99999-9999" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">Oradores</h2>
           <p className="text-slate-500 dark:text-slate-400">Gerencie os oradores e suas congregações.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus size={18} className="mr-2" /> Novo Orador
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou congregação..." 
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-[#bb9829] outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
            <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 text-xs text-[#bb9829] hover:underline"
            >
                Limpar busca
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSpeakers.map(speaker => {
          const schedules = getSpeakerSchedules(speaker.id);
          const hasSchedules = schedules.length > 0;
          const isHighlighted = highlightedSpeakerId === speaker.id;
          const isEditing = editingSpeakerId === speaker.id;
          
          return (
            <div 
                key={speaker.id} 
                className={`
                    bg-white dark:bg-slate-800/50 border rounded-lg overflow-hidden transition-all group flex flex-col relative
                    ${isHighlighted 
                        ? 'border-[#bb9829] shadow-[0_0_15px_rgba(187,152,41,0.15)] ring-1 ring-[#bb9829]/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-[#bb9829]/50'}
                `}
            >   
                {/* Visual indicator for highlighted item */}
                {isHighlighted && <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-[#bb9829]/20 border-l-[40px] border-l-transparent pointer-events-none"></div>}

                <div className="p-6 flex-1">
                    {/* Header: Avatar and Actions */}
                    <div className="flex justify-between items-start mb-4">
                        <div className={`
                            w-20 h-20 rounded-full flex items-center justify-center font-bold text-4xl
                            ${isHighlighted ? 'bg-[#bb9829] text-white' : 'bg-[#bb9829]/10 text-[#bb9829]'}
                        `}>
                            {speaker.name.charAt(0)}
                        </div>
                        
                        {!isEditing && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => startEditing(speaker)}
                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-[#bb9829] hover:bg-[#bb9829]/10 rounded transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 size={24} />
                                </button>
                                <button 
                                    onClick={() => onDeleteSpeaker(speaker.id)}
                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                    title="Remover"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Content: View Mode vs Edit Mode */}
                    {isEditing ? (
                        <div className="space-y-4 animate-in fade-in">
                            <input 
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-lg text-slate-900 dark:text-white focus:border-[#bb9829] outline-none"
                                placeholder="Nome"
                            />
                            <div className="flex gap-3">
                                <input 
                                    value={editCongregation}
                                    onChange={e => setEditCongregation(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-base text-slate-900 dark:text-white focus:border-[#bb9829] outline-none"
                                    placeholder="Congregação"
                                />
                                <input 
                                    value={editPhone}
                                    onChange={e => setEditPhone(e.target.value)}
                                    className="w-2/3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-base text-slate-900 dark:text-white focus:border-[#bb9829] outline-none"
                                    placeholder="Tel"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button size="sm" variant="secondary" onClick={() => setEditingSpeakerId(null)}>Cancelar</Button>
                                <Button size="sm" onClick={() => saveEditing(speaker.id)}>Salvar</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="font-bold text-3xl text-slate-900 dark:text-slate-100 mb-2 leading-tight">{speaker.name}</h3>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center text-xl text-slate-500 dark:text-slate-400">
                                    <MapPin size={24} className="mr-3 text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span className="truncate">{speaker.congregation}</span>
                                </div>
                                <div className="flex items-center text-xl text-slate-500 dark:text-slate-400">
                                    <Phone size={24} className="mr-3 text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span className="truncate">{speaker.phone || 'Sem telefone'}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Scheduled Talks Section */}
                <div className="bg-slate-50 dark:bg-[#0f172a]/50 border-t border-slate-200 dark:border-slate-700/50 p-5 text-base">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                            <Calendar size={16} />
                            Histórico
                        </div>
                    </div>
                    
                    {hasSchedules ? (
                        <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {schedules.map(sch => {
                                const outline = state.outlines.find(o => o.number === sch.outlineNumber);
                                const isPast = new Date(sch.date) < new Date(new Date().setHours(0,0,0,0));
                                
                                return (
                                    <li key={sch.id} className={`flex items-start gap-3 group/item ${isPast ? 'opacity-60' : ''}`}>
                                        
                                        {/* Date Section */}
                                        <span className={`font-mono text-xl py-1 px-2 rounded shrink-0 ${isPast ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-[#bb9829]/20 text-[#bb9829] font-bold'}`}>
                                            {format(parseISO(sch.date), 'dd/MM/yy')}
                                        </span>
                                        
                                        <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
                                            {isEditing ? (
                                                <div className="w-full flex items-center gap-2">
                                                    <select 
                                                        value={editedScheduleValues[sch.id] || sch.outlineNumber}
                                                        onChange={(e) => handleScheduleChange(sch.id, Number(e.target.value))}
                                                        className="flex-1 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-white focus:border-[#bb9829] outline-none"
                                                    >
                                                        {state.outlines.map(o => (
                                                            <option key={o.number} value={o.number}>
                                                                {o.number}. {o.title.substring(0, 40)}...
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button 
                                                        type="button"
                                                        onClick={() => onDeleteSchedule(sch.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                        title="Excluir Agendamento"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="truncate text-slate-600 dark:text-slate-300 text-xl py-0.5" title={outline?.title}>
                                                        <span className="font-bold mr-2">#{sch.outlineNumber}</span>
                                                        {outline?.title}
                                                    </p>

                                                    <button 
                                                        onClick={() => onDeleteSchedule(sch.id)}
                                                        className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                                                        title="Excluir Agendamento"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-slate-400 dark:text-slate-500 italic text-sm pl-0 py-1">Nenhum agendamento registrado.</p>
                    )}
                </div>
            </div>
          );
        })}

        {filteredSpeakers.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/30">
             <User size={48} className="mx-auto mb-4 opacity-20" />
             <p className="text-lg">Nenhum orador encontrado.</p>
             <p className="text-sm text-slate-600">Utilize o botão acima para cadastrar.</p>
          </div>
        )}
      </div>
    </div>
  );
};