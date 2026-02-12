import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { AppState, ViewState } from '../types';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, BookOpen, List, Grid, Clock, MapPin, AlertCircle, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from '../components/Button';

interface DashboardProps {
  state: AppState;
  onNavigate: (view: ViewState) => void;
  onDateSelect: (date: Date) => void;
  onScheduleSelect: (speakerId: string) => void;
  onDeleteSchedule: (id: string) => void;
  onBulkDeleteSchedules?: (ids: string[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate, onDateSelect, onScheduleSelect, onDeleteSchedule, onBulkDeleteSchedules }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selection when tab changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  // Logic for Next Talk
  const nextTalk = useMemo(() => {
    const today = new Date();
    // Sort schedules by date
    const sorted = [...state.schedules]
      .map(s => ({ ...s, parsedDate: parseISO(s.date) }))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
      .filter(s => s.parsedDate >= new Date(today.setHours(0,0,0,0)));

    return sorted[0];
  }, [state.schedules]);

  const nextSpeaker = nextTalk ? state.speakers.find(s => s.id === nextTalk.speakerId) : null;
  const nextOutline = nextTalk ? state.outlines.find(o => o.number === nextTalk.outlineNumber) : null;

  // Logic for Calendar
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Logic for List View (Upcoming)
  const upcomingSchedules = useMemo(() => {
    const today = new Date();
    return [...state.schedules]
      .map(s => ({ ...s, parsedDate: parseISO(s.date) }))
      .filter(s => s.parsedDate >= new Date(today.setHours(0,0,0,0)))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
      .slice(0, 10);
  }, [state.schedules]);

  const getDayContent = (day: Date) => {
    const schedule = state.schedules.find(s => isSameDay(parseISO(s.date), day));
    if (!schedule) return null;
    const speaker = state.speakers.find(s => s.id === schedule.speakerId);
    return { schedule, speaker };
  };

  const handleDayClick = (day: Date, data: any, isWeekend: boolean) => {
    // If there is data (schedule), go to speaker details
    if (data && data.speaker) {
        onScheduleSelect(data.speaker.id);
        return;
    }
    
    // Only allow clicking empty slots if it is a weekend and current month
    if (isWeekend && isSameMonth(day, currentDate)) {
        onDateSelect(day);
    }
  };

  // Bulk Selection Logic
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === upcomingSchedules.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(upcomingSchedules.map(s => s.id)));
  };

  const handleBulkDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onBulkDeleteSchedules && selectedIds.size > 0) {
        if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.size} agendamentos selecionados?`)) {
             // Convert Set to Array safely
             const idsToDelete = Array.from(selectedIds);
             onBulkDeleteSchedules(idsToDelete);
             setSelectedIds(new Set());
        }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Painel de Agendamentos</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-light">Visão geral da escala de oradores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Content (Calendar/List) */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
                  <button 
                    onClick={() => setActiveTab('calendar')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'calendar' 
                        ? 'bg-white dark:bg-[#1e293b] text-[#bb9829] shadow-sm border border-slate-200 dark:border-slate-700' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Grid size={16} /> 
                    <span>Calendário</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'list' 
                        ? 'bg-white dark:bg-[#1e293b] text-[#bb9829] shadow-sm border border-slate-200 dark:border-slate-700' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <List size={16} /> 
                    <span>Agendados</span>
                  </button>
                </div>

                {activeTab === 'calendar' && (
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-1">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-[#bb9829] transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="w-32 text-center text-sm font-bold capitalize text-slate-800 dark:text-slate-200 select-none font-heading">
                      {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-[#bb9829] transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
            </div>

            {/* View Content */}
            {activeTab === 'calendar' ? (
                <div className="bg-white dark:bg-[#1e293b]/30 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/20 backdrop-blur-sm">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a]">
                        {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((day, i) => (
                        <div key={day} className={`
                            py-4 text-center text-[11px] font-bold tracking-widest
                            ${i === 0 || i === 6 ? 'text-[#bb9829]' : 'text-slate-400 dark:text-slate-600 dark:opacity-40'}
                        `}>
                            {day}
                        </div>
                        ))}
                    </div>

                    {/* Days Grid - Adjusted Row Height for Mobile (68px = approx 25% reduction from 90px) */}
                    <div className="grid grid-cols-7 auto-rows-[68px] md:auto-rows-[140px] bg-white dark:bg-slate-900/50">
                        {calendarDays.map((day, idx) => {
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const dayOfWeek = getDay(day);
                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0=Sun, 6=Sat
                            
                            const data = getDayContent(day);

                            // Border Logic
                            const borderClasses = `
                                border-b border-slate-200 dark:border-slate-800/50 
                                ${(idx + 1) % 7 !== 0 ? 'border-r border-slate-200 dark:border-slate-800/50' : ''}
                            `;
                            
                            // Interaction Logic
                            // Can click if it has data OR if it's a weekend in current month
                            const canClick = data || (isWeekend && isCurrentMonth);

                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => canClick && handleDayClick(day, data, isWeekend)}
                                    className={`
                                        relative p-1 md:p-2 group transition-colors duration-200 flex flex-col items-center justify-start md:justify-center gap-1 md:gap-2 pt-1.5 md:pt-0
                                        ${borderClasses}
                                        ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-950/80 opacity-50 dark:opacity-20' : ''}
                                        ${!isWeekend && isCurrentMonth ? 'bg-slate-50/30 dark:bg-slate-950/60 opacity-50 dark:opacity-20' : ''} 
                                        ${isToday ? 'bg-[#bb9829]/5' : ''}
                                        ${canClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'cursor-default'}
                                    `}
                                >
                                    {/* Day Number - Scaled for Mobile */}
                                    <div className="flex justify-center items-center w-full">
                                        <span className={`
                                            text-xl md:text-4xl font-bold flex items-center justify-center
                                            ${isToday ? 'text-[#bb9829] drop-shadow-[0_0_8px_rgba(187,152,41,0.5)]' : 
                                              !isCurrentMonth || !isWeekend ? 'text-slate-400 dark:text-slate-700' : 'text-slate-400 dark:text-slate-300 group-hover:text-slate-600 dark:group-hover:text-white'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    
                                    {/* Event Display */}
                                    {data ? (
                                        <div className="w-full animate-in zoom-in-95 duration-200">
                                            <div className="relative overflow-hidden rounded-md bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 group-hover:border-[#bb9829]/40 transition-colors shadow-sm dark:shadow-lg">
                                                {/* Left accent bar */}
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#bb9829]"></div>
                                                
                                                <div className="pl-1.5 md:pl-2.5 pr-1 py-1 md:pr-1.5 md:py-1.5 text-left">
                                                    <p className="text-[10px] md:text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                                                        {data.speaker?.name.split(' ')[0]}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <span className="text-[9px] text-[#bb9829] font-medium bg-[#bb9829]/10 px-1 rounded border border-[#bb9829]/20 hidden md:inline-block">
                                                            #{data.schedule.outlineNumber}
                                                        </span>
                                                        <span className="text-[9px] text-slate-500 truncate">
                                                            {data.speaker?.congregation.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1e293b]/30 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-sm p-4">
                     
                     {/* Bulk Actions Header */}
                     {upcomingSchedules.length > 0 && (
                         <div className="flex items-center justify-between mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                             <div className="flex items-center gap-3">
                                 <button 
                                    onClick={selectAll}
                                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-[#bb9829] transition-colors"
                                 >
                                     {selectedIds.size === upcomingSchedules.length && upcomingSchedules.length > 0 ? (
                                         <CheckSquare size={20} className="text-[#bb9829]" />
                                     ) : (
                                         <Square size={20} />
                                     )}
                                     <span className="text-sm font-medium select-none">
                                         {selectedIds.size === 0 ? 'Selecionar todos' : `${selectedIds.size} selecionado(s)`}
                                     </span>
                                 </button>
                             </div>
                             {selectedIds.size > 0 && (
                                 <button 
                                     onClick={handleBulkDelete}
                                     type="button"
                                     className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-md text-sm font-medium transition-colors animate-in fade-in"
                                 >
                                     <Trash2 size={16} />
                                     <span className="hidden sm:inline">Excluir Seleção</span>
                                     <span className="sm:hidden">Excluir</span>
                                 </button>
                             )}
                         </div>
                     )}

                     <div className="space-y-3">
                        {upcomingSchedules.length > 0 ? (
                            upcomingSchedules.map((item, i) => {
                            const speaker = state.speakers.find(s => s.id === item.speakerId);
                            const outline = state.outlines.find(o => o.number === item.outlineNumber);
                            const isSelected = selectedIds.has(item.id);

                            return (
                                <div 
                                    key={item.id} 
                                    className={`
                                        flex items-center justify-between p-4 rounded-lg border transition-all duration-200 group relative select-none
                                        ${isSelected 
                                            ? 'bg-[#bb9829]/5 border-[#bb9829]/30' 
                                            : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-[#bb9829]/40'}
                                    `}
                                    onClick={() => toggleSelect(item.id)}
                                >
                                    <div className="flex flex-1 items-center gap-4 min-w-0">
                                        {/* Checkbox for Selection */}
                                        <div className={`
                                            flex items-center justify-center w-6 h-6 rounded border transition-colors cursor-pointer shrink-0
                                            ${isSelected ? 'bg-[#bb9829] border-[#bb9829] text-white' : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-[#bb9829]'}
                                        `}>
                                            <CheckSquare size={16} />
                                        </div>

                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 group-hover:border-[#bb9829]/30 transition-colors">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{format(item.parsedDate, 'MMM', { locale: ptBR })}</span>
                                            <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">{format(item.parsedDate, 'd')}</span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={(e) => {
                                            e.stopPropagation();
                                            onScheduleSelect(item.speakerId);
                                        }}>
                                            <h4 className="font-medium text-slate-900 dark:text-slate-200 truncate text-lg group-hover:text-[#bb9829] transition-colors">{speaker?.name}</h4>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                <span className="flex items-center gap-1 truncate">
                                                    <MapPin size={12} /> {speaker?.congregation}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                <span className="truncate">Tema {outline?.number}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Individual Button - Always visible now */}
                                    <div className="pl-2 relative z-20">
                                            <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                onDeleteSchedule(item.id);
                                            }}
                                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-95 cursor-pointer"
                                            title="Excluir Agendamento"
                                            >
                                            <Trash2 size={20} />
                                            </button>
                                    </div>
                                </div>
                            );
                            })
                        ) : (
                            <div className="text-center py-16 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                                <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium text-slate-400">Nenhum discurso futuro</p>
                                <p className="text-sm">Utilize o botão "Novo Agendamento" para começar.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            
            {/* Next Talk Card - Highlighted & Flattened for Mobile */}
            <div className="relative overflow-hidden rounded-xl border border-[#bb9829]/30 bg-gradient-to-b from-white to-slate-50 dark:from-[#1e293b] dark:to-[#0f172a] shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-1 bg-gradient-to-r from-[#bb9829] to-amber-600"></div>
                
                <div className="p-3 md:p-6">
                    <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-2 md:mb-6">
                        <Clock size={20} className="text-[#bb9829]" />
                        Próximo Discurso
                    </h3>

                    {nextTalk && nextSpeaker && nextOutline ? (
                        <div 
                            className="space-y-3 md:space-y-6 animate-in slide-in-from-right-2 cursor-pointer"
                            onClick={() => onScheduleSelect(nextSpeaker.id)}
                        >
                             {/* Date Badge */}
                             <div className="flex items-center justify-between">
                                 <div className="flex flex-col">
                                     <span className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium uppercase tracking-wide">Data</span>
                                     <span className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 capitalize">
                                         {format(parseISO(nextTalk.date), "EEEE", { locale: ptBR })}
                                     </span>
                                     <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                                         {format(parseISO(nextTalk.date), "d 'de' MMMM", { locale: ptBR })}
                                     </span>
                                 </div>
                                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#bb9829]/10 flex items-center justify-center border border-[#bb9829]/20 text-[#bb9829]">
                                     <CalendarIcon size={18} className="md:w-5 md:h-5" />
                                 </div>
                             </div>

                             <div className="w-full h-px bg-slate-200 dark:bg-slate-800"></div>

                             {/* Speaker Info */}
                             <div className="group">
                                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide block mb-1 md:mb-2">Orador</span>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 group-hover:border-[#bb9829]/50 transition-colors">
                                        {nextSpeaker.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#bb9829] transition-colors">{nextSpeaker.name}</p>
                                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <MapPin size={12} /> {nextSpeaker.congregation}
                                        </p>
                                    </div>
                                </div>
                             </div>

                             {/* Theme Info */}
                             <div className="bg-slate-100 dark:bg-slate-900/60 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1 md:mb-2 text-[#bb9829]">
                                    <BookOpen size={14} className="md:w-4 md:h-4" />
                                    <span className="font-bold text-[10px] md:text-xs uppercase tracking-wide">Tema Nº {nextOutline.number}</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm italic leading-relaxed">
                                    "{nextOutline.title}"
                                </p>
                             </div>
                        </div>
                    ) : (
                        <div className="py-3 md:py-10 text-center space-y-2 md:space-y-3">
                            <div className="w-10 h-10 md:w-16 md:h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-slate-600">
                                <CalendarIcon size={20} className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-base">Sem agendamentos próximos.</p>
                            <Button size="sm" variant="ghost" onClick={() => onNavigate('schedule')} className="h-8 text-xs md:h-9 md:text-sm">
                                Agendar agora
                            </Button>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};