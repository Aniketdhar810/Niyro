import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky bg-surface z-50 top-0 border-b-2 border-on-surface flex w-full">
      <div className="flex items-center px-6 py-4 border-r-2 border-on-surface">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBThgg8duXCR4tjOWnKo8XOkdAjjYGOGzlbJDkDmv9OsFWukILTxOGj4FQai-oaTYe2ExYuL1tqukHWm1INHjBVBWk3OmmQZW1YaxAU2_FalIFNfu-kpjYK6WV3_6aqISqg76qAJy3KT8qwcTf1TJ0Ax_aFO1kwXi2HPNDh6rBy6F-yDv5uQUOqhfFup7VINRFSMiP-YSl9oL_KK6ak3ntRX-zX5XKKI4RWKOHfoRKpPJP-LX-uF6PHqUQxuakUGC8Qc9M" alt="Niyro Logo" className="h-8 w-auto object-contain" />
        <span className="font-headline-md font-black uppercase ml-2 tracking-tighter"></span>
      </div>

      <div className="hidden md:flex flex-1 items-center justify-center border-r-2 border-on-surface">
        <ul className="flex items-center gap-12 font-label-mono text-label-mono uppercase font-bold">
          <li><a className="nav-link text-on-surface hover:text-primary transition-colors" href="#"></a></li>
          <li><a className="nav-link text-on-surface hover:text-primary transition-colors" href="#">Built</a></li>
          <li><a className="nav-link text-on-surface hover:text-primary transition-colors" href="#">for</a></li>
          <li><a className="nav-link text-on-surface hover:text-primary transition-colors" href="#">Momentum</a></li>
        </ul>
      </div>

      <div className="hidden md:flex items-stretch bg-on-surface text-surface">
        <button className="px-8 font-label-mono text-label-mono uppercase font-black flex items-center gap-2 hover:text-primary transition-colors" onClick={() => navigate('/auth')}>
          Get started <span className="material-symbols-outlined text-lg">arrow_outward</span>
        </button>
      </div>

      <div className="md:hidden flex flex-1 justify-end p-4">
        <button className="btn-stamped px-2 py-1 border-2 border-on-surface bg-surface">
          <span className="material-symbols-outlined text-on-surface">menu</span>
        </button>
      </div>
    </nav>
  );
};
