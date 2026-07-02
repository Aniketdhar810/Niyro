import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { useDashboardData } from '../hooks/useDashboardData';
import { api } from '../lib/apiClient';

function createAmbientNoise() {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioContext();
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (last + 0.02 * white) / 1.02; // brown noise
    last = data[i];
    data[i] *= 3.5;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  source.connect(gain).connect(ctx.destination);
  return {
    start: () => source.start(0),
    stop: () => { source.stop(); ctx.close(); },
  };
}

export const Focus: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const { tasks, loading: tasksLoading } = useDashboardData();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(taskId);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const audioEngineRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
      }
    };
  }, []);

  // Derive active task
  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;
  const activeStep = activeTask?.steps?.find(s => !s.done);
  
  // Timer state
  const [totalTime, setTotalTime] = useState(45 * 60);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showDistractions, setShowDistractions] = useState(false);

  // Initialize total time once a task is selected
  useEffect(() => {
    if (activeTask) {
      let durationMins = 45;
      if (activeStep && (activeStep as any).isMicrotask) {
        durationMins = 15;
      } else if (activeTask.estimatedMinutes) {
        durationMins = Math.min(activeTask.estimatedMinutes, 90);
      }
      setTotalTime(durationMins * 60);
      setTimeLeft(durationMins * 60);
      setIsActive(false);
    }
  }, [activeTaskId, activeTask, activeStep]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleAudio = () => {
    if (audioEnabled) {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
        audioEngineRef.current = null;
      }
      setAudioEnabled(false);
    } else {
      const engine = createAmbientNoise();
      engine.start();
      audioEngineRef.current = engine;
      setAudioEnabled(true);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeTaskId) return;
    setProcessing(true);
    try {
      const elapsedSeconds = totalTime - timeLeft;
      const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
      await api.completeTask(activeTaskId, actualMinutes);
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert('Failed to complete task.');
      setProcessing(false);
    }
  };

  const handleJustStop = () => {
    navigate('/dashboard');
  };

  if (tasksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="w-16 h-16 border-[3px] border-on-surface border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Task Picker View if no active task
  if (!activeTaskId || !activeTask) {
    const pendingTasks = tasks.filter(t => t.status !== 'done');
    const sortedTasks = [...pendingTasks].sort((a, b) => {
      const riskWeight = (r: string) => r === 'critical' ? 3 : r === 'at_risk' ? 2 : 1;
      return riskWeight(b.riskLevel || '') - riskWeight(a.riskLevel || '');
    });

    return (
      <div className="min-h-screen bg-[#f0f4f8] p-2 md:p-4 flex justify-center">
        <div className="bg-surface text-on-surface font-body-md flex w-full max-w-[1600px] border-2 border-on-surface shadow-[8px_8px_0px_#1c1b1b] min-h-[calc(100vh-1rem)] relative overflow-hidden">
          <SideNav />
          <main className="flex-1 flex flex-col items-center pt-20 px-4 md:px-12 pb-16 overflow-y-auto">
            <h1 className="font-headline-lg text-headline-lg font-black uppercase mb-8 border-[3px] border-on-surface px-6 py-2 shadow-[4px_4px_0px_#0A0A0A]">Select Task for Focus</h1>
            <div className="w-full max-w-2xl flex flex-col gap-4">
              {sortedTasks.length === 0 ? (
                <div className="text-center font-label-mono text-on-surface-variant uppercase p-12 border-2 border-dashed border-on-surface">No pending tasks available</div>
              ) : (
                sortedTasks.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setActiveTaskId(t.id)}
                    className="flex flex-col md:flex-row md:items-center justify-between text-left w-full bg-surface-container-lowest p-4 border-[3px] border-on-surface shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#0A0A0A] transition-all group"
                  >
                    <div className="flex flex-col">
                      <span className="font-headline-md font-bold truncate group-hover:text-primary transition-colors">{t.title}</span>
                      {t.estimatedMinutes && (
                        <span className="font-label-mono-sm text-on-surface-variant mt-1">Est: {t.estimatedMinutes}m</span>
                      )}
                    </div>
                    <span className={`mt-2 md:mt-0 font-label-mono-sm uppercase font-bold px-3 py-1 border-[2px] border-on-surface shrink-0 ${
                      t.riskLevel === 'critical' ? 'bg-tertiary text-on-tertiary' :
                      t.riskLevel === 'at_risk' ? 'bg-secondary text-on-secondary' : 'bg-surface'
                    }`}>
                      {(t.riskLevel || 'on_track').replace('_', ' ')}
                    </span>
                  </button>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 289;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const instructionText = (activeStep as any)?.ifThenTrigger || activeStep?.title || activeTask.title;

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-2 md:p-4 flex justify-center">
      <div className="bg-surface text-on-surface font-body-md flex w-full max-w-[1600px] border-2 border-on-surface shadow-[8px_8px_0px_#1c1b1b] min-h-[calc(100vh-1rem)] relative pb-16 md:pb-0 overflow-hidden">
      <SideNav />

      {/* Audio generated via Web Audio API */}

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
          <button onClick={toggleAudio} className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none">
            <span className="material-symbols-outlined text-[18px]">{audioEnabled ? 'volume_up' : 'volume_off'}</span>
            <span className="hidden md:inline font-bold">{audioEnabled ? 'Ambient On' : 'Ambient Off'}</span>
          </button>
        </div>

        {/* Task Anchor */}
        <div className="text-center mb-6 max-w-3xl px-6 relative mt-16 md:mt-8 z-30 shrink-0">
          <h2 className="font-label-mono text-primary font-bold uppercase mb-2">Current Instruction</h2>
          <h1 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg font-black uppercase text-on-surface tracking-tighter leading-tight relative inline-block z-10 bg-surface px-6 py-4 border-[3px] border-on-surface shadow-[6px_6px_0px_#0A0A0A]">
            {instructionText}
          </h1>
        </div>

        {/* The Timer Core */}
        <div className="relative w-[300px] h-[300px] md:w-[480px] md:h-[480px] flex items-center justify-center mb-8 group shrink-0">
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
            <span className="font-display-xl text-[70px] md:text-[140px] font-black tracking-tighter text-on-surface leading-none tabular-nums bg-surface p-2 cursor-pointer hover:bg-surface-variant transition-colors" onClick={() => setIsActive(!isActive)}>
              {formatTime(timeLeft)}
            </span>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setIsActive(!isActive)} className={`font-label-mono text-label-mono text-on-surface uppercase tracking-[0.2em] font-bold px-4 border-[3px] border-on-surface rounded-full py-1 shadow-[2px_2px_0px_#0A0A0A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all ${isActive ? 'bg-error text-on-error border-error shadow-[2px_2px_0px_#0A0A0A]' : 'bg-primary text-on-primary border-on-surface'}`}>
                {isActive ? 'Pause' : 'Start'}
              </button>
            </div>
          </div>
        </div>

        {/* Timer Presets (only show when not active) */}
        {!isActive && (
          <div className="flex gap-2 mb-8 z-20">
            {[15, 25, 45].map(preset => (
              <button 
                key={preset}
                onClick={() => { setTotalTime(preset * 60); setTimeLeft(preset * 60); }}
                className={`font-label-mono-sm font-bold border-[2px] border-on-surface px-3 py-1 shadow-[2px_2px_0px_#0A0A0A] hover:bg-surface-variant transition-colors ${totalTime === preset * 60 ? 'bg-primary text-on-primary' : 'bg-surface'}`}
              >
                {preset}m
              </button>
            ))}
            <button 
                onClick={() => {
                  const custom = prompt('Enter custom minutes:');
                  const parsed = custom ? parseInt(custom, 10) : null;
                  if (parsed && parsed > 0) {
                    setTotalTime(parsed * 60);
                    setTimeLeft(parsed * 60);
                  }
                }}
                className="bg-surface font-label-mono-sm font-bold border-[2px] border-on-surface px-3 py-1 shadow-[2px_2px_0px_#0A0A0A] hover:bg-surface-variant transition-colors"
              >
                Custom
              </button>
          </div>
        )}

        {/* Controls & Status */}
        <div className="flex flex-col items-center gap-6 w-full max-w-md px-4 relative z-20">
          {/* End Session Button */}
          <button 
            onClick={() => setShowCompletionModal(true)}
            className="rounded-full bg-surface text-on-surface font-label-mono text-label-mono font-bold uppercase tracking-widest px-10 py-4 border-[3px] border-on-surface shadow-[4px_4px_0px_#0A0A0A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#0A0A0A] transition-all flex items-center gap-3 group focus:outline-none"
          >
            <span className="w-4 h-4 bg-error rounded-full border-[2px] border-on-surface group-hover:bg-error-container transition-colors"></span>
            End Session
          </button>

          {/* Distraction Block Toggle List */}
          <div className="flex flex-col items-center gap-4 bg-surface p-4 border-[3px] border-on-surface shadow-[4px_4px_0px_#0A0A0A] w-full">
            <button 
              className="w-full font-label-mono-sm text-label-mono-sm font-black text-on-surface uppercase tracking-widest flex items-center justify-center gap-2 focus:outline-none hover:text-primary transition-colors"
              onClick={() => setShowDistractions(!showDistractions)}
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Checklist
              <span className="material-symbols-outlined text-[18px] ml-auto">
                {showDistractions ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            
            {showDistractions && (
              <div className="flex flex-col gap-2 w-full mt-2 pt-4 border-t-[3px] border-on-surface border-dashed">
                {/* Self reported distractions */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 border-[2px] border-on-surface appearance-none checked:bg-primary relative 
                    checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[6px] checked:after:h-[10px] checked:after:border-solid checked:after:border-on-primary checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45" />
                  <span className="font-label-mono-sm font-bold group-hover:text-primary transition-colors">Phone in another room</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 border-[2px] border-on-surface appearance-none checked:bg-primary relative 
                    checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[6px] checked:after:h-[10px] checked:after:border-solid checked:after:border-on-primary checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45" />
                  <span className="font-label-mono-sm font-bold group-hover:text-primary transition-colors">Notifications off</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 border-[2px] border-on-surface appearance-none checked:bg-primary relative 
                    checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[6px] checked:after:h-[10px] checked:after:border-solid checked:after:border-on-primary checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45" />
                  <span className="font-label-mono-sm font-bold group-hover:text-primary transition-colors">Water bottle ready</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
            <div className="bg-surface border-[3px] border-on-surface p-6 shadow-[8px_8px_0px_#0A0A0A] w-full max-w-md">
              <h2 className="font-headline-md font-black uppercase mb-4 text-center">Session Ended</h2>
              <p className="font-body-md mb-8 text-center">Did you complete the task, or are you just stopping for now?</p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleMarkComplete}
                  disabled={processing}
                  className="bg-primary text-on-primary border-[3px] border-on-surface px-6 py-4 font-label-mono font-bold uppercase shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all w-full flex items-center justify-center gap-2"
                >
                  {processing ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">check_circle</span>}
                  Mark Complete
                </button>
                <button 
                  onClick={handleJustStop}
                  disabled={processing}
                  className="bg-surface text-on-surface border-[3px] border-on-surface px-6 py-4 font-label-mono font-bold uppercase shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all w-full flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">stop_circle</span>
                  Just Stop
                </button>
                <button 
                  onClick={() => setShowCompletionModal(false)}
                  disabled={processing}
                  className="mt-2 text-on-surface-variant hover:text-on-surface font-label-mono-sm uppercase font-bold text-center underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      </div>
    </div>
  );
};
