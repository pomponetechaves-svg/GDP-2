import React, { useState } from 'react';
import { AppState } from '../types';
import { Search, BookOpen } from 'lucide-react';

interface OutlinesProps {
  state: AppState;
}

export const Outlines: React.FC<OutlinesProps> = ({ state }) => {
  const [search, setSearch] = useState('');

  const filtered = state.outlines.filter(o => 
    o.number.toString().includes(search) || 
    o.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800/60 pb-6">
        <div>
          <h2 className="text-xl md:text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Esboços para Discursos Públicos</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-light">Consulte a lista oficial de temas aprovados.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500 group-focus-within:text-[#bb9829] transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar número ou tema..." 
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#bb9829] focus:border-[#bb9829] transition-all sm:text-sm shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* List Container */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.length > 0 ? (
            filtered.map(outline => (
                <div 
                    key={outline.number} 
                    className="group flex items-center p-4 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#bb9829]/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[#bb9829]/5 hover:-translate-y-0.5"
                >
                    {/* Number Badge */}
                    <div className="shrink-0 w-12 h-12 rounded-full bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-700/50 flex items-center justify-center group-hover:border-[#bb9829]/30 transition-colors">
                        <span className="text-[#bb9829] font-bold text-lg font-heading group-hover:scale-110 transition-transform duration-300">
                            {outline.number}
                        </span>
                    </div>

                    {/* Text Content */}
                    <div className="ml-5 flex-1">
                        <h3 className="text-slate-800 dark:text-slate-200 font-medium text-lg leading-snug group-hover:text-black dark:group-hover:text-white transition-colors">
                            {outline.title}
                        </h3>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-[#1e293b]/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <BookOpen size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-700" />
                <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Nenhum esboço encontrado.</p>
                <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">Tente buscar por outro número ou palavra-chave.</p>
            </div>
        )}
      </div>
      
      {/* Footer count */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-600 pt-4 pb-8">
         Exibindo {filtered.length} de {state.outlines.length} temas
      </div>
    </div>
  );
};