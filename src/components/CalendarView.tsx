import React, { useState, useMemo } from 'react';
import { Activity } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface CalendarViewProps {
  activities: Activity[];
  onEditActivity: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ activities, onEditActivity }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Adjust firstDay to start on Monday (0=Mon, 6=Sun)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    return { firstDay: adjustedFirstDay, totalDays };
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('ca-ES', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const activitiesByDate = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    activities.forEach(act => {
      act.sessionDates?.forEach(dateStr => {
        if (!dateStr) return;
        if (!map[dateStr]) map[dateStr] = [];
        if (!map[dateStr].some(a => a.id === act.id)) {
          map[dateStr].push(act);
        }
      });
    });
    return map;
  }, [activities]);

  const renderDays = () => {
    const days = [];
    const { firstDay, totalDays } = daysInMonth;
    
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/30 border border-slate-100/50"></div>);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dateKey = date.toISOString().split('T')[0];
      const dayActivities = activitiesByDate[dateKey] || [];
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div key={d} className={`h-32 border border-slate-100 p-2 overflow-y-auto custom-scrollbar transition-colors hover:bg-slate-50/50 ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-black ${isToday ? 'text-blue-600 bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
              {d}
            </span>
          </div>
          <div className="space-y-1">
            {dayActivities.map(act => (
              <button
                key={act.id}
                onClick={() => onEditActivity(act.id)}
                className={`w-full text-left px-2 py-1 rounded text-[9px] font-bold truncate text-white shadow-sm hover:brightness-110 transition-all ${act.color || 'bg-blue-600'}`}
                title={act.title}
              >
                {act.title}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="animate-fade-in bg-white rounded-[3rem] border border-blue-50 shadow-sm overflow-hidden">
      <div className="p-8 md:p-12 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100">
            <CalendarIcon size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{monthName}</h2>
            <p className="text-slate-400 font-bold text-sm">Planificació temporal de les Situacions d'Aprenentatge.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <button onClick={prevMonth} className="p-3 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm hover:shadow-md"><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">Avui</button>
          <button onClick={nextMonth} className="p-3 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm hover:shadow-md"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
        {['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map(d => (
          <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {renderDays()}
      </div>
      
      <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Llegenda:</span>
        </div>
        <div className="flex flex-wrap gap-4">
          {activities.slice(0, 5).map(act => (
            <div key={act.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${act.color || 'bg-blue-600'}`}></div>
              <span className="text-[10px] font-bold text-slate-600">{act.title}</span>
            </div>
          ))}
          {activities.length > 5 && <span className="text-[10px] font-bold text-slate-400">... i {activities.length - 5} més</span>}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
