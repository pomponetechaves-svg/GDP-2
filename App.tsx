import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewSchedule } from './pages/NewSchedule';
import { Speakers } from './pages/Speakers';
import { Outlines } from './pages/Outlines';
import { SettingsPage } from './pages/Settings';
import { Information } from './pages/Information';
import { Sheet } from './components/Sheet';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AppState, ViewState, Speaker, Schedule, AppSettings } from './types';
import { loadState, saveState } from './services/storage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(''); 
  const [highlightedSpeakerId, setHighlightedSpeakerId] = useState<string | null>(null);
  
  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [state, setState] = useState<AppState>({
    speakers: [],
    schedules: [],
    outlines: [],
    songs: [],
    settings: { themeConflictDays: 180, themeMode: 'dark' }
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    const data = loadState();
    setState(data);
    setIsLoaded(true);
  }, []);

  // Save data on change
  useEffect(() => {
    if (isLoaded) {
      saveState(state);
    }
  }, [state, isLoaded]);

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (state.settings.themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.themeMode]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleNavigation = (view: ViewState) => {
    if (view === 'schedule') {
      setIsScheduleOpen(true);
      setSelectedDate('');
      if (currentView !== 'dashboard') {
        setCurrentView('dashboard');
      }
    } else {
      setCurrentView(view);
      if (view !== 'speakers') {
        setHighlightedSpeakerId(null);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setIsScheduleOpen(true);
  };

  const handleScheduleSelect = (speakerId: string) => {
    setHighlightedSpeakerId(speakerId);
    setCurrentView('speakers');
  };

  // --- Settings Logic ---
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
    if (newSettings.themeMode) {
        addToast('success', `Tema alterado para ${newSettings.themeMode === 'dark' ? 'Escuro' : 'Claro'}.`);
    } else {
        addToast('success', 'Configurações salvas.');
    }
  };

  // --- Speaker Logic ---

  const handleAddSpeaker = (speakerData: Omit<Speaker, 'id' | 'isDeleted'>) => {
    const newSpeaker: Speaker = {
      ...speakerData,
      id: uuidv4(),
      isDeleted: false
    };
    setState(prev => ({
      ...prev,
      speakers: [...prev.speakers, newSpeaker]
    }));
    addToast('success', 'Orador cadastrado com sucesso!');
  };

  const handleUpdateSpeaker = (id: string, data: Partial<Speaker>) => {
    setState(prev => ({
      ...prev,
      speakers: prev.speakers.map(s => s.id === id ? { ...s, ...data } : s)
    }));
    addToast('success', 'Dados do orador atualizados.');
  };

  const handleDeleteSpeaker = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este orador? Isso não apagará o histórico de discursos dele.')) {
      setState(prev => ({
        ...prev,
        speakers: prev.speakers.map(s => s.id === id ? { ...s, isDeleted: true } : s)
      }));
      addToast('success', 'Orador removido.');
    }
  };

  // --- Schedule Logic ---

  const handleAddSchedule = (data: { date: string; speakerName: string; congregation: string; phone: string; outlineNumber: number; notes: string; song: string }) => {
    let speakerId = '';
    
    // 1. Try to find existing speaker
    const existingSpeaker = state.speakers.find(
      s => !s.isDeleted && s.name.toLowerCase() === data.speakerName.trim().toLowerCase()
    );

    if (existingSpeaker) {
      speakerId = existingSpeaker.id;
    } else {
      // 2. Create new speaker
      const newSpeaker: Speaker = {
        id: uuidv4(),
        name: data.speakerName.trim(),
        congregation: data.congregation.trim(),
        phone: data.phone.trim(),
        isDeleted: false
      };
      
      setState(prev => ({
        ...prev,
        speakers: [...prev.speakers, newSpeaker]
      }));
      
      speakerId = newSpeaker.id;
    }

    // 3. Create Schedule
    const newSchedule: Schedule = {
      id: uuidv4(),
      date: data.date,
      speakerId: speakerId,
      outlineNumber: data.outlineNumber,
      notes: data.notes,
      song: data.song
    };

    setState(prev => ({
      ...prev,
      schedules: [...prev.schedules, newSchedule]
    }));
    
    setIsScheduleOpen(false);
    addToast('success', 'Agendamento realizado com sucesso!');
  };

  const handleUpdateSchedule = (id: string, data: Partial<Schedule>) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.map(s => s.id === id ? { ...s, ...data } : s)
    }));
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
        setState(prev => ({
            ...prev,
            schedules: prev.schedules.filter(s => s.id !== scheduleId)
        }));
        addToast('success', 'Agendamento excluído.');
    }
  }

  const handleBulkDeleteSchedules = (ids: string[]) => {
    // Confirmation handled in Dashboard
    if (!ids || ids.length === 0) return;

    setState(prev => {
        // Use Set for faster O(1) lookups and to ensure robust type checking
        const idsToDelete = new Set(ids);
        return {
            ...prev,
            schedules: prev.schedules.filter(s => !idsToDelete.has(s.id))
        };
    });
    addToast('success', `${ids.length} agendamentos excluídos.`);
  }

  const handleImport = (newData: AppState) => {
    setState(newData);
    setCurrentView('dashboard');
    addToast('success', 'Dados importados com sucesso!');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
                  state={state} 
                  onNavigate={handleNavigation} 
                  onDateSelect={handleDateSelect} 
                  onScheduleSelect={handleScheduleSelect} 
                  onDeleteSchedule={handleDeleteSchedule}
                  onBulkDeleteSchedules={handleBulkDeleteSchedules}
                />;
      case 'speakers':
        return <Speakers 
            state={state} 
            onAddSpeaker={handleAddSpeaker} 
            onUpdateSpeaker={handleUpdateSpeaker}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSpeaker={handleDeleteSpeaker} 
            onDeleteSchedule={handleDeleteSchedule}
            highlightedSpeakerId={highlightedSpeakerId} 
        />;
      case 'outlines':
        return <Outlines state={state} />;
      case 'settings':
        return <SettingsPage state={state} onImport={handleImport} onUpdateSettings={handleUpdateSettings} />;
      case 'info':
        return <Information state={state} />;
      default:
        return <Dashboard 
                  state={state} 
                  onNavigate={handleNavigation} 
                  onDateSelect={handleDateSelect} 
                  onScheduleSelect={handleScheduleSelect} 
                  onDeleteSchedule={handleDeleteSchedule}
                  onBulkDeleteSchedules={handleBulkDeleteSchedules}
                />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={handleNavigation}>
      {renderView()}
      
      <Sheet 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)}
        title="Novo Agendamento"
        subtitle="Preencha os dados para escalar um orador."
      >
        <NewSchedule 
          state={state} 
          onSave={handleAddSchedule} 
          onCancel={() => setIsScheduleOpen(false)} 
          initialDate={selectedDate}
        />
      </Sheet>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </Layout>
  );
}

export default App;