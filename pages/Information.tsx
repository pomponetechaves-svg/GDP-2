import React from 'react';
import { Card } from '../components/Card';
import { Info, ShieldAlert, Calendar, Save, Wifi, Database, AlertCircle } from 'lucide-react';
import { AppState } from '../types';
import { parseISO } from 'date-fns';

interface InformationProps {
  state: AppState;
}

export const Information: React.FC<InformationProps> = ({ state }) => {
  // Calculate stats
  const activeSpeakersCount = state.speakers.filter(s => !s.isDeleted).length;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const futureSchedulesCount = state.schedules.filter(s => {
    const parsedDate = parseISO(s.date);
    return parsedDate >= today;
  }).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Informações do Sistema</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-light">Guia rápido sobre o funcionamento e recursos do aplicativo.</p>
      </div>

      {/* Stats and Alerts Section (Moved from Dashboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b]/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-[#bb9829]"></div>
             <div className="flex gap-4 items-start z-10">
                <div className="bg-[#bb9829]/10 p-2 rounded-lg text-[#bb9829]">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">Evite Repetições</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        O sistema alerta automaticamente se um tema foi apresentado nos últimos <strong className="text-slate-800 dark:text-slate-200">{state.settings.themeConflictDays} dias</strong>. Mantenha o histórico atualizado.
                    </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Oradores</span>
                <p className="text-3xl font-heading font-bold text-slate-900 dark:text-white mt-2">{activeSpeakersCount}</p>
            </div>
            <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Agendados</span>
                <p className="text-3xl font-heading font-bold text-[#bb9829] mt-2">{futureSchedulesCount}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Regras de Agendamento */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar size={64} className="text-[#bb9829]" />
            </div>
            <div className="flex items-center gap-3 mb-4 text-[#bb9829]">
                <Calendar size={24} />
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">Agendamentos</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bb9829] mt-1.5 shrink-0"></span>
                    <span><strong>Fins de Semana:</strong> O sistema permite agendamentos apenas aos Sábados e Domingos para manter a organização.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bb9829] mt-1.5 shrink-0"></span>
                    <span><strong>Cadastro Automático:</strong> Ao digitar o nome de um novo orador na tela de agendamento, ele é salvo automaticamente no banco de dados.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bb9829] mt-1.5 shrink-0"></span>
                    <span><strong>Horários:</strong> As datas são salvas ignorando o horário específico para evitar problemas de fuso horário.</span>
                </li>
            </ul>
        </div>

        {/* Card 2: Conflitos */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldAlert size={64} className="text-[#bb9829]" />
            </div>
            <div className="flex items-center gap-3 mb-4 text-[#bb9829]">
                <ShieldAlert size={24} />
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">Prevenção de Conflitos</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Para garantir a variedade do programa espiritual, o sistema monitora automaticamente os temas apresentados.
            </p>
            <div className="bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-500">
                <p>O alerta será exibido se:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>O mesmo esboço já foi agendado recentemente.</li>
                    <li>O intervalo for menor que o definido nas <em>Configurações</em> (Padrão: 180 dias).</li>
                </ul>
            </div>
        </div>

        {/* Card 3: Dados e Backup */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Database size={64} className="text-[#bb9829]" />
            </div>
            <div className="flex items-center gap-3 mb-4 text-[#bb9829]">
                <Save size={24} />
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">Seus Dados</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Este aplicativo armazena todas as informações localmente no seu navegador (Local Storage).
            </p>
            <div className="flex gap-4">
                <div className="flex-1 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-3 rounded-lg">
                    <h4 className="text-amber-600 dark:text-amber-500 font-bold text-xs uppercase mb-1">Importante</h4>
                    <p className="text-xs text-amber-800/80 dark:text-amber-200/70">
                        Faça backups regulares na aba <strong>Configurações</strong> para evitar perda de dados caso limpe o cache do navegador.
                    </p>
                </div>
            </div>
        </div>

        {/* Card 4: Sobre */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-3 mb-4 text-[#bb9829]">
                    <Info size={24} />
                    <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">Sobre</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sistema desenvolvido para auxiliar coordenadores de discursos públicos na gestão de escalas, oradores e temas bíblicos.
                </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                <span>Versão 1.2.0</span>
                <span className="flex items-center gap-1">
                    <Wifi size={12} className="text-green-500" />
                    Funcionamento Offline
                </span>
            </div>
        </div>

      </div>
    </div>
  );
};