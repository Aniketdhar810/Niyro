import React, { useState, useEffect } from 'react';
import { SideNav } from '../components/SideNav';
import { useDashboardData } from '../hooks/useDashboardData';
import { useUserSettings } from '../hooks/useUserSettings';

export const Focus: React.FC = () => {
  const { tasks, loading: tasksLoading } = useDashboardData();
  const { settings, loading: settingsLoading } = useUserSettings();
  
  const durationMinutes = settings?.focusPrefs?.durationMinutes || 45;
  const totalTime = durationMinutes * 60;
  
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isActive, setIsActive] = useState(true);
  const [showDistractions, setShowDistractions] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (!settingsLoading) {
      // Only set initial time if we just finished loading settings
      // and we haven't started ticking down yet.
      setTimeLeft(durationMinutes * 60);
    }
  }, [settingsLoading, durationMinutes]);

  if (tasksLoading || settingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="w-16 h-16 border-[3px] border-on-surface border-t-primary rounded-full animate-spin"></div>
        </div>
    );
  }

  const activeTask = tasks.find(t => t.status === 'in_progress') || { title: 'Focused Work Session' };
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };


  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  // Circumference of a circle with r=46 is 2 * Math.PI * 46 ~= 289
  const circumference = 289;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-2 md:p-4 flex justify-center">
      <div className="bg-surface text-on-surface font-body-md flex w-full max-w-[1600px] border-2 border-on-surface shadow-[8px_8px_0px_#1c1b1b] min-h-[calc(100vh-1rem)] relative pb-16 md:pb-0 overflow-hidden">
      <SideNav />

      {/* Background structural grid lines (subtle) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10 flex justify-center w-full">
        <div className="w-full h-full grid grid-cols-4 md:grid-cols-12 gap-gutter px-4 md:px-10">
          <div className="border-l-[2px] border-on-surface h-full"></div>
          <div className="border-l-[2px] border-on-surface h-full hidden md:block"></div>
          <div className="border-l-[2px] border-on-surface h-full hidden md:block"></div>
          <div className="border-l-[2px] border-on-surface h-full"></div>
          <div className="border-l-[2px] border-on-surface h-full hidden md:block"></div>
          <div className="border-l-[2px] border-on-surface h-full hidden md:block"></div>
          <div className="border-l-[2px] border-on-surface h-full text-center relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-on-surface transform -translate-x-1/2"></div>
          </div>
          <div className="border-l-[2px] border-on-surface h-full hidden md:block"></div>
          <div className="border-l-[2px] border-on-surface h-full hidden md:block"></div>
          <div className="border-l-[2px] border-on-surface h-full"></div>
          <div className="border-l-[2px] border-on-surface h-full hidden md:block"></div>
          <div className="border-l-[2px] border-r-[2px] border-on-surface h-full hidden md:block"></div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto z-10 w-full pt-20 md:pt-0">
        
        {/* Minimal Header indicating System Status */}
        <div className="absolute top-8 left-4 right-4 md:left-12 md:right-12 flex justify-between items-center font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase tracking-widest bg-surface p-2 border-[3px] border-on-surface shadow-[4px_4px_0px_#0A0A0A] max-w-4xl mx-auto w-full md:w-auto md:border-none md:shadow-none md:bg-transparent">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full border-[2px] border-on-surface ${isActive ? 'bg-secondary-fixed animate-pulse' : 'bg-surface-variant'}`}></div>
            <span className="font-bold">{isActive ? 'Focus Protocol Engaged' : 'Focus Protocol Paused'}</span>
          </div>
          <div className="font-bold hidden md:block">Phase 2 / 4</div>
        </div>

        {/* Task Anchor */}
        <div className="text-center mb-8 md:mb-16 max-w-2xl px-6 relative mt-16 md:mt-8 z-30 shrink-0">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-black uppercase text-on-surface tracking-tighter leading-none relative inline-block z-10 bg-surface px-4 py-2 border-[3px] border-on-surface shadow-[4px_4px_0px_#0A0A0A]">
            {activeTask.title}
          </h1>
        </div>

        {/* The Timer Core */}
        <div className="relative w-[300px] h-[300px] md:w-[480px] md:h-[480px] flex items-center justify-center mb-12 group cursor-pointer shrink-0" onClick={() => setIsActive(!isActive)}>
          {/* Structural Rings */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-[8px_8px_0px_rgba(10,10,10,1)]" viewBox="0 0 100 100">
            {/* Base heavy black ring */}
            <circle className="text-on-surface" cx="50" cy="50" fill="var(--surface)" r="44" stroke="currentColor" strokeWidth="2"></circle>
            <circle className="text-on-surface" cx="50" cy="50" fill="transparent" r="48" stroke="currentColor" strokeWidth="3"></circle>
            {/* Progress Arc (Lime) */}
            <circle 
              className="text-secondary-fixed transition-all duration-1000 ease-linear" 
              cx="50" cy="50" 
              fill="transparent" 
              r="46" 
              stroke="currentColor" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              strokeWidth="4"
            ></circle>
            {/* Inner technical ring */}
            <circle className="text-on-surface opacity-30" cx="50" cy="50" fill="transparent" r="32" stroke="currentColor" strokeDasharray="2 4" strokeWidth="1"></circle>
          </svg>

          {/* Countdown Typography */}
          <div className="relative z-10 flex flex-col items-center justify-center mt-2">
            <span className="font-display-xl text-[70px] md:text-[140px] font-black tracking-tighter text-on-surface leading-none tabular-nums bg-surface p-2">
              {formatTime(timeLeft)}
            </span>
            <span className="font-label-mono text-label-mono text-on-surface uppercase tracking-[0.2em] mt-4 font-bold bg-surface-container-high px-4 border-[3px] border-on-surface rounded-full py-1 shadow-[2px_2px_0px_#0A0A0A]">
              {isActive ? 'Remaining' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls & Status */}
        <div className="flex flex-col items-center gap-8 w-full max-w-md px-4 relative z-20">
          {/* End Session Button */}
          <button 
            onClick={() => {
              setIsActive(false);
              setTimeLeft(totalTime);
            }}
            className="rounded-full bg-surface text-on-surface font-label-mono text-label-mono font-bold uppercase tracking-widest px-10 py-4 border-[3px] border-on-surface shadow-[4px_4px_0px_#0A0A0A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#0A0A0A] transition-all flex items-center gap-3 group focus:outline-none"
          >
            <span className="w-4 h-4 bg-tertiary-container rounded-full border-[2px] border-on-surface group-hover:bg-tertiary transition-colors"></span>
            End Session
          </button>

          {/* Distraction Block Toggle List */}
          <div className="flex flex-col items-center gap-4 bg-surface p-4 border-[3px] border-on-surface shadow-[4px_4px_0px_#0A0A0A] w-full">
            <button 
              className="w-full font-label-mono-sm text-label-mono-sm font-black text-on-surface uppercase tracking-widest flex items-center justify-center gap-2 focus:outline-none"
              onClick={() => setShowDistractions(!showDistractions)}
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Distraction Block {showDistractions ? 'Expanded' : 'Collapsed'}
              <span className="material-symbols-outlined text-[18px] ml-auto">
                {showDistractions ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            
            {showDistractions && (
              <div className="flex flex-wrap justify-center gap-3 w-full mt-2 pt-4 border-t-[3px] border-on-surface border-dashed">
                {/* Mono Status Tags for blocked apps */}
                <span className="font-label-mono-sm text-label-mono-sm font-bold text-on-surface bg-surface-container-highest border-[2px] border-on-surface px-3 py-1 line-through opacity-80 shadow-[2px_2px_0px_#0A0A0A]">
                  [SLACK]
                </span>
                <span className="font-label-mono-sm text-label-mono-sm font-bold text-on-surface bg-surface-container-highest border-[2px] border-on-surface px-3 py-1 line-through opacity-80 shadow-[2px_2px_0px_#0A0A0A]">
                  [GMAIL]
                </span>
                <span className="font-label-mono-sm text-label-mono-sm font-bold text-on-surface bg-surface-container-highest border-[2px] border-on-surface px-3 py-1 line-through opacity-80 shadow-[2px_2px_0px_#0A0A0A]">
                  [TWITTER]
                </span>
                <span className="font-label-mono-sm text-label-mono-sm font-bold text-on-surface bg-surface-container-highest border-[2px] border-on-surface px-3 py-1 line-through opacity-80 shadow-[2px_2px_0px_#0A0A0A]">
                  [MESSAGES]
                </span>
              </div>
            )}
          </div>
        </div>

      </main>
      </div>
    </div>
  );
};
