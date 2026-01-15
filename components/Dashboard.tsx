import React, { useState, useEffect } from 'react';
import { AppState, StatusLevel } from '../types';
import { THRESHOLD_MS, WARNING_MS } from '../constants';

interface DashboardProps {
  appState: AppState;
  onCheckIn: () => void;
  onTriggerEmergency: () => void;
  onSkipTime: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appState, onCheckIn, onTriggerEmergency, onSkipTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [percentage, setPercentage] = useState(100);
  const [status, setStatus] = useState<StatusLevel>(StatusLevel.SAFE);

  useEffect(() => {
    const updateStatus = () => {
      const now = Date.now();
      const elapsed = now - appState.lastCheckIn;
      const remaining = THRESHOLD_MS - elapsed;
      
      // Calculate percentage for the ring
      const pct = Math.max(0, Math.min(100, (remaining / THRESHOLD_MS) * 100));
      setPercentage(pct);

      if (remaining <= 0) {
        setStatus(StatusLevel.DANGER);
        setTimeLeft('00:00:00');
      } else if (elapsed > WARNING_MS) {
        setStatus(StatusLevel.WARNING);
      } else {
        setStatus(StatusLevel.SAFE);
      }

      if (remaining > 0) {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        const fmt = (n: number) => n.toString().padStart(2, '0');
        setTimeLeft(`${fmt(hours)}:${fmt(minutes)}:${fmt(seconds)}`);
      }
    };

    const interval = setInterval(updateStatus, 1000);
    updateStatus();

    return () => clearInterval(interval);
  }, [appState.lastCheckIn]);

  // Color logic
  const getThemeColor = () => {
    switch (status) {
      case StatusLevel.SAFE: return '#10b981'; // Emerald
      case StatusLevel.WARNING: return '#f59e0b'; // Amber
      case StatusLevel.DANGER: return '#ef4444'; // Red
    }
  };

  const getStatusText = () => {
    switch (status) {
      case StatusLevel.SAFE: return '状态良好';
      case StatusLevel.WARNING: return '需要签到';
      case StatusLevel.DANGER: return '紧急警报';
    }
  };

  // SVG Ring calculations
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-b from-surface_light to-transparent rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      {/* Header */}
      <header className="pt-14 pb-6 px-6 z-10 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-white">Are U Dead?</h1>
           <p className="text-text_muted text-xs">安全监控系统</p>
        </div>
        <button 
           onClick={onSkipTime}
           className="px-3 py-1 rounded-full bg-surface border border-white/10 text-[10px] text-text_muted hover:text-white transition-colors"
        >
           测试:跳过时间
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10 relative z-10">
        
        {/* Ring Timer */}
        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
          {/* Background Ring */}
          <svg className="absolute w-full h-full transform -rotate-90 drop-shadow-2xl">
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-surface_light"
            />
            {/* Progress Ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={getThemeColor()}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${status === StatusLevel.DANGER ? 'animate-pulse' : ''}`}
            />
          </svg>
          
          {/* Center Text */}
          <div className="flex flex-col items-center text-center">
             <span className="text-5xl font-mono font-medium tracking-tighter text-white tabular-nums drop-shadow-lg">
               {timeLeft}
             </span>
             <div className="mt-2 flex items-center space-x-2 px-3 py-1 rounded-full bg-surface border border-white/5 backdrop-blur-md">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${status === StatusLevel.DANGER ? 'animate-ping bg-primary' : ''}`} style={{ backgroundColor: getThemeColor() }}></div>
                <span className="text-xs font-medium text-text_muted uppercase tracking-wide">{getStatusText()}</span>
             </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-[300px] mt-12 space-y-6">
          {status === StatusLevel.DANGER ? (
             <div className="space-y-4 animate-breath">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 text-center">
                   <p className="text-primary font-semibold text-sm">警报已触发</p>
                   <p className="text-text_muted text-xs mt-1">正在准备发送位置信息...</p>
                </div>
                <button
                  onClick={onTriggerEmergency}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-500 transition-all active:scale-95"
                >
                  立即发送 SOS
                </button>
             </div>
          ) : (
            <button
              onClick={onCheckIn}
              className="w-full group relative py-5 rounded-2xl bg-surface_light hover:bg-surface border border-white/10 overflow-hidden transition-all duration-300 active:scale-95 shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative z-10 text-white font-semibold text-lg tracking-wide flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-safe" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>每日签到</span>
              </span>
            </button>
          )}

          <p className="text-center text-[10px] text-text_muted/50 font-mono">
            上次签到: {new Date(appState.lastCheckIn).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;