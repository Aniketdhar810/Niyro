import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Marquee } from '../components/Marquee';
import { Particles } from '../components/Particles';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Start doodle animations if present
          const doodles = entry.target.querySelectorAll('.doodle-path');
          doodles.forEach(doodle => {
            (doodle as HTMLElement).style.animationPlayState = 'running';
          });
          
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.reveal-up, .stagger-group');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-2 md:p-4 flex justify-center">
      <div className="border-2 border-on-surface bg-surface flex flex-col w-full max-w-[1600px] min-h-[calc(100vh-2rem)] shadow-[8px_8px_0px_#1c1b1b] overflow-hidden relative">
        <Navbar />
        <section className="w-full px-margin-mobile md:px-margin-desktop pt-12 pb-24 border-b-2 border-on-surface relative reveal-up bg-grid">
        <Particles />
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 flex flex-col items-start z-10 relative">
            <svg className="absolute -top-8 -left-8 w-16 h-16 text-on-surface hidden md:block" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 100 100">
              <path className="doodle-path" d="M50 10 L50 90 M10 50 L90 50 M20 20 L80 80 M20 80 L80 20"></path>
            </svg>
            <div className="inline-flex items-center gap-2 border-2 border-on-surface px-4 py-2 bg-secondary-container rounded-none mb-8 box-shadow-[2px_2px_0px_#1c1b1b] hero-spring" style={{ animationDelay: '0s' }}>
              <span className="text-on-surface font-black">✦</span>
              <span className="font-label-mono text-label-mono uppercase text-on-surface">AI productivity assistant</span>
            </div>
            <motion.h1 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
              className="font-display-xl text-[64px] md:text-[96px] lg:text-[110px] font-black uppercase text-on-surface mb-8 tracking-tighter leading-[0.85]"
            >
              <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring" }} className="inline-block">GET MORE</motion.span><br />
              <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring" }} className="inline-block">DONE.</motion.span><br />
              <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring" }} className="inline-block">STRESS</motion.span><br />
              <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: "spring" }} className="inline-block">LESS.</motion.span><br />
              <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, type: "spring" }} className="inline-block text-primary">LIVE BETTER.</motion.span>
            </motion.h1>
            <p className="font-label-mono text-lg md:text-xl text-on-surface max-w-xl mb-12 uppercase leading-relaxed font-bold hero-spring" style={{ animationDelay: '0.5s' }}>
                Your AI co-pilot that plans your day, manages tasks, and saves you from last-minute chaos.
            </p>
            <div className="flex flex-wrap items-center gap-6 hero-spring" style={{ animationDelay: '0.6s' }}>
              <button className="bg-primary text-on-surface border-2 border-on-surface px-8 py-4 font-label-mono text-label-mono uppercase btn-stamped flex items-center gap-2" onClick={() => navigate('/auth')}>
                  Start planning now <span className="material-symbols-outlined">arrow_outward</span>
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 relative mt-16 lg:mt-0 lg:-mr-8 hero-spring" style={{ animationDelay: '0.3s' }}>
            <svg className="absolute -top-16 -left-16 w-32 h-32 text-on-surface hidden lg:block" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 100 100">
              <path className="doodle-path" d="M20 80 Q 40 20, 80 40"></path>
              <path className="doodle-path" d="M70 30 L 85 42 L 70 55"></path>
            </svg>
            <div className="brutal-card p-0 flex flex-col h-full bg-surface-container-lowest">
              <div className="p-4 border-b-2 border-on-surface flex justify-between items-center bg-surface-container-lowest">
                <span className="font-label-mono text-label-mono uppercase font-black">Today's Overview</span>
              </div>
              <div className="flex-grow p-4 grid grid-cols-2 gap-4 relative">
                <motion.div 
                  initial={{ opacity: 0, rotate: -10, scale: 0.8 }} 
                  animate={{ opacity: 1, rotate: 0, scale: 1 }} 
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="col-span-1 border-2 border-on-surface p-4 bg-secondary-fixed flex flex-col justify-between animate-float-1 brutal-card"
                >
                  <span className="font-label-mono text-label-mono-sm uppercase font-black mb-2">Focus Score</span>
                  <div className="flex items-end gap-1">
                    <span className="font-headline-lg text-headline-lg leading-none">86%</span>
                    <span className="material-symbols-outlined text-on-surface">arrow_outward</span>
                  </div>
                  <div className="mt-4 h-8 border-b-2 border-dashed border-on-surface relative">
                    <div className="absolute bottom-[-4px] left-0 w-2 h-2 rounded-full bg-on-surface"></div>
                    <div className="absolute bottom-[4px] left-1/4 w-2 h-2 rounded-full bg-on-surface"></div>
                    <div className="absolute bottom-[2px] left-2/4 w-2 h-2 rounded-full bg-on-surface"></div>
                    <div className="absolute bottom-[12px] right-1/4 w-2 h-2 rounded-full bg-on-surface"></div>
                    <div className="absolute bottom-[8px] right-0 w-2 h-2 rounded-full bg-on-surface"></div>
                  </div>
                </motion.div>
                <div className="col-span-1 border-2 border-on-surface p-4 bg-surface-container-lowest flex flex-col justify-between animate-float-2 brutal-card">
                  <span className="font-label-mono text-label-mono-sm uppercase font-black mb-2">Tasks Left</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-headline-lg leading-none">4</span>
                    <span className="font-label-mono text-label-mono-sm">of 9</span>
                  </div>
                  <div className="mt-4 h-4 border-2 border-on-surface flex w-full">
                    <div className="bg-on-surface w-1/2 h-full"></div>
                  </div>
                </div>
                <div className="col-span-1 border-2 border-on-surface p-4 bg-surface-container-lowest flex flex-col animate-float-3 brutal-card">
                  <span className="font-label-mono text-label-mono-sm uppercase font-black mb-4">Next Deadline</span>
                  <span className="font-headline-md text-headline-md mb-2 leading-tight">Interview Prep</span>
                  <span className="font-label-mono text-label-mono-sm mb-6">Tomorrow, 10:00 AM</span>
                  <span className="inline-block bg-primary text-on-surface border-2 border-on-surface px-2 py-1 font-label-mono text-[10px] uppercase font-black w-max mt-auto">High Priority</span>
                </div>
                <div className="col-span-1 border-2 border-on-surface p-4 bg-surface-container-lowest flex flex-col brutal-card">
                  <span className="font-label-mono text-label-mono-sm uppercase font-black mb-4">Schedule</span>
                  <ul className="space-y-3 font-label-mono text-label-mono-sm flex-grow">
                    <li className="flex gap-3"><span className="opacity-60 w-10">09:00</span> <span className="">Study Session</span></li>
                    <li className="flex gap-3"><span className="opacity-60 w-10">11:00</span> <span className="">Project Meeting</span></li>
                    <li className="flex gap-3"><span className="opacity-60 w-10">02:00</span> <span className="">Assignment</span></li>
                    <li className="flex gap-3"><span className="opacity-60 w-10">07:00</span> <span className="">Interview Prep</span></li>
                  </ul>
                  <a className="text-[10px] font-label-mono font-black uppercase underline mt-4 flex items-center gap-1 nav-link w-max" href="#">View Full Calendar <span className="material-symbols-outlined text-[12px]">arrow_forward</span></a>
                </div>
                <div className="absolute right-[-48px] top-0 bottom-0 w-12 bg-primary border-2 border-on-surface flex flex-col items-center py-4 gap-6 brutal-card !shadow-none border-l-0 rounded-r-lg z-[-1]">
                  <div className="w-8 h-8 border-2 border-on-surface bg-surface-container-lowest flex items-center justify-center btn-stamped cursor-pointer"><span className="material-symbols-outlined text-sm">home</span></div>
                  <span className="material-symbols-outlined text-on-surface cursor-pointer hover:scale-110 transition-transform">check_box</span>
                  <span className="material-symbols-outlined text-on-surface cursor-pointer hover:scale-110 transition-transform">calendar_month</span>
                  <span className="material-symbols-outlined text-on-surface cursor-pointer hover:scale-110 transition-transform">bar_chart</span>
                  <span className="material-symbols-outlined text-on-surface mt-auto cursor-pointer hover:rotate-90 transition-transform">settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-24 px-margin-mobile md:px-margin-desktop border-b-2 border-on-surface bg-surface-container-lowest relative reveal-up stagger-group">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-headline-md text-headline-md uppercase text-on-surface max-w-sm leading-tight">Smart features that work for you</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-l-2 border-t-2 border-on-surface">
            <div className="border-r-2 border-b-2 border-on-surface p-8 bg-surface-container-lowest hover:bg-primary transition-colors group feature-card stagger-item">
              <div className="w-16 h-16 bg-primary group-hover:bg-surface-container-lowest border-2 border-on-surface flex items-center justify-center mb-8 box-shadow-[2px_2px_0px_#1c1b1b] transition-all group-hover:shadow-[4px_4px_0px_#1c1b1b] group-hover:-translate-y-1 group-hover:-translate-x-1">
                <span className="material-symbols-outlined text-3xl">smart_toy</span>
              </div>
              <h3 className="font-label-mono text-label-mono uppercase font-black mb-4">AI Plan Generator</h3>
              <p className="font-label-mono text-sm leading-relaxed font-medium">Creates a personalized plan based on your tasks, deadlines &amp; goals.</p>
            </div>
            <div className="border-r-2 border-b-2 border-on-surface p-8 bg-surface-container-lowest hover:bg-secondary-fixed transition-colors group feature-card stagger-item">
              <div className="w-16 h-16 bg-secondary-fixed group-hover:bg-surface-container-lowest border-2 border-on-surface flex items-center justify-center mb-8 box-shadow-[2px_2px_0px_#1c1b1b] transition-all group-hover:shadow-[4px_4px_0px_#1c1b1b] group-hover:-translate-y-1 group-hover:-translate-x-1">
                <span className="material-symbols-outlined text-3xl">calendar_month</span>
              </div>
              <h3 className="font-label-mono text-label-mono uppercase font-black mb-4">Smart Scheduler</h3>
              <p className="font-label-mono text-sm leading-relaxed font-medium">Automatically schedules your day to maximize productivity.</p>
            </div>
            <div className="border-r-2 border-b-2 border-on-surface p-8 bg-surface-container-lowest hover:bg-primary transition-colors group feature-card stagger-item">
              <div className="w-16 h-16 bg-primary group-hover:bg-surface-container-lowest border-2 border-on-surface flex items-center justify-center mb-8 box-shadow-[2px_2px_0px_#1c1b1b] transition-all group-hover:shadow-[4px_4px_0px_#1c1b1b] group-hover:-translate-y-1 group-hover:-translate-x-1">
                <span className="material-symbols-outlined text-3xl">notifications_active</span>
              </div>
              <h3 className="font-label-mono text-label-mono uppercase font-black mb-4">Deadline Protector</h3>
              <p className="font-label-mono text-sm leading-relaxed font-medium">Never miss important deadlines with smart reminders.</p>
            </div>
            <div className="border-r-2 border-b-2 border-on-surface p-8 bg-surface-container-lowest hover:bg-secondary-fixed transition-colors group feature-card stagger-item">
              <div className="w-16 h-16 bg-secondary-fixed group-hover:bg-surface-container-lowest border-2 border-on-surface flex items-center justify-center mb-8 box-shadow-[2px_2px_0px_#1c1b1b] transition-all group-hover:shadow-[4px_4px_0px_#1c1b1b] group-hover:-translate-y-1 group-hover:-translate-x-1">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <h3 className="font-label-mono text-label-mono uppercase font-black mb-4">Focus Mode</h3>
              <p className="font-label-mono text-sm leading-relaxed font-medium">Eliminate distractions and get into deep work flow.</p>
            </div>
          </div>
        </div>
      </section>

      <motion.section 
        initial={{ opacity: 0, y: 50 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="border-b-2 border-on-surface bg-primary text-on-surface py-32 flex flex-col justify-center items-center text-center bg-grid-white relative overflow-hidden"
      >
        <h2 className="font-headline-lg text-[40px] md:text-[64px] font-black uppercase mb-8 leading-tight">Ready to take control?</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-on-surface text-surface border-2 border-on-surface px-12 py-6 font-label-mono text-label-mono text-xl uppercase btn-stamped flex items-center gap-3 mb-6" 
          onClick={() => navigate('/auth')}
        >
            Start for free <span className="material-symbols-outlined text-2xl">rocket_launch</span>
        </motion.button>
        <p className="font-label-mono text-base font-black uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">check_circle</span> No credit card required
        </p>
      </motion.section>

      <Marquee text="NEVER LATE AGAIN ✦ AI THAT ACTUALLY ACTS ✦ DEADLINES, HANDLED ✦ NEVER LATE AGAIN ✦ AI THAT ACTUALLY ACTS ✦ DEADLINES, HANDLED ✦ NEVER LATE AGAIN ✦ AI THAT ACTUALLY ACTS ✦ DEADLINES, HANDLED ✦ " className="border-b-0 bg-surface-container-lowest" />
      <Footer />
      </div>
    </div>
  );
};
