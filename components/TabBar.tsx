import React from 'react';
import { AppView } from '../types';

interface TabBarProps {
  currentView: AppView;
  onChange: (view: AppView) => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentView, onChange }) => {
  const tabs = [
    { id: AppView.DASHBOARD, label: '状态', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
    { id: AppView.CONTACTS, label: '联系人', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
    { id: AppView.SETTINGS, label: '设置', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )},
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-white/5 pb-safe pt-2 px-6 flex justify-around items-center z-50 h-[88px]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex flex-col items-center justify-center space-y-1.5 w-16 transition-all duration-300 ${
            currentView === tab.id ? 'text-primary' : 'text-text_muted hover:text-text_main'
          }`}
        >
          {/* Active Indicator Dot */}
          {currentView === tab.id && (
             <span className="absolute -top-3 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_currentColor]"></span>
          )}
          
          <div className="transform transition-transform duration-200 active:scale-90">
             {tab.icon}
          </div>
          <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabBar;