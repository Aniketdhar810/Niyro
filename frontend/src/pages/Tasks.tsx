import React, { useState } from 'react';
import { SideNav } from '../components/SideNav';
import { useDashboardData, type TaskData } from '../hooks/useDashboardData';
import { 
  format, parseISO, isToday, isTomorrow, isFuture
} from 'date-fns';
import { api } from '../lib/apiClient';

type ViewMode = 'list' | 'board';

export const Tasks: React.FC = () => {
  const { tasks, loading } = useDashboardData();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', description: '', dueAt: '', estimatedMinutes: '' });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="w-16 h-16 border-border-width-heavy border-on-surface border-t-primary rounded-full animate-spin"></div>
        </div>
    );
  }

  // Derived tasks for List View
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  
  const todayTasks = pendingTasks.filter(t => t.dueAt && isToday(parseISO(t.dueAt)));
  const tomorrowTasks = pendingTasks.filter(t => t.dueAt && isTomorrow(parseISO(t.dueAt)));
  const upcomingTasks = pendingTasks.filter(t => t.dueAt && isFuture(parseISO(t.dueAt)) && !isToday(parseISO(t.dueAt)) && !isTomorrow(parseISO(t.dueAt)));
  const noDateTasks = pendingTasks.filter(t => !t.dueAt);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-tertiary text-on-tertiary';
      case 'at_risk': return 'bg-secondary text-on-secondary';
      case 'on_track': return 'bg-secondary-container text-on-secondary-container';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'gmail': return 'mail';
      case 'slack': return 'forum';
      case 'telegram': return 'chat';
      case 'voice': return 'mic';
      default: return 'edit_document';
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setProcessingId(taskId);
      await api.completeTask(taskId);
      // Removed optimistic UI update since onSnapshot handles it
    } catch (e) {
      console.error(e);
      alert('Failed to complete task.');
    } finally {
      setProcessingId(null);
    }
  };

  const toggleTaskStep = async (taskId: string, stepId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.steps) return;
    
    const updatedSteps = task.steps.map(step => 
      step.id === stepId ? { ...step, done: !step.done } : step
    );
    
    try {
      await api.updateTask(taskId, { steps: updatedSteps });
    } catch (e) {
      console.error('Failed to update step:', e);
    }
  };

  const handleAgentTrigger = async (taskId: string, agent: 'plan' | 'schedule' | 'lastMinute') => {
    try {
      setProcessingId(taskId);
      setActiveMenuId(null);
      if (agent === 'plan') await api.planTask(taskId);
      if (agent === 'schedule') await api.scheduleTask(taskId);
      if (agent === 'lastMinute') await api.lastMinuteTask(taskId);
      alert('Agent triggered successfully.');
    } catch (e: any) {
      console.error(e);
      alert(`Agent failed to run: ${e.message || 'Unknown error'}`);
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
    } catch (error) {
      console.error(error);
      alert('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTaskRow = (task: TaskData) => (
    <div key={task.id} className="bg-surface-container-lowest border-2 border-on-surface p-4 flex flex-col gap-4 group hover:bg-surface-variant transition-colors mb-2">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <input 
            type="checkbox" 
            checked={task.status === 'done'}
            onChange={() => handleCompleteTask(task.id)}
            disabled={processingId === task.id}
            className="appearance-none w-6 h-6 border-2 border-on-surface bg-surface cursor-pointer checked:bg-secondary-fixed relative shrink-0 disabled:opacity-50
            checked:after:content-[''] checked:after:absolute checked:after:left-[6px] checked:after:top-[2px] checked:after:w-[8px] checked:after:h-[14px] checked:after:border-solid checked:after:border-on-surface checked:after:border-b-2 checked:after:border-r-2 checked:after:rotate-45"
          />
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-body-lg text-body-lg font-bold truncate">{task.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`font-label-mono-sm text-label-mono-sm px-2 py-0.5 border-2 border-on-surface flex items-center gap-1 font-bold ${getRiskColor(task.riskLevel || 'on_track')}`}>
                <span className="material-symbols-outlined text-[10px]">
                  {(task.riskLevel || 'on_track') === 'critical' ? 'error' : (task.riskLevel || 'on_track') === 'at_risk' ? 'warning' : 'check_circle'}
                </span>
                {(task.riskLevel || 'on_track').replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pl-10 md:pl-0 mt-2 md:mt-0 relative">
          {processingId === task.id && (
            <span className="material-symbols-outlined animate-spin text-on-surface-variant">hourglass_empty</span>
          )}
          <div className="font-label-mono-sm text-label-mono-sm px-2 py-1 border-2 border-on-surface bg-surface flex items-center gap-1 uppercase font-bold">
            <span className="material-symbols-outlined text-[14px]">{getSourceIcon(task.source || 'manual')}</span>
            {task.source || 'manual'}
          </div>
          <div className={`font-label-mono text-label-mono font-bold text-right w-auto md:w-24 ${task.riskLevel === 'critical' ? 'text-tertiary' : 'text-on-surface'}`}>
            {task.dueAt ? format(parseISO(task.dueAt), 'HH:mm') : 'Anytime'}
          </div>
          <button 
            onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
            className="w-8 h-8 flex items-center justify-center hover:bg-surface-dim border-2 border-transparent hover:border-on-surface transition-all"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>

          {/* Action Menu Dropdown */}
          {activeMenuId === task.id && (
            <div className="absolute right-0 top-10 bg-surface border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] z-20 flex flex-col w-48 font-label-mono text-label-mono-sm uppercase font-bold">
              <button 
                onClick={() => handleAgentTrigger(task.id, 'plan')}
                className="text-left px-4 py-3 hover:bg-surface-variant border-b-2 border-on-surface flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                Break Down
              </button>
              <button 
                onClick={() => handleAgentTrigger(task.id, 'schedule')}
                className="text-left px-4 py-3 hover:bg-surface-variant border-b-2 border-on-surface flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">event_available</span>
                Schedule
              </button>
              <button 
                onClick={() => handleAgentTrigger(task.id, 'lastMinute')}
                className="text-left px-4 py-3 hover:bg-surface-variant flex items-center gap-2 transition-colors text-tertiary"
              >
                <span className="material-symbols-outlined text-[16px]">emergency</span>
                Negotiate Extension
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Steps Rendering */}
      {task.steps && task.steps.length > 0 && (
        <div className="pl-0 md:pl-10 mt-2 border-t-2 border-on-surface/20 pt-4">
          <h4 className="font-label-mono text-label-mono-sm uppercase text-on-surface-variant font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">account_tree</span>
            AI Breakdown
          </h4>
          <ul className="flex flex-col gap-3">
            {task.steps.map((step: any) => (
              <li key={step.id} className="flex items-start gap-3 bg-surface p-3 border-2 border-on-surface shadow-[2px_2px_0px_#0A0A0A]">
                <input 
                  type="checkbox" 
                  checked={step.done || false}
                  onChange={() => toggleTaskStep(task.id, step.id)}
                  className="mt-0.5 appearance-none cursor-pointer w-5 h-5 border-2 border-on-surface bg-surface checked:bg-secondary-fixed relative shrink-0
                  checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[7px] checked:after:h-[12px] checked:after:border-solid checked:after:border-on-surface checked:after:border-b-2 checked:after:border-r-2 checked:after:rotate-45"
                />
                <div className="flex-1 flex flex-col min-w-0">
                  <span className="font-body-md font-bold text-on-surface break-words">{step.title}</span>
                  {step.ifThenTrigger && (
                    <span className="font-body-md text-sm text-on-surface-variant mt-1 border-l-2 border-on-surface/30 pl-2">
                      <span className="font-bold">Trigger:</span> {step.ifThenTrigger}
                    </span>
                  )}
                  {step.scheduledAt && (
                    <div className="mt-2 flex items-center gap-1 font-label-mono text-[10px] font-bold uppercase tracking-wider text-on-secondary-fixed bg-secondary-fixed px-2 py-1 self-start border border-on-surface">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {format(parseISO(step.scheduledAt), 'MMM dd, HH:mm')}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-2 md:p-4 flex justify-center">
      <div className="bg-surface text-on-surface font-body-md flex w-full max-w-[1600px] border-2 border-on-surface shadow-[8px_8px_0px_#1c1b1b] min-h-[calc(100vh-1rem)] relative pb-16 md:pb-0 overflow-hidden">
      <SideNav />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-auto md:h-20 border-b-[3px] border-on-surface bg-surface flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-8 shrink-0 gap-4 md:gap-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto">
            <h1 className="font-headline-md font-bold tracking-tighter uppercase hidden md:block">TASKS</h1>
            
            {/* View Toggles */}
            <div className="flex bg-surface-container-high border-2 border-on-surface p-1 gap-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 font-label-mono text-label-mono uppercase transition-all font-bold ${viewMode === 'list' ? 'bg-surface border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A]' : 'hover:bg-surface-variant text-on-surface-variant'}`}
              >
                List
              </button>
              <button 
                onClick={() => setViewMode('board')}
                className={`px-4 py-2 font-label-mono text-label-mono uppercase transition-all font-bold ${viewMode === 'board' ? 'bg-surface border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A]' : 'hover:bg-surface-variant text-on-surface-variant'}`}
              >
                Board
              </button>
            </div>
          </div>
          
          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-surface border-2 border-on-surface font-label-mono-sm text-label-mono-sm uppercase font-bold flex items-center gap-1 hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-sm">filter_list</span> Priority
              </button>
              <button className="px-3 py-1.5 bg-surface border-2 border-on-surface font-label-mono-sm text-label-mono-sm uppercase font-bold flex items-center gap-1 hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-sm">filter_list</span> Source
              </button>
              <button className="hidden lg:flex px-3 py-1.5 bg-surface border-2 border-on-surface font-label-mono-sm text-label-mono-sm uppercase font-bold items-center gap-1 hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-sm">filter_list</span> Status
              </button>
            </div>
            <div className="hidden md:block w-[3px] h-8 bg-on-surface"></div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-on-primary border-[3px] border-on-surface px-4 py-2 md:px-6 font-label-mono text-label-mono uppercase shadow-[4px_4px_0px_#0A0A0A] active:shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2 font-bold ml-auto md:ml-0"
            >
              <span className="material-symbols-outlined">add</span>
              <span className="hidden md:inline">New Task</span>
            </button>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <div className="flex-1 overflow-y-auto bg-surface p-4 md:p-8">
          <div className="max-w-6xl mx-auto flex flex-col gap-4 pb-20">
            
            {viewMode === 'list' && (
              <>
                {todayTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-4 mb-2 mt-4">
                      <h2 className="font-headline-md text-headline-md uppercase tracking-tight font-black">Today</h2>
                      <div className="h-[3px] bg-on-surface flex-1"></div>
                      <span className="font-label-mono-sm text-label-mono-sm bg-surface-container-high px-2 py-1 border-2 border-on-surface font-bold">
                        {format(new Date(), 'MMM dd').toUpperCase()}
                      </span>
                    </div>
                    {todayTasks.map(renderTaskRow)}
                  </div>
                )}
                
                {tomorrowTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-4 mb-2 mt-8">
                      <h2 className="font-headline-md text-headline-md uppercase tracking-tight text-on-surface-variant font-black">Tomorrow</h2>
                      <div className="h-[2px] bg-outline-variant flex-1"></div>
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant px-2 py-1 border-2 border-outline-variant font-bold">
                        {format(new Date(Date.now() + 86400000), 'MMM dd').toUpperCase()}
                      </span>
                    </div>
                    {tomorrowTasks.map(renderTaskRow)}
                  </div>
                )}

                {upcomingTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-4 mb-2 mt-8">
                      <h2 className="font-headline-md text-headline-md uppercase tracking-tight text-on-surface-variant font-black">Upcoming</h2>
                      <div className="h-[2px] bg-outline-variant flex-1"></div>
                    </div>
                    {upcomingTasks.map(renderTaskRow)}
                  </div>
                )}
                
                {noDateTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-4 mb-2 mt-8">
                      <h2 className="font-headline-md text-headline-md uppercase tracking-tight text-on-surface-variant font-black">Someday</h2>
                      <div className="h-[2px] bg-outline-variant flex-1"></div>
                    </div>
                    {noDateTasks.map(renderTaskRow)}
                  </div>
                )}

                {pendingTasks.length === 0 && (
                  <div className="text-center py-20 font-label-mono text-on-surface-variant uppercase">
                    No pending tasks. You're all caught up!
                  </div>
                )}
              </>
            )}

            {viewMode === 'board' && (
              <div className="text-center py-20 font-label-mono text-on-surface-variant uppercase font-bold">
                Board view coming soon.
              </div>
            )}
            
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
