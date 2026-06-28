import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-lowest text-on-surface font-label-mono text-label-mono-sm w-full py-6 flex justify-center items-center relative z-10">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-[1400px] justify-between px-margin-desktop">
        <div className="flex items-center gap-2">
          <div className="h-10 flex items-center">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBThgg8duXCR4tjOWnKo8XOkdAjjYGOGzlbJDkDmv9OsFWukILTxOGj4FQai-oaTYe2ExYuL1tqukHWm1INHjBVBWk3OmmQZW1YaxAU2_FalIFNfu-kpjYK6WV3_6aqISqg76qAJy3KT8qwcTf1TJ0Ax_aFO1kwXi2HPNDh6rBy6F-yDv5uQUOqhfFup7VINRFSMiP-YSl9oL_KK6ak3ntRX-zX5XKKI4RWKOHfoRKpPJP-LX-uF6PHqUQxuakUGC8Qc9M" alt="Niyro Logo" className="h-10 w-auto object-contain drop-shadow-sm" />
          </div>
        </div>
        <ul className="flex gap-8 font-bold">
          <li className=""><a className="nav-link" href="#">Terms</a></li>
          <li className=""><a className="nav-link" href="#">Privacy</a></li>
          <li className=""><a className="nav-link" href="#">Status</a></li>
        </ul>
      </div>
    </footer>
  );
};
