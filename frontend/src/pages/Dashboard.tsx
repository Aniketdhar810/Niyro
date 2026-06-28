import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { SideNav } from '../components/SideNav';
import { format, parseISO, isToday, isFuture, differenceInMinutes } from 'date-fns';
import { api } from '../lib/apiClient';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData, tasks, activities, approvals, loading } = useDashboardData();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Derived calculations
  const focusScore = userData?.momentum?.focusScore ?? 0;
  
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const highPriorityTasks = pendingTasks.filter(t => t.riskLevel === 'critical' || t.riskLevel === 'at_risk');
  
  // Next deadline calculation
  const upcomingTasks = pendingTasks
    .filter(t => t.dueAt && isFuture(parseISO(t.dueAt)))
    .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());
  const nextDeadlineTask = upcomingTasks.length > 0 ? upcomingTasks[0] : null;
  
  const formatTimeLeft = (dateString?: string) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    const mins = differenceInMinutes(date, new Date());
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 48) return `${Math.floor(hours / 24)} days left`;
    if (hours > 0) return `In ${hours} hr, ${remainingMins} min`;
    return `In ${mins} min`;
  };

  // Day Risk calculation
  let dayRisk = 'LOW';
  let dayRiskColor = 'text-primary';
  let dayRiskBorder = 'border-l-primary';
  if (pendingTasks.some(t => t.riskLevel === 'critical')) {
    dayRisk = 'HIGH';
    dayRiskColor = 'text-tertiary';
    dayRiskBorder = 'border-l-tertiary';
  } else if (pendingTasks.some(t => t.riskLevel === 'at_risk')) {
    dayRisk = 'MEDIUM';
    dayRiskColor = 'text-secondary';
    dayRiskBorder = 'border-l-secondary';
  }

  // Schedule calculation
  const scheduleItems = useMemo(() => {
    const items: { id: string; time: string; title: string; done: boolean }[] = [];
    tasks.forEach(t => {
      t.steps?.forEach(step => {
        if (step.scheduledAt && isToday(parseISO(step.scheduledAt))) {
          items.push({
            id: step.id,
            time: format(parseISO(step.scheduledAt), 'HH:mm'),
            title: step.title,
            done: !!step.done
          });
        }
      });
    });
    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="w-16 h-16 border-4 border-on-surface border-t-primary rounded-full animate-spin"></div>
        </div>
    );
  }

  const handleUndo = async (activityId: string) => {
    try {
      setProcessingId(activityId);
      await api.undoActivity(activityId);
    } catch (e) {
      console.error('Failed to undo:', e);
      alert('Failed to undo action.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      setProcessingId(approvalId);
      await api.approveAction(approvalId);
    } catch (e) {
      console.error('Failed to approve:', e);
      alert('Failed to approve action.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      setProcessingId(approvalId);
      await api.rejectAction(approvalId);
    } catch (e) {
      console.error('Failed to reject:', e);
      alert('Failed to reject action.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-2 md:p-4 flex justify-center">
      <div className="bg-surface text-on-surface font-body-md flex w-full max-w-[1600px] border-2 border-on-surface shadow-[8px_8px_0px_#1c1b1b] min-h-[calc(100vh-1rem)] relative pb-16 md:pb-0 overflow-hidden">
      <SideNav />

      {/* Main Content Canvas */}
      <main className="flex-1 min-h-screen p-margin-mobile md:p-margin-desktop flex flex-col gap-gutter max-w-7xl mx-auto w-full mb-12">
        {/* Header & Quick Add */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b-border-width border-on-surface">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold mb-2">Good morning, {user?.displayName?.split(' ')[0] || 'User'}.</h1>
            <p className="font-label-mono text-label-mono text-on-surface-variant uppercase">
              System Status: <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 border-border-width border-on-surface ml-1 rounded-full text-xs font-bold">OPTIMAL</span>
            </p>
          </div>
        </header>

        {/* Pending Approvals Widget */}
        {approvals && approvals.length > 0 && (
          <section className="bg-tertiary-container text-on-tertiary-container border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] p-6 mt-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="material-symbols-outlined text-4xl opacity-20">warning</span>
            </div>
            <h2 className="font-headline-md font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined bg-on-surface text-surface rounded-full p-1 text-sm">priority_high</span>
              ACTION REQUIRED
            </h2>
            <div className="flex flex-col gap-4">
              {approvals.map(approval => (
                <div key={approval.id} className="bg-surface text-on-surface p-4 border-2 border-on-surface relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-mono text-label-mono-sm font-bold uppercase tracking-wider bg-surface-variant px-2 py-0.5 border border-on-surface">
                      {approval.type === 'negotiation_email' ? 'Draft: Deferral' : 'Draft: Notification'}
                    </span>
                    <span className="font-label-mono text-[10px] text-on-surface-variant">To: {approval.recipient}</span>
                  </div>
                  <p className="font-body-md text-sm mb-4 italic opacity-90 border-l-2 border-on-surface pl-3 py-1">"{approval.draftContent}"</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(approval.id)}
                      disabled={processingId === approval.id}
                      className="bg-primary text-on-primary font-label-mono font-bold uppercase px-4 py-2 border-2 border-on-surface hover:shadow-[2px_2px_0px_#0A0A0A] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      Approve & Send
                    </button>
                    <button 
                      onClick={() => handleReject(approval.id)}
                      disabled={processingId === approval.id}
                      className="bg-surface-variant text-on-surface-variant font-label-mono font-bold uppercase px-4 py-2 border-2 border-on-surface hover:shadow-[2px_2px_0px_#0A0A0A] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Overview Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mt-4">
          {/* Focus Score Tile */}
          <div className="bg-secondary-fixed text-on-secondary-fixed p-6 border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] flex flex-col justify-between h-48 relative overflow-hidden group">
            <h3 className="font-label-mono text-label-mono uppercase font-bold">Focus Score</h3>
            <div className="flex items-end gap-2 z-10 relative">
              <span className="font-headline-lg text-headline-lg font-bold">{focusScore}</span>
            </div>
            {/* Abstract Sparkline */}
            <svg className="absolute bottom-0 left-0 w-full h-16 opacity-50 z-0" preserveAspectRatio="none" viewBox="0 0 100 20">
              <polyline fill="none" points="0,20 20,15 40,18 60,8 80,12 100,2" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"></polyline>
            </svg>
          </div>

          {/* Tasks Left Tile */}
          <div className="bg-surface-container-lowest p-6 border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] flex flex-col justify-between h-48">
            <h3 className="font-label-mono text-label-mono uppercase font-bold text-on-surface-variant">Tasks Left Today</h3>
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg font-bold">{pendingTasks.length}</span>
              <span className="font-label-mono text-label-mono-sm text-on-surface-variant mt-2">{highPriorityTasks.length} high priority</span>
            </div>
          </div>

          {/* Next Deadline Tile (Risk) */}
          <div className={`bg-surface-container-lowest p-6 border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] flex flex-col justify-between h-48 border-l-8 ${nextDeadlineTask?.riskLevel === 'critical' ? 'border-l-tertiary' : nextDeadlineTask?.riskLevel === 'at_risk' ? 'border-l-secondary' : 'border-l-primary'}`}>
            <div className="flex justify-between items-start">
              <h3 className="font-label-mono text-label-mono uppercase font-bold text-on-surface-variant">Next Deadline</h3>
              {nextDeadlineTask && (
                <span className={`px-2 py-0.5 rounded-full font-label-mono text-[10px] border border-on-surface font-bold uppercase tracking-wider ${
                  nextDeadlineTask.riskLevel === 'critical' ? 'bg-tertiary text-on-tertiary' : 
                  nextDeadlineTask.riskLevel === 'at_risk' ? 'bg-secondary text-on-secondary' : 
                  'bg-primary text-on-primary'
                }`}>
                  {(nextDeadlineTask.riskLevel || 'on_track').replace('_', ' ')}
                </span>
              )}
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md font-bold truncate">
                {nextDeadlineTask ? nextDeadlineTask.title : 'No pending deadlines'}
              </h4>
              {nextDeadlineTask && (
                <p className={`font-label-mono text-label-mono-sm mt-1 font-bold ${
                  nextDeadlineTask.riskLevel === 'critical' ? 'text-tertiary' : 
                  nextDeadlineTask.riskLevel === 'at_risk' ? 'text-secondary' : 
                  'text-primary'
                }`}>
                  {formatTimeLeft(nextDeadlineTask.dueAt)}
                </p>
              )}
            </div>
          </div>

          {/* Risk Assessment Tile */}
          <div className={`bg-surface-container-lowest p-6 border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] flex flex-col justify-between h-48 border-l-8 ${dayRiskBorder}`}>
            <div className="flex justify-between items-start">
              <h3 className="font-label-mono text-label-mono uppercase font-bold text-on-surface-variant">Day Risk</h3>
            </div>
            <div className="flex flex-col h-full justify-end">
              <span className={`font-headline-lg text-headline-lg font-bold ${dayRiskColor}`}>{dayRisk}</span>
            </div>
          </div>
        </section>

        {/* Main Workspace Area */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mt-8">
          {/* Agent Activity Feed */}
          <div className="lg:col-span-2 bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-border-width border-on-surface">
              <h2 className="font-headline-md text-headline-md font-bold">What Niyro did for you today</h2>
              <div className="h-8 w-auto flex items-center">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfQBjXRW5ky7-M-tCH4Fy0LGOVBqSGGHGD_LcqF2nsslXvlBpLn1Cnw0LLyPbdjSybMk3ou3rzdMUr0YkFYliyEYLvEc0ZIx6WuN6qtI10nxIi5Ly4OvDUzREykNp0PvsgLtu28YcGiQ6Fb1Z7nJ5SkEFiUNay3onC0VCGk8qSI9zg2gjy6ut7BZj3PazsZ3VxAwx1zTZs7vcKBteD39ASQreFjzBOi0yevIFmZdDQgCnGXaZkhVNFobMT9tGhfYUMjYU" alt="Niyro Logo" className="h-full w-auto object-contain" />
              </div>
            </div>
            
            <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-on-surface">
              {activities.length === 0 ? (
                <div className="text-on-surface-variant font-label-mono text-sm py-4">No agent activity today.</div>
              ) : (
                activities.map((act, index) => (
                  <div key={act.id} className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                    <span className={`absolute -left-6 top-1 w-3 h-3 border-2 border-on-surface rounded-full ${index === 0 ? 'bg-primary' : 'bg-surface-variant'}`}></span>
                    <div className="flex flex-col">
                      <span className="font-label-mono text-label-mono-sm text-on-surface-variant mb-1">
                        {act.timestamp?.toDate ? format(act.timestamp.toDate(), 'hh:mm a') : 'Just now'}
                      </span>
                      <p className="font-body-md font-medium">
                        <span className="bg-secondary-fixed px-1 font-bold border border-on-surface mr-1">{act.action}</span>
                        {act.description}
                      </p>
                      {act.source && (
                        <div className="mt-2 inline-flex">
                          <span className="bg-surface-variant text-on-surface font-label-mono text-[10px] px-2 py-0.5 rounded-full border border-on-surface uppercase tracking-wider">
                            [{act.source}]
                          </span>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleUndo(act.id)}
                      disabled={processingId === act.id}
                      className="text-on-surface-variant hover:text-on-surface font-label-mono text-label-mono-sm border-b-border-width border-transparent hover:border-on-surface transition-all flex items-center gap-1 self-start md:self-center opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">{processingId === act.id ? 'hourglass_empty' : 'undo'}</span> 
                      {processingId === act.id ? 'Undoing...' : 'Undo'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Context / Actions Panel */}
          <div className="flex flex-col gap-6">
            {/* Schedule */}
            <div className="bg-surface-container-lowest p-4 border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] max-h-64 overflow-y-auto">
              <h3 className="font-label-mono text-label-mono uppercase font-bold text-on-surface-variant mb-4 sticky top-0 bg-surface-container-lowest z-10 py-1">Schedule</h3>
              
              {scheduleItems.length === 0 ? (
                <div className="text-on-surface-variant font-label-mono text-sm py-4">No scheduled events.</div>
              ) : (
                <ul className="flex flex-col gap-0 font-label-mono text-label-mono-sm">
                  {scheduleItems.map((item, idx) => (
                    <li key={idx} className={`flex gap-4 py-2 ${idx !== scheduleItems.length - 1 ? 'border-b-border-width border-on-surface' : ''} ${item.done ? 'opacity-50 line-through' : ''}`}>
                      <span className="w-12 text-right">{item.time}</span>
                      <span className="font-bold">{item.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Action Card */}
            <div className="bg-primary text-on-primary p-6 border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A]">
              <h3 className="font-headline-md text-headline-md font-bold mb-2">Engage Focus Mode</h3>
              <p className="font-body-md mb-6 opacity-90">Mute notifications and lock apps for the next 90 minutes to clear critical tasks.</p>
              <button 
                onClick={() => navigate('/focus')}
                className="w-full bg-surface-container-lowest text-on-surface p-3 border-2 border-on-surface font-label-mono text-label-mono font-bold flex justify-center items-center gap-2 transition-transform active:translate-y-1 active:translate-x-1 shadow-[4px_4px_0px_#0A0A0A] active:shadow-none hover:shadow-[2px_2px_0px_#0A0A0A] hover:translate-y-[2px] hover:translate-x-[2px]"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                START TIMER
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Marquee */}
      <footer className="fixed bottom-0 left-0 w-full md:left-0 w-full py-2 overflow-hidden whitespace-nowrap flex justify-center items-center bg-secondary-fixed text-on-secondary-fixed border-t-border-width-heavy border-on-surface font-label-mono text-label-mono-sm z-40">
        <div className="flex gap-4 animate-[marquee_20s_linear_infinite]">
          <span>NEVER LATE AGAIN ✦ AI THAT ACTUALLY ACTS ✦ SYSTEM STATUS: OPTIMAL ✦</span>
          <span>NEVER LATE AGAIN ✦ AI THAT ACTUALLY ACTS ✦ SYSTEM STATUS: OPTIMAL ✦</span>
          <span>NEVER LATE AGAIN ✦ AI THAT ACTUALLY ACTS ✦ SYSTEM STATUS: OPTIMAL ✦</span>
        </div>
      </footer>
      </div>
    </div>
  );
};
