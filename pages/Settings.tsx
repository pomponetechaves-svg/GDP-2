import React, { useRef } from 'react';
import { AppState, AppSettings } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { exportData } from '../services/storage';
import { Download, Upload, AlertTriangle, ShieldAlert, FileText, Moon, Sun, Printer, FileDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SettingsProps {
  state: AppState;
  onImport: (data: AppState) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({ state, onImport, onUpdateSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Simple validation
        if (json.speakers && json.schedules) {
          if (window.confirm("Isso substituirá todos os dados atuais. Deseja continuar?")) {
            onImport(json);
          }
        } else {
          alert("Arquivo inválido.");
        }
      } catch (err) {
        alert("Erro ao ler arquivo.");
      }
    };
    reader.readAsText(file);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(187, 152, 41); // #bb9829
    doc.text("PDP - Escala de Discursos", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 28);

    const schedules = [...state.schedules]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const tableData = schedules.map(sch => {
        const speaker = state.speakers.find(s => s.id === sch.speakerId);
        const outline = state.outlines.find(o => o.number === sch.outlineNumber);
        
        return [
            format(parseISO(sch.date), 'dd/MM/yyyy', { locale: ptBR }),
            speaker?.name || 'Desconhecido',
            speaker?.congregation || '-',
            outline ? `${outline.number}. ${outline.title}` : 'Tema não encontrado',
            speaker?.phone || ''
        ];
    });

    autoTable(doc, {
        head: [['Data', 'Orador', 'Congregação', 'Tema', 'Contato']],
        body: tableData,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [187, 152, 41], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 40 },
            2: { cellWidth: 40 },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 30 }
        }
    });

    doc.save(`escala_discursos_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const generateDoc = () => {
    // Generate an HTML structure for the Word document
    const schedules = [...state.schedules]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Escala de Discursos</title>
        <style>
            body { font-family: 'Arial', sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            h1 { text-align: center; color: #333; }
        </style>
        </head><body>
        <h1>Programação de Discursos Públicos</h1>
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Orador</th>
                    <th>Congregação</th>
                    <th>Tema (Nº)</th>
                </tr>
            </thead>
            <tbody>
    `;

    schedules.forEach(sch => {
        const speaker = state.speakers.find(s => s.id === sch.speakerId);
        const outline = state.outlines.find(o => o.number === sch.outlineNumber);
        html += `
            <tr>
                <td>${format(parseISO(sch.date), 'dd/MM/yyyy', {locale: ptBR})}</td>
                <td>${speaker?.name || 'Desconhecido'}</td>
                <td>${speaker?.congregation || '-'}</td>
                <td>${outline?.number} - ${outline?.title}</td>
            </tr>
        `;
    });

    html += `</tbody></table></body></html>`;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `escala_discursos_${format(new Date(), 'yyyy-MM-dd')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printPdf = () => {
    const schedules = [...state.schedules]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Por favor, permita pop-ups para imprimir.");
        return;
    }

    let rows = '';
    schedules.forEach(sch => {
        const speaker = state.speakers.find(s => s.id === sch.speakerId);
        const outline = state.outlines.find(o => o.number === sch.outlineNumber);
        rows += `
            <tr>
                <td>${format(parseISO(sch.date), 'dd/MM/yyyy', {locale: ptBR})}</td>
                <td><strong>${speaker?.name || '-'}</strong><br><span style="font-size:0.9em;color:#555">${speaker?.congregation}</span></td>
                <td>#${outline?.number} - ${outline?.title}</td>
                <td>${speaker?.phone || ''}</td>
            </tr>
        `;
    });

    printWindow.document.write(`
        <html>
        <head>
            <title>Imprimir Escala</title>
            <style>
                body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; }
                h1 { text-align: center; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 14px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f4f4f4; border-bottom: 2px solid #ccc; }
                tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1>Escala de Discursos Públicos</h1>
            <table>
                <thead>
                    <tr>
                        <th width="15%">Data</th>
                        <th width="35%">Orador</th>
                        <th width="35%">Tema</th>
                        <th width="15%">Contato</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
  };

  const conflictOptions = [60, 90, 120, 180];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">Configurações</h2>
        <p className="text-slate-500 dark:text-slate-400">Gerencie os dados e preferências do aplicativo.</p>
      </div>

      {/* Theme Settings */}
      <Card title="Aparência" subtitle="Personalize a visualização do aplicativo.">
        <div className="flex gap-4 mt-2">
            <button 
                onClick={() => onUpdateSettings({ themeMode: 'light' })}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    state.settings.themeMode === 'light' 
                    ? 'bg-slate-50 text-[#bb9829] border-[#bb9829] ring-1 ring-[#bb9829]' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
            >
                <Sun size={20} />
                <span className="font-medium">Modo Claro</span>
            </button>
            <button 
                onClick={() => onUpdateSettings({ themeMode: 'dark' })}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    state.settings.themeMode === 'dark' 
                    ? 'bg-slate-900 text-[#bb9829] border-[#bb9829] ring-1 ring-[#bb9829]' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
            >
                <Moon size={20} />
                <span className="font-medium">Modo Escuro</span>
            </button>
        </div>
      </Card>

      {/* Export Reports */}
      <Card title="Relatórios e Exportação" subtitle="Gere documentos para impressão ou compartilhamento.">
        <div className="flex flex-wrap gap-4 mt-2">
             <Button onClick={printPdf} variant="secondary" className="flex items-center gap-2">
                <Printer size={18} />
                Gerar PDF (Imprimir)
             </Button>
             <Button onClick={generatePDF} variant="secondary" className="flex items-center gap-2">
                <FileDown size={18} />
                Exportar para PDF (.pdf)
             </Button>
             <Button onClick={generateDoc} variant="secondary" className="flex items-center gap-2">
                <FileText size={18} />
                Exportar para Word (.doc)
             </Button>
        </div>
      </Card>

      {/* Conflict Settings */}
      <Card title="Detecção de Conflitos" subtitle="Configure a sensibilidade do alerta para repetição de temas.">
         <div className="flex items-start gap-4 mt-2">
            <div className="bg-[#bb9829]/10 p-3 rounded-full text-[#bb9829]">
                <ShieldAlert size={24} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">
                    O sistema alertará ao agendar um esboço que já foi apresentado dentro do período selecionado abaixo:
                </p>
                <div className="flex flex-wrap gap-2">
                    {conflictOptions.map(days => (
                        <button
                            key={days}
                            onClick={() => onUpdateSettings({ themeConflictDays: days })}
                            className={`
                                px-4 py-2 rounded-md text-sm font-medium border transition-all
                                ${state.settings.themeConflictDays === days 
                                    ? 'bg-[#bb9829] text-white border-[#bb9829] shadow-lg shadow-[#bb9829]/20' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'}
                            `}
                        >
                            {days} Dias
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                    Atualmente configurado para alertar repetições em menos de <strong>{state.settings.themeConflictDays} dias</strong> (~{Math.round(state.settings.themeConflictDays / 30)} meses).
                </p>
            </div>
         </div>
      </Card>

      {/* Backup Settings */}
      <Card title="Backup e Restauração" subtitle="Exporte seus dados regularmente para evitar perdas.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-[#bb9829]">
               <Download size={24} />
               <h3 className="font-semibold text-lg">Exportar Dados</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
               Baixe um arquivo JSON contendo todos os registros do sistema.
            </p>
            <Button onClick={() => exportData(state)} className="w-full">
               Baixar Backup
            </Button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-slate-700 dark:text-slate-300">
               <Upload size={24} />
               <h3 className="font-semibold text-lg">Importar Dados</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
               Restaure dados de um arquivo de backup anterior.
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange}
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
               Selecionar Arquivo
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded flex gap-3 items-start">
           <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={18} />
           <p className="text-sm text-amber-800 dark:text-amber-200/80">
             <strong>Atenção:</strong> A importação de dados substituirá os registros atuais. Certifique-se de ter um backup recente antes de importar.
           </p>
        </div>
      </Card>
      
      <div className="text-center text-xs text-slate-500 dark:text-slate-600 pt-8">
        PDP v1.2.0 &bull; Armazenamento Local
      </div>
    </div>
  );
};