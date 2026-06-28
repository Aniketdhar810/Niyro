import React, { useState } from 'react';
import { SideNav } from '../components/SideNav';
import { useDashboardData } from '../hooks/useDashboardData';
import { 
  format, parseISO, isToday, 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfDay
} from 'date-fns';
import { api } from '../lib/apiClient';

export const Calendar: React.FC = () => {
  const { tasks, loading } = useDashboardData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', description: '', dueAt: '', estimatedMinutes: '' });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="w-16 h-16 border-[3px] border-on-surface border-t-primary rounded-full animate-spin"></div>
        </div>
    );
  }

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  let startDate = startOfWeek(monthStart);
  let endDate = endOfWeek(monthEnd);
  
  if (viewMode === 'week') {
    startDate = startOfWeek(currentDate);
    endDate = endOfWeek(currentDate);
  }

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-tertiary text-on-tertiary border-tertiary';
      case 'at_risk': return 'bg-secondary text-on-secondary border-secondary';
      case 'on_track': return 'bg-secondary-container text-on-secondary-container border-secondary-container';
      default: return 'bg-surface-variant text-on-surface-variant border-outline';
    }
  };

  const handleCompleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setProcessingId(taskId);
      await api.completeTask(taskId);
    } catch (err) {
      console.error(err);
      alert('Failed to complete task.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAgentTrigger = async (taskId: string, agent: 'plan' | 'schedule' | 'lastMinute', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setProcessingId(taskId);
      setActiveMenuId(null);
      if (agent === 'plan') await api.planTask(taskId);
      if (agent === 'schedule') await api.scheduleTask(taskId);
      if (agent === 'lastMinute') await api.lastMinuteTask(taskId);
      alert('Agent triggered successfully.');
    } catch (err) {
      console.error(err);
      alert('Agent failed to run.');
    } finally {
      setProcessingId(null);
    }
  };
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    try {
      setIsSubmitting(true);
      const payload: any = { title: newTaskForm.title };
      if (newTaskForm.description) payload.description = newTaskForm.description;
      if (newTaskForm.dueAt) {
        payload.dueAt = new Date(newTaskForm.dueAt).toISOString();
      }
      if (newTaskForm.estimatedMinutes) payload.estimatedMinutes = parseInt(newTaskForm.estimatedMinutes);
      
      await api.createTask(payload);
      setIsModalOpen(false);
      setNewTaskForm({ title: '', description: '', dueAt: '', estimatedMinutes: '' });
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-2 md:p-4 flex justify-center">
      <div className="bg-surface text-on-surface font-body-md flex w-full max-w-[1600px] border-2 border-on-surface shadow-[8px_8px_0px_#1c1b1b] min-h-[calc(100vh-1rem)] relative pb-16 md:pb-0 overflow-hidden">
      <SideNav />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-auto md:h-20 border-b-[3px] border-on-surface bg-surface flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-gutter shrink-0 gap-4 md:gap-0 z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto">
            <h1 className="font-headline-md font-black tracking-tighter uppercase hidden md:block">CALENDAR</h1>
            
            {/* Date Navigation */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  const step = viewMode === 'month' ? { months: -1 } : { weeks: -1 };
                  const newDate = new Date(currentDate);
                  if (step.months) newDate.setMonth(newDate.getMonth() - 1);
                  if (step.weeks) newDate.setDate(newDate.getDate() - 7);
                  setCurrentDate(newDate);
                }}
                className="w-10 h-10 flex items-center justify-center border-[3px] border-on-surface hover:bg-surface-variant transition-colors shadow-[4px_4px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0A0A0A] bg-surface"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              
              <h2 className="font-headline-md font-bold uppercase min-w-[200px] text-center">
                {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(startDate, 'MMM d')}`}
              </h2>

              <button 
                onClick={() => {
                  const step = viewMode === 'month' ? { months: 1 } : { weeks: 1 };
                  const newDate = new Date(currentDate);
                  if (step.months) newDate.setMonth(newDate.getMonth() + 1);
                  if (step.weeks) newDate.setDate(newDate.getDate() + 7);
                  setCurrentDate(newDate);
                }}
                className="w-10 h-10 flex items-center justify-center border-[3px] border-on-surface hover:bg-surface-variant transition-colors shadow-[4px_4px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0A0A0A] bg-surface"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 border-[3px] border-on-surface font-label-mono uppercase font-bold hover:bg-surface-variant transition-colors shadow-[4px_4px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#0A0A0A] bg-surface ml-2"
              >
                Today
              </button>
            </div>
          </div>
          
          {/* View Toggles */}
          <div className="flex bg-surface-container-high border-[3px] border-on-surface p-1 gap-1 shadow-[4px_4px_0px_#0A0A0A] w-full md:w-auto">
            <button 
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 font-label-mono text-label-mono uppercase transition-all font-bold flex-1 md:flex-none ${viewMode === 'month' ? 'bg-primary text-on-primary border-[3px] border-on-surface' : 'hover:bg-surface-variant text-on-surface-variant'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 font-label-mono text-label-mono uppercase transition-all font-bold flex-1 md:flex-none ${viewMode === 'week' ? 'bg-primary text-on-primary border-[3px] border-on-surface' : 'hover:bg-surface-variant text-on-surface-variant'}`}
            >
              Week
            </button>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <div className="flex-1 flex flex-col bg-surface p-4 md:p-6 overflow-hidden">
          <div className="flex flex-col h-full border-[3px] border-on-surface bg-surface-container-lowest shadow-[8px_8px_0px_#0A0A0A] overflow-hidden">
            
            {/* Grid Header */}
            <div className="grid grid-cols-7 border-b-[3px] border-on-surface bg-primary-fixed-dim">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center font-label-mono uppercase font-black border-r-[3px] border-on-surface last:border-r-0 tracking-widest text-on-surface">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className={`grid grid-cols-7 flex-1 overflow-y-auto ${viewMode === 'month' ? 'grid-rows-[repeat(5,minmax(120px,1fr))] md:grid-rows-5' : 'grid-rows-1'}`}>
              {calendarDays.map((day, idx) => {
                const dayTasks = tasks.filter(t => t.dueAt && isSameDay(parseISO(t.dueAt), day));
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);

                return (
                  <div 
                    key={idx} 
                    className={`border-r-[3px] border-b-[3px] border-on-surface last:border-r-[3px] md:last:border-r-0 p-2 flex flex-col transition-colors group ${isCurrentMonth ? 'bg-surface hover:bg-surface-container-low' : 'bg-surface-variant opacity-60'} ${idx >= calendarDays.length - 7 ? 'border-b-0' : ''}`}
                  >
                    {/* Day Number Indicator */}
                    <div className="flex justify-between items-start mb-2">
                      <div className={`font-label-mono text-lg font-black w-8 h-8 flex items-center justify-center border-[2px] border-transparent ${isCurrentDay ? 'bg-primary text-on-primary border-on-surface shadow-[2px_2px_0px_#0A0A0A]' : 'text-on-surface'}`}>
                        {format(day, 'd')}
                      </div>
                      {(!isBefore(day, startOfDay(new Date()))) && (
                        <button 
                          onClick={() => {
                            setNewTaskForm({ title: '', description: '', dueAt: format(day, "yyyy-MM-dd'T'12:00"), estimatedMinutes: '' });
                            setIsModalOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center border-2 border-on-surface bg-surface hover:bg-surface-variant text-on-surface font-bold">
                          <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                      )}
                    </div>

                    {/* Task Chips */}
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar pr-1">
                      {dayTasks.map(t => (
                        <div 
                          key={t.id} 
                          className={`text-xs font-label-mono-sm p-2 border-[2px] shadow-[2px_2px_0px_#0A0A0A] font-bold flex flex-col gap-1 cursor-pointer hover:-translate-y-0.5 transition-transform relative group/chip ${getRiskColor(t.riskLevel)}`}
                          title={t.title}
                          onClick={(e) => {
                            if (t.status !== 'done') handleCompleteTask(t.id, e);
                          }}
                        >
                          {processingId === t.id && (
                            <div className="absolute inset-0 bg-surface/50 flex items-center justify-center z-10">
                              <span className="material-symbols-outlined animate-spin">hourglass_empty</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center opacity-80">
                            <span>{format(parseISO(t.dueAt!), 'HH:mm')}</span>
                            {t.status === 'done' ? (
                              <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            ) : (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === t.id ? null : t.id);
                                }}
                                className="opacity-0 group-hover/chip:opacity-100 hover:bg-surface/20 rounded"
                              >
                                <span className="material-symbols-outlined text-[14px]">more_vert</span>
                              </button>
                            )}
                          </div>
                          <div className={`truncate ${t.status === 'done' ? 'line-through opacity-70' : ''}`}>
                            {t.title}
                          </div>

                          {/* Action Menu Dropdown */}
                          {activeMenuId === t.id && (
                            <div className="absolute top-6 right-0 bg-surface border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] z-20 flex flex-col w-40 font-label-mono text-[10px] uppercase font-bold text-on-surface">
                              <button 
                                onClick={(e) => handleAgentTrigger(t.id, 'plan', e)}
                                className="text-left px-2 py-2 hover:bg-surface-variant border-b-2 border-on-surface flex items-center gap-1 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">account_tree</span>
                                Break Down
                              </button>
                              <button 
                                onClick={(e) => handleAgentTrigger(t.id, 'schedule', e)}
                                className="text-left px-2 py-2 hover:bg-surface-variant border-b-2 border-on-surface flex items-center gap-1 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">event_available</span>
                                Schedule
                              </button>
                              <button 
                                onClick={(e) => handleAgentTrigger(t.id, 'lastMinute', e)}
                                className="text-left px-2 py-2 hover:bg-surface-variant flex items-center gap-1 transition-colors text-tertiary"
                              >
                                <span className="material-symbols-outlined text-[14px]">emergency</span>
                                Extension
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    </div>
    );
  })}
            </div>
          </div>
        </div>
      </main>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-on-surface/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border-[3px] border-on-surface p-6 shadow-[8px_8px_0px_#0A0A0A] w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md font-black uppercase">Create New Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-mono-sm font-bold uppercase">Title *</label>
                <input 
                  type="text" 
                  required
                  value={newTaskForm.title}
                  onChange={e => setNewTaskForm({...newTaskForm, title: e.target.value})}
                  className="bg-surface-container-lowest border-2 border-on-surface p-3 font-body-md focus:outline-none focus:border-primary shadow-[2px_2px_0px_#0A0A0A]"
                  placeholder="What needs to get done?"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="font-label-mono-sm font-bold uppercase">Description</label>
                <textarea 
                  value={newTaskForm.description}
                  onChange={e => setNewTaskForm({...newTaskForm, description: e.target.value})}
                  className="bg-surface-container-lowest border-2 border-on-surface p-3 font-body-md focus:outline-none focus:border-primary shadow-[2px_2px_0px_#0A0A0A] min-h-[100px]"
                  placeholder="Optional details..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-label-mono-sm font-bold uppercase">Due Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={newTaskForm.dueAt}
                    onChange={e => setNewTaskForm({...newTaskForm, dueAt: e.target.value})}
                    className="bg-surface-container-lowest border-2 border-on-surface p-3 font-body-md focus:outline-none focus:border-primary shadow-[2px_2px_0px_#0A0A0A]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-mono-sm font-bold uppercase">Estimated Minutes</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newTaskForm.estimatedMinutes}
                    onChange={e => setNewTaskForm({...newTaskForm, estimatedMinutes: e.target.value})}
                    className="bg-surface-container-lowest border-2 border-on-surface p-3 font-body-md focus:outline-none focus:border-primary shadow-[2px_2px_0px_#0A0A0A]"
                    placeholder="e.g. 30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-label-mono font-bold uppercase hover:bg-surface-variant transition-colors border-2 border-transparent"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newTaskForm.title.trim()}
                  className="bg-primary text-on-primary border-[3px] border-on-surface px-6 py-3 font-label-mono font-bold uppercase shadow-[4px_4px_0px_#0A0A0A] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
