import React from 'react';
import { AiResponse, CurriculumItem } from '../types';
import { Check, Plus, Target, BookOpen, Award } from 'lucide-react';

interface CurriculumResultsProps {
  data: AiResponse;
  selectedItems: CurriculumItem[];
  onToggleItem: (item: CurriculumItem) => void;
}

const CurriculumResults: React.FC<CurriculumResultsProps> = ({ data, selectedItems, onToggleItem }) => {
  const isSelected = (code: string) => selectedItems.some(i => i.code === code);

  const renderSection = (title: string, items: { code: string; text: string; subjectId?: string }[], type: 'competencia' | 'criteri' | 'saber', icon: React.ReactNode, colorClass: string) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className={`${colorClass} p-2 rounded-lg text-white`}>{icon}</div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {items.map((item, idx) => {
          const selected = isSelected(item.code);
          return (
            <button
              key={idx}
              onClick={() => onToggleItem({ ...item, id: item.code, type })}
              className={`text-left p-6 rounded-2xl border-2 transition-all group flex items-start gap-4 ${
                selected 
                  ? 'bg-blue-50 border-blue-500 shadow-sm' 
                  : 'bg-white border-slate-50 hover:border-blue-200'
              }`}
            >
              <div className={`mt-1 p-1 rounded-md transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-400'}`}>
                {selected ? <Check size={14} /> : <Plus size={14} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{item.code}</span>
                  {item.subjectId && <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{item.subjectId}</span>}
                </div>
                <p className={`text-sm font-bold leading-relaxed ${selected ? 'text-blue-900' : 'text-slate-700'}`}>{item.text}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in">
      {renderSection("Competències Específiques", data.competencies, 'competencia', <Target size={20} />, "bg-indigo-600")}
      {renderSection("Criteris d'Avaluació", data.criteria, 'criteri', <Award size={20} />, "bg-emerald-600")}
      {renderSection("Sabers Bàsics", data.sabers, 'saber', <BookOpen size={20} />, "bg-amber-600")}
    </div>
  );
};

export default CurriculumResults;
