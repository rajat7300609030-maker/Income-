import React from 'react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  return (
    <div className="h-screen w-full bg-slate-100 dark:bg-black flex justify-center items-center overflow-hidden select-none font-sans text-slate-800 dark:text-white antialiased sm:p-4 transition-colors duration-200">
      {/* Device / App Container */}
      <div className="w-full max-w-md h-full sm:h-[880px] sm:max-h-[96vh] bg-slate-50 dark:bg-black sm:rounded-3xl sm:shadow-2xl sm:shadow-slate-300/60 dark:sm:shadow-black/70 flex flex-col overflow-hidden relative border border-slate-200/80 dark:border-neutral-800 transition-colors duration-200">
        {/* Dynamic App Content Screen Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50 dark:bg-black text-slate-800 dark:text-white">
          {children}
        </div>
      </div>
    </div>
  );
};
