import React from 'react';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  isCompact?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8", showSubtitle = true, isCompact = false }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* DentaPlus Rebranded Logo Icon */}
      <div 
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/90 p-1 shadow-lg shadow-purple-900/40 border border-purple-500/40 group hover:scale-105 transition-transform duration-300 shrink-0"
        style={{ width: '40px', height: '40px' }}
      >
        <img
          src="/dentaplus-logo.png"
          alt="DentaPlus Logo"
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            // Fallback to SVG if needed
            (e.target as HTMLImageElement).src = '/dentaplus-logo.svg';
          }}
        />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-300"></span>
        </span>
      </div>

      {!isCompact && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-xl font-extrabold tracking-tight text-white font-['Poppins']">
              Denta<span className="text-purple-400">Plus</span>
            </span>
            <span className="px-1.5 py-0.2 text-[8px] font-bold bg-[#7C3AED]/40 text-purple-200 border border-purple-400/40 rounded-md tracking-wider uppercase ml-0.5">
              EMR
            </span>
          </div>
          {showSubtitle && (
            <span 
              className="text-[9px] font-medium text-purple-300/90 tracking-tight truncate max-w-[170px]"
              style={{ marginTop: '9px', paddingTop: '0px', paddingBottom: '0px' }}
            >
              Dental EMR &amp; Practice Management
            </span>
          )}
        </div>
      )}
    </div>
  );
};
