import React from 'react';
import { LayoutDashboard, CalendarPlus, Users, BookOpen, Settings, Menu, X, Info } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'schedule', label: 'Agendar', icon: CalendarPlus },
    { id: 'speakers', label: 'Oradores', icon: Users },
    { id: 'outlines', label: 'Esboços', icon: BookOpen },
    { id: 'info', label: 'Informações', icon: Info },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ] as const;

  const NavContent = () => (
    <>
      <div className="px-6 py-8">
        <h1 className="text-2xl font-heading font-bold text-[#bb9829]">
          PDP
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Gestão de Oradores</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onChangeView(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentView === item.id
                ? 'bg-[#bb9829]/10 text-[#bb9829] border border-[#bb9829]/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Sistema Online</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
        <NavContent />
      </aside>

      {/* Mobile Header - Menu Button moved to LEFT */}
      <div className="lg:hidden fixed top-0 w-full z-20 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 dark:text-slate-300 p-1">
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            <h1 className="text-xl font-heading font-bold text-[#bb9829]">PDP</h1>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-[#0f172a] pt-16 flex flex-col" onClick={e => e.stopPropagation()}>
             <NavContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};