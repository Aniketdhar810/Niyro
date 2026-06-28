import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const SideNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const NavItem = ({ to, icon, label, isActive }: { to: string; icon: string; label: string; isActive: boolean }) => (
    <Link 
      to={to} 
      title={label}
      className={isActive 
        ? "bg-primary-container text-on-primary-container border-2 border-on-surface shadow-[4px_4px_0px_#0A0A0A] p-2 w-12 h-12 flex items-center justify-center transition-all active:shadow-none active:translate-x-1 active:translate-y-1 hover:shadow-[2px_2px_0px_#0A0A0A] hover:translate-y-[2px] hover:translate-x-[2px]" 
        : "text-on-surface-variant hover:bg-surface-container-high p-2 w-12 h-12 flex items-center justify-center border-2 border-transparent hover:border-on-surface transition-all"
      }
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
    </Link>
  );

  return (
    <>
      {/* Web SideNav */}
      <div className="hidden md:flex flex-col w-20 shrink-0 bg-surface border-r-2 border-on-surface">
        <nav className="flex flex-col items-center py-8 gap-6 w-full sticky top-0 h-[calc(100vh-2rem)] z-50">
          <div className="flex flex-col items-center gap-1 mb-4">
            <Link to="/dashboard" className="w-12 h-12 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4aUKa3Jv27q4Xnkk-KWhdro_j7Az7ijlgPlSTWDJIo4PVnV09c-qeFVFCXpELM31YG0R36BnGSqzLnQ252CKQ-00hpfl6fxMxlOZ68qjUTPEEIayuMcPk6b4Nz1iN6Itsx2bKQSTHzeqHwV3rRVoQhQKov6FGZ19JYTtgrGCY3vgO1vfrnjNCAThha8ZsZ5-TVRkR-oyJlbbP_exS3s8F6FGcPb5t7nFmc4GaH-22MHyH9RAEiXEGhGU3MjcZEheQ5bQ" alt="Niyro Logo" className="w-full h-auto object-contain" />
            </Link>
          </div>
          <div className="flex flex-col gap-6 w-full items-center">
            <NavItem to="/dashboard" icon="home" label="Home" isActive={path === '/dashboard'} />
            <NavItem to="/tasks" icon="checklist" label="Tasks" isActive={path === '/tasks'} />
            <NavItem to="/calendar" icon="calendar_today" label="Calendar" isActive={path === '/calendar'} />
            <NavItem to="/assistant" icon="smart_toy" label="Assistant" isActive={path === '/assistant'} />
            <NavItem to="/focus" icon="timer" label="Focus" isActive={path === '/focus'} />
          </div>
          <div className="mt-auto">
            <NavItem to="/settings" icon="settings" label="Settings" isActive={path === '/settings'} />
          </div>
        </nav>
      </div>

      {/* Mobile BottomNav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface border-t-2 border-on-surface z-50 flex justify-around items-center py-3 px-2 pb-safe">
        <Link to="/dashboard" className={`flex flex-col items-center gap-1 p-2 ${path === '/dashboard' ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/dashboard' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
          <span className="font-label-mono text-[10px]">Home</span>
        </Link>
        <Link to="/tasks" className={`flex flex-col items-center gap-1 p-2 ${path === '/tasks' ? 'bg-primary-container text-on-primary-container border-[1px] border-on-surface shadow-[2px_2px_0px_#0A0A0A]' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/tasks' ? "'FILL' 1" : "'FILL' 0" }}>checklist</span>
          <span className="font-label-mono text-[10px] font-bold">Tasks</span>
        </Link>
        <Link to="/calendar" className={`flex flex-col items-center gap-1 p-2 ${path === '/calendar' ? 'bg-primary-container text-on-primary-container border-[1px] border-on-surface shadow-[2px_2px_0px_#0A0A0A]' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/calendar' ? "'FILL' 1" : "'FILL' 0" }}>calendar_today</span>
          <span className="font-label-mono text-[10px] font-bold">Calendar</span>
        </Link>
        <Link to="/assistant" className={`flex flex-col items-center gap-1 p-2 ${path === '/assistant' ? 'bg-primary-container text-on-primary-container border-[1px] border-on-surface shadow-[2px_2px_0px_#0A0A0A]' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/assistant' ? "'FILL' 1" : "'FILL' 0" }}>smart_toy</span>
          <span className="font-label-mono text-[10px] font-bold">Assistant</span>
        </Link>
        <Link to="/focus" className={`flex flex-col items-center gap-1 p-2 ${path === '/focus' ? 'bg-primary-container text-on-primary-container border-[1px] border-on-surface shadow-[2px_2px_0px_#0A0A0A]' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/focus' ? "'FILL' 1" : "'FILL' 0" }}>timer</span>
          <span className="font-label-mono text-[10px] font-bold">Focus</span>
        </Link>
        <Link to="/settings" className={`flex flex-col items-center gap-1 p-2 ${path === '/settings' ? 'bg-primary-container text-on-primary-container border-[1px] border-on-surface shadow-[2px_2px_0px_#0A0A0A]' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/settings' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
          <span className="font-label-mono text-[10px] font-bold">Settings</span>
        </Link>
      </nav>
    </>
  );
};
