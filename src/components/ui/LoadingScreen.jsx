// src/components/ui/LoadingScreen.jsx
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0a0c12] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L28 12V20L16 28L4 20V12L16 4Z" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
              <path d="M16 10L22 14V18L16 22L10 18V14L16 10Z" fill="#22c55e" fillOpacity="0.2"/>
            </svg>
          </div>
          <div className="absolute -inset-2 rounded-full border border-green-500/20 animate-ping" />
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
