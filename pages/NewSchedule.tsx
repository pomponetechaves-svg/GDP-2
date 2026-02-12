import React, { useState, useMemo, useEffect } from 'react';
import { AppState } from '../types';
import { Button } from '../components/Button';
import { 
  getDay, 
  parseISO, 
  differenceInDays, 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface NewScheduleProps {
  state: AppState;
  onSave: (scheduleData: { date: string; speakerName: string; congregation: string; phone: string; outlineNumber: number; notes: string; song: string }) => void;
  onCancel: () => void;
  initialDate?: string;
}

export const NewSchedule: React.FC<NewScheduleProps> = ({ state, onSave, onCancel, initialDate }) => {
  const [date, setDate] = useState(initialDate || '');
  const [viewDate, setViewDate] = useState(initialDate ? parseISO(initialDate) : new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Update date if initialDate prop changes
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
      setViewDate(parseISO(initialDate));
    }
  }, [initialDate]);

  // Calendar Logic
  const calendarDays = useMemo(() => {
    // Strictly days of the current month
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const startingDayIndex = getDay(startOfMonth(viewDate)); // 0 = Sun, 1 = Mon...

  // Inputs manuais
  const [speakerName, setSpeakerName] = useState('');
  const [congregation, setCongregation] = useState('');
  const [phone, setPhone] = useState('');
  const [song, setSong] = useState('');
  
  const [outlineNumber, setOutlineNumber] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Filter valid speakers for autocomplete suggestions
  const activeSpeakers = state.speakers.filter(s => !s.isDeleted);

  // Auto-fill congregation and phone if speaker name matches an existing record
  useEffect(() => {
    const existingSpeaker = activeSpeakers.find(s => s.name.toLowerCase() === speakerName.toLowerCase());
    if (existingSpeaker) {
      setCongregation(existingSpeaker.congregation);
      setPhone(existingSpeaker.phone || '');
    }
  }, [speakerName, activeSpeakers]);

  // Conflict Logic
  const conflictWarning = useMemo(() => {
    if (!outlineNumber) return null;
    
    // Check conflicts relative to the selected date OR today if no date selected
    const referenceDate = date ? parseISO(date) : new Date();
    const limit = state.settings.themeConflictDays;
    
    // Find conflicting schedules
    const conflicts = state.schedules.filter(s => {
        if (s.outlineNumber !== outlineNumber) return false;
        
        const sDate = parseISO(s.date);
        const diffDays = Math.abs(differenceInDays(referenceDate, sDate));
        return diffDays < limit;
    });
    
    if (conflicts.length === 0) return null;

    const today = new Date();
    today.setHours(0,0,0,0);
    
    const futureConflicts: Date[] = [];
    const pastConflicts: Date[] = [];
    
    conflicts.forEach(s => {
        const sDate = parseISO(s.date);
        // Normalize for comparison
        const sDateCheck = new Date(sDate);
        sDateCheck.setHours(0,0,0,0);
        
        if (sDateCheck < today) {
            pastConflicts.push(sDate);
        } else {
            futureConflicts.push(sDate);
        }
    });
    
    const messages: string[] = [];
    
    if (futureConflicts.length > 0) {
        futureConflicts.sort((a, b) => a.getTime() - b.getTime());
        const datesStr = futureConflicts.map(d => format(d, 'dd/MM/yyyy')).join(', ');
        messages.push(`ESBOÇO JÁ AGENDADO DENTRO DO LIMITE CONFIGURADO PARA A DATA ${datesStr}`);
    }
    
    if (pastConflicts.length > 0) {
        pastConflicts.sort((a, b) => a.getTime() - b.getTime());
        const datesStr = pastConflicts.map(d => format(d, 'dd/MM/yyyy')).join(', ');
        const label = pastConflicts.length > 1 ? 'ESBOÇO FEITO NAS DATAS' : 'ESBOÇO FEITO NA DATA';
        messages.push(`${label} ${datesStr}`);
    }
    
    if (messages.length === 0) return null;

    return (
        <div className="flex flex-col gap-1.5 mt-1">
            {messages.map((msg, i) => (
                <span key={i} className="block leading-tight font-semibold uppercase">{msg}</span>
            ))}
        </div>
    );
  }, [outlineNumber, date, state.schedules, state.settings.themeConflictDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = [];

    if (!date) newErrors.push("Selecione uma data válida (Sábado ou Domingo).");
    
    // Safety check just in case
    if (date) {
        const d = parseISO(date);
        const day = getDay(d);
        if (day !== 0 && day !== 6) {
            newErrors.push("Data inválida. Apenas Sábados e Domingos.");
        }
    }

    if (!speakerName.trim()) newErrors.push("Digite o nome do orador.");
    if (!congregation.trim()) newErrors.push("Digite a congregação.");
    if (!outlineNumber) newErrors.push("Selecione um esboço.");

    // Check if duplicate on same day
    if (date && state.schedules.some(s => s.date === date)) {
      newErrors.push("Já existe um discurso agendado para esta data.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      date,
      speakerName,
      congregation,
      phone,
      outlineNumber,
      notes,
      song
    });
    
    // Reset form
    setDate('');
    setSpeakerName('');
    setCongregation('');
    setPhone('');
    setSong('');
    setOutlineNumber(0);
    setNotes('');
    setErrors([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 animate-in slide-in-from-top-2">
          <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* Custom Date Picker */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data do Discurso</label>
        
        <button 
            type="button"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className={`
                w-full bg-slate-50 dark:bg-slate-900 border rounded-md px-4 py-3 text-left flex justify-between items-center transition-all
                ${isDatePickerOpen ? 'ring-2 ring-[#bb9829] border-transparent' : 'border-slate-300 dark:border-slate-700 hover:border-slate-500'}
                ${!date ? 'text-slate-500' : 'text-slate-900 dark:text-slate-100'}
            `}
        >
            <span>
                {date ? format(parseISO(date), "dd 'de' MMMM 'de' yyyy (EEEE)", { locale: ptBR }) : "Selecione a data..."}
            </span>
            <CalendarIcon size={18} className="text-[#bb9829]" />
        </button>

        {isDatePickerOpen && (
            <div className="absolute top-full left-0 mt-2 z-10 w-full sm:w-[320px] bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-4 animate-in zoom-in-95 origin-top-left">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-heading font-bold text-slate-800 dark:text-slate-200 capitalize">
                        {format(viewDate, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <button type="button" onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
                
                {/* Weekdays */}
                <div className="grid grid-cols-7 mb-2 text-center">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                        <span key={i} className={`text-xs font-bold ${i === 0 || i === 6 ? 'text-[#bb9829]' : 'text-slate-400 dark:text-slate-500'}`}>{d}</span>
                    ))}
                </div>
                
                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for offset */}
                    {Array.from({ length: startingDayIndex }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {calendarDays.map((day) => {
                        const dayOfWeek = getDay(day);
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isSelected = date === dateStr;
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                            <button
                                key={day.toString()}
                                type="button"
                                disabled={!isWeekend}
                                onClick={() => {
                                    setDate(dateStr);
                                    setIsDatePickerOpen(false);
                                }}
                                className={`
                                    h-9 w-9 rounded-full text-sm flex items-center justify-center transition-all relative
                                    ${isSelected 
                                        ? 'bg-[#bb9829] text-white font-bold shadow-lg shadow-[#bb9829]/30' 
                                        : isWeekend 
                                            ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white font-medium' 
                                            : 'text-slate-300 dark:text-slate-600 opacity-25 cursor-not-allowed font-light'}
                                    ${isToday && !isSelected ? 'border border-[#bb9829] text-[#bb9829]' : ''}
                                `}
                            >
                                {format(day, 'd')}
                            </button>
                        );
                    })}
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                     <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Legenda</p>
                     <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#bb9829]"></div> Disp.</div>
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div> Bloq.</div>
                     </div>
                </div>
            </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Orador</label>
        <input
          type="text"
          list="speakers-list"
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#bb9829] focus:border-transparent outline-none placeholder-slate-500 dark:placeholder-slate-600"
          placeholder="Digite o nome..."
          value={speakerName}
          onChange={(e) => setSpeakerName(e.target.value)}
          autoComplete="off"
        />
        <datalist id="speakers-list">
          {activeSpeakers.map(s => (
            <option key={s.id} value={s.name} />
          ))}
        </datalist>
        <p className="text-xs text-slate-500 mt-1">Se o orador não existir, ele será cadastrado automaticamente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Congregação</label>
            <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#bb9829] focus:border-transparent outline-none placeholder-slate-500 dark:placeholder-slate-600"
            placeholder="Ex: Central..."
            value={congregation}
            onChange={(e) => setCongregation(e.target.value)}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone (Opcional)</label>
            <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#bb9829] focus:border-transparent outline-none placeholder-slate-500 dark:placeholder-slate-600"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            />
        </div>
      </div>
      
      {/* Song Field */}
      <div>
         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cântico</label>
         <select
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#bb9829] focus:border-transparent outline-none"
            value={song}
            onChange={(e) => setSong(e.target.value)}
         >
           <option value="">Selecione o cântico...</option>
           {state.songs.map(s => (
             <option key={s.number} value={s.number}>{s.number}. {s.title}</option>
           ))}
         </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Esboço</label>
        <select
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#bb9829] focus:border-transparent outline-none"
          value={outlineNumber}
          onChange={(e) => setOutlineNumber(Number(e.target.value))}
        >
          <option value="0">Selecione o esboço...</option>
          {state.outlines.map(o => (
            <option key={o.number} value={o.number}>{o.number}. {o.title}</option>
          ))}
        </select>
        {conflictWarning && (
          <div className="mt-2 p-3 bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-900/50 rounded text-sm text-amber-800 dark:text-amber-200 animate-in fade-in">
             <span className="font-bold block mb-1 text-amber-900 dark:text-amber-100">⚠️ Conflito Detectado</span>
             {conflictWarning}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas Adicionais</label>
        <textarea
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#bb9829] focus:border-transparent outline-none min-h-[100px]"
          placeholder="Observações sobre o arranjo..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Confirmar Agendamento</Button>
      </div>
    </form>
  );
};