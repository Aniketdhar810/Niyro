const fs = require('fs');

const file = 'c:/Users/KIIT0001/Desktop/Niyro/frontend/src/pages/Landing.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `<>
      <Particles />
      <section className="w-full px-margin-mobile md:px-margin-desktop pt-12 pb-24 border-b-border-width-heavy border-on-surface relative overflow-hidden reveal-up">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 flex flex-col items-start z-10 relative">
            <svg className="absolute -top-8 -left-8 w-16 h-16 text-on-surface hidden md:block" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 100 100">
              <path className="doodle-path" d="M50 10 L50 90 M10 50 L90 50 M20 20 L80 80 M20 80 L80 20" style={{ animationPlayState: 'paused' }}></path>
            </svg>
            <div className="inline-flex items-center gap-2 border-border-width-heavy border-on-surface px-4 py-2 bg-secondary-container rounded-none mb-8 box-shadow-[2px_2px_0px_#1c1b1b] hero-spring" style={{ animationDelay: '0s' }}>
              <span className="text-on-surface font-black">✦</span>
              <span className="font-label-mono text-label-mono uppercase text-on-surface">AI productivity assistant</span>
            </div>
            <h1 className="font-display-xl text-[56px] md:text-display-2xl uppercase text-on-surface mb-8 tracking-tighter leading-[0.85]">
              <span className="stagger-word delay-1">GET</span> <span className="stagger-word delay-1">MORE</span> <span className="stagger-word delay-2">DONE.</span><br />
              <span className="stagger-word delay-3">STRESS</span> <span className="stagger-word delay-3">LESS.</span><br />
              <span className="stagger-word delay-4 text-primary">LIVE</span> <span className="stagger-word delay-4 text-primary">BETTER.</span>
            </h1>
            <p className="font-label-mono text-lg md:text-xl text-on-surface max-w-xl mb-12 uppercase leading-relaxed font-bold hero-spring" style={{ animationDelay: '0.5s' }}>
                Your AI co-pilot that plans your day, manages tasks, and saves you from last-minute chaos.
            </p>
            <div className="flex flex-wrap items-center gap-6 hero-spring" style={{ animationDelay: '0.6s' }}>
              <button className="bg-primary text-on-surface border-border-width-heavy border-on-surface px-8 py-4 font-label-mono text-label-mono uppercase btn-stamped flex items-center gap-2" onClick={() => navigate('/auth')}>
                  Start planning now <span className="material-symbols-outlined">arrow_outward</span>
              </button>
              <button className="bg-surface-container-lowest text-on-surface border-border-width-heavy border-on-surface px-8 py-4 font-label-mono text-label-mono uppercase btn-stamped flex items-center gap-2">
                  See how it works
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 relative mt-16 lg:mt-0 lg:-mr-8 hero-spring" style={{ animationDelay: '0.3s' }}>
            <svg className="absolute -top-16 -left-16 w-32 h-32 text-on-surface hidden lg:block" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 100 100">
              <path className="doodle-path" d="M20 80 Q 40 20, 80 40" style={{ animationPlayState: 'paused' }}></path>
              <path className="doodle-path" d="M70 30 L 85 42 L 70 55" style={{ animationPlayState: 'paused' }}></path>
            </svg>
            <div className="brutal-card p-0 flex flex-col h-full bg-surface-container-lowest">
              <div className="p-4 border-b-border-width-heavy border-on-surface flex justify-between items-center bg-surface-container-lowest">
                <span className="font-label-mono text-label-mono uppercase font-black">Today's Overview</span>
              </div>
              <div className="flex-grow p-4 grid grid-cols-2 gap-4 relative">
                <div className="col-span-1 border-border-width-heavy border-on-surface p-4 bg-secondary-fixed flex flex-col justify-between animate-float-1 brutal-card">
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
                </div>
                <div className="col-span-1 border-border-width-heavy border-on-surface p-4 bg-surface-container-lowest flex flex-col justify-between animate-float-2 brutal-card">
                  <span className="font-label-mono text-label-mono-sm uppercase font-black mb-2">Tasks Left</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-headline-lg leading-none">4</span>
                    <span className="font-label-mono text-label-mono-sm">of 9</span>
                  </div>
                  <div className="mt-4 h-4 border-border-width-heavy border-on-surface flex w-full">
                    <div className="bg-on-surface w-1/2 h-full"></div>
                  </div>
                </div>
                <div className="col-span-1 border-border-width-heavy border-on-surface p-4 bg-surface-container-lowest flex flex-col animate-float-3 brutal-card">
                  <span className="font-label-mono text-label-mono-sm uppercase font-black mb-4">Next Deadline</span>
                  <span className="font-headline-md text-headline-md mb-2 leading-tight">Interview Prep</span>
                  <span className="font-label-mono text-label-mono-sm mb-6">Tomorrow, 10:00 AM</span>
                  <span className="inline-block bg-primary text-on-surface border-border-width-heavy border-on-surface px-2 py-1 font-label-mono text-[10px] uppercase font-black w-max mt-auto">High Priority</span>
                </div>
                <div className="col-span-1 border-border-width-heavy border-on-surface p-4 bg-surface-container-lowest flex flex-col brutal-card">
                  <span className="font-label-mono text-label-mono-sm uppercase font-black mb-4">Schedule</span>
                  <ul className="space-y-3 font-label-mono text-label-mono-sm flex-grow">
                    <li className="flex gap-3"><span className="opacity-60 w-10">09:00</span> <span className="">Study Session</span></li>
                    <li className="flex gap-3"><span className="opacity-60 w-10">11:00</span> <span className="">Project Meeting</span></li>
                    <li className="flex gap-3"><span className="opacity-60 w-10">02:00</span> <span className="">Assignment</span></li>
                    <li className="flex gap-3"><span className="opacity-60 w-10">07:00</span> <span className="">Interview Prep</span></li>
                  </ul>
                  <a className="text-[10px] font-label-mono font-black uppercase underline mt-4 flex items-center gap-1 nav-link w-max" href="#">View Full Calendar <span className="material-symbols-outlined text-[12px]">arrow_forward</span></a>
                </div>
                <div className="absolute right-[-48px] top-0 bottom-0 w-12 bg-primary border-border-width-heavy border-on-surface flex flex-col items-center py-4 gap-6 brutal-card !shadow-none border-l-0 rounded-r-lg z-[-1]">
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
      
      <section className="py-24 px-margin-mobile md:px-margin-desktop border-b-border-width-heavy border-on-surface bg-surface-container-lowest relative reveal-up stagger-group">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-headline-md text-headline-md uppercase text-on-surface max-w-sm leading-tight">Smart features that work for you</h2>
            <a className="font-label-mono text-label-mono uppercase font-black flex items-center gap-2 nav-link" href="#">View all features <span className="material-symbols-outlined">arrow_forward</span></a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-l-border-width-heavy border-t-border-width-heavy border-on-surface">
            <div className="border-r-border-width-heavy border-b-border-width-heavy border-on-surface p-8 bg-surface-container-lowest hover:bg-primary transition-colors group feature-card stagger-item">
              <div className="w-16 h-16 bg-primary group-hover:bg-surface-container-lowest border-border-width-heavy border-on-surface flex items-center justify-center mb-8 box-shadow-[2px_2px_0px_#1c1b1b] transition-all group-hover:shadow-[4px_4px_0px_#1c1b1b] group-hover:-translate-y-1 group-hover:-translate-x-1">
                <span className="material-symbols-outlined text-3xl">smart_toy</span>
              </div>
              <h3 className="font-label-mono text-label-mono uppercase font-black mb-4">AI Plan Generator</h3>
              <p className="font-label-mono text-sm leading-relaxed font-medium">Creates a personalized plan based on your tasks, deadlines &amp; goals.</p>
            </div>
            <div className="border-r-border-width-heavy border-b-border-width-heavy border-on-surface p-8 bg-surface-container-lowest hover:bg-secondary-fixed transition-colors group feature-card stagger-item">
              <div className="w-16 h-16 bg-secondary-fixed group-hover:bg-surface-container-lowest border-border-width-heavy border-on-surface flex items-center justify-center mb-8 box-shadow-[2px_2px_0px_#1c1b1b] transition-all group-hover:shadow-[4px_4px_0px_#1c1b1b] group-hover:-translate-y-1 group-hover:-translate-x-1">
                <span className="material-symbols-outlined text-3xl">calendar_month</span>
              </div>
              <h3 className="font-label-mono text-label-mono uppercase font-black mb-4">Smart Scheduler</h3>
              <p className="font-label-mono text-sm leading-relaxed font-medium">Automatically schedules your day to maximize productivity.</p>
            </div>
            <div className="border-r-border-width-heavy border-b-border-width-heavy border-on-surface p-8 bg-surface-container-lowest hover:bg-primary transition-colors group feature-card stagger-item">
              <div className="w-16 h-16 bg-primary group-hover:bg-surface-container-lowest border-border-width-heavy border-on-surface flex items-center justify-center mb-8 box-shadow-[2px_2px_0px_#1c1b1b] transition-all group-hover:shadow-[4px_4px_0px_#1c1b1b] group-hover:-translate-y-1 group-hover:-translate-x-1">
                <span className="material-symbols-outlined text-3xl">notifications_active</span>
              </div>
              <h3 className="font-label-mono text-label-mono uppercase font-black mb-4">Deadline Protector</h3>
              <p className="font-label-mono text-sm leading-relaxed font-medium">Never miss important deadlines with smart reminders.</p>
            </div>
            <div className="border-r-border-width-heavy border-b-border-width-heavy border-on-surface p-8 bg-surface-container-lowest hover:bg-secondary-fixed transition-colors group feature-card stagger-item">
              <div className="w-16 h-16 bg-secondary-fixed group-hover:bg-surface-container-lowest border-border-width-heavy border-on-surface flex items-center justify-center mb-8 box-shadow-[2px_2px_0px_#1c1b1b] transition-all group-hover:shadow-[4px_4px_0px_#1c1b1b] group-hover:-translate-y-1 group-hover:-translate-x-1">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <h3 className="font-label-mono text-label-mono uppercase font-black mb-4">Focus Mode</h3>
              <p className="font-label-mono text-sm leading-relaxed font-medium">Eliminate distractions and get into deep work flow.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-border-width-heavy border-on-surface grid grid-cols-1 lg:grid-cols-3 reveal-up stagger-group">
        <div className="p-12 lg:border-r-border-width-heavy border-on-surface bg-surface-container-lowest flex flex-col justify-center stagger-item">
          <h2 className="font-headline-md text-headline-md uppercase mb-8 leading-tight">Join 10,000+ students and professionals</h2>
          <div className="flex items-center -space-x-4">
            <img className="w-16 h-16 rounded-full border-border-width-heavy border-on-surface object-cover transition-transform hover:scale-110 hover:z-20 cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTsVq1sSaz2BMEUlVguu7Nf6GGgo7tRltB5U5cy7sOsgkpCqIG9j45CTj26Nq5vhsCPG2UMOgA-VsI1n7nOEOg_21nuZLIpmeGQOZFUwnwT2PUcl8EbAK059KFe5FbSZJ8UAyAp-iEFoP76uTu0qJNHIXNOPs0JMsEFR5iL7QlGIrIXBCRDyQBvtouTEgGSY5fBqASm6e7TFljFgQEJvbqs1rwsREew0qbU95qJ09QwI-7Wn0tPm8Lmg" alt="User 1" />
            <img className="w-16 h-16 rounded-full border-border-width-heavy border-on-surface object-cover transition-transform hover:scale-110 hover:z-20 cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdu595Dt-z9X8gLnWC0MQzAnk3DtXZS6o3ps5bPJFOzHT8frdNKj94FI4wxY9jGlyudPXZDIPiKhK-wTvM8MHV485Y048g70C9-aqUn5WAWE3uvEL7_359JzLIu8T36I1tRgKdA5cgylF8BH16JyasmFf06M86PwYQq82PFQCNKkJFZ-3n38rz6-U0HS6JK1e5OIgTfz-QSZZ5ZK6eNFrhNjs9vGrsl7khff079UFbFqAtRaLM8mlLCA" alt="User 2" />
            <img className="w-16 h-16 rounded-full border-border-width-heavy border-on-surface object-cover transition-transform hover:scale-110 hover:z-20 cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRTuk8caC9AiU4n2tgryUD0Llwi8YxK0IXqShJCe4-6emxPsGuS0i598RVRUZ_uGiYyHqerK-ZXK09-L0enk_cSAdRsUjTk_yQB_j62QwbTkx-LRRTcwuM1BG3kJBNB-8mN4WjNjlVT2cjUUvk3Hc_NVB7R8dRdQqUwd3uXTASI55PDXykNrtOQ1Fx5T6_D1ytya6ELSCj91j47YayZm4f-q7_zkOOc174M6K6OQUzIRNW5DZTKkn1FQ" alt="User 3" />
            <div className="w-16 h-16 rounded-full border-border-width-heavy border-on-surface bg-on-surface text-surface flex items-center justify-center font-label-mono text-label-mono font-black z-10 relative transition-transform hover:scale-110 cursor-pointer">
              10K+
            </div>
          </div>
        </div>
        <div className="p-12 lg:border-r-border-width-heavy border-on-surface bg-primary text-on-surface flex flex-col justify-center relative stagger-item">
          <span className="material-symbols-outlined absolute top-8 left-8 text-6xl opacity-20" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
          <h3 className="font-headline-md text-headline-md uppercase leading-tight mb-8 relative z-10">"This app changed the way I work."</h3>
          <p className="font-label-mono text-label-mono font-black uppercase tracking-widest">- Rishabh, Engineering Student</p>
          <div className="flex gap-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-on-surface cursor-pointer"></div>
            <div className="w-2 h-2 rounded-full border border-on-surface cursor-pointer hover:bg-on-surface transition-colors"></div>
            <div className="w-2 h-2 rounded-full border border-on-surface cursor-pointer hover:bg-on-surface transition-colors"></div>
            <div className="w-2 h-2 rounded-full border border-on-surface cursor-pointer hover:bg-on-surface transition-colors"></div>
          </div>
        </div>
        <div className="p-12 bg-secondary-fixed text-on-surface flex flex-col justify-center items-start stagger-item">
          <h2 className="font-headline-md text-headline-md uppercase mb-8 leading-tight">Ready to take control of your time?</h2>
          <button className="bg-on-surface text-surface border-border-width-heavy border-on-surface px-8 py-4 font-label-mono text-label-mono uppercase btn-stamped flex items-center gap-2 mb-4 w-full justify-center" onClick={() => navigate('/auth')}>
              Get started free <span className="material-symbols-outlined">arrow_outward</span>
          </button>
          <p className="font-label-mono text-sm font-black uppercase flex items-center gap-2"><span className="material-symbols-outlined text-lg">check</span> No credit card required</p>
        </div>
      </section>

      <Marquee text="NEVER LATE AGAIN ✦ AI THAT ACTUALLY ACTS ✦ DEADLINES, HANDLED ✦ NEVER LATE AGAIN ✦ AI THAT ACTUALLY ACTS ✦ DEADLINES, HANDLED ✦ NEVER LATE AGAIN ✦ AI THAT ACTUALLY ACTS ✦ DEADLINES, HANDLED ✦ " className="border-b-0 bg-surface-container-lowest" />
    </>`;

let startIndex = content.indexOf('<>');
let endIndex = content.lastIndexOf('</>') + 3;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(file, content);
console.log("Replaced");
