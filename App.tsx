import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import TabBar from './components/TabBar';
import { loadState, saveState } from './services/storageService';
import { AppState, AppView, EmergencyContact } from './types';
import { THRESHOLD_MS } from './constants';

const App: React.FC = () => {
  // Initialize state from local storage or defaults
  const [appState, setAppState] = useState<AppState>(loadState);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [loadingLoc, setLoadingLoc] = useState(false);

  // Persist state whenever it changes
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  const handleCheckIn = () => {
    setAppState(prev => ({
      ...prev,
      lastCheckIn: Date.now()
    }));
  };

  // Logic to simulate time passing (skip 72 hours + 1 minute)
  const handleSkipTime = () => {
    const simulateTime = Date.now() - THRESHOLD_MS - 60000; 
    setAppState(prev => ({
      ...prev,
      lastCheckIn: simulateTime
    }));
  };

  const handleUpdateContact = (contact: EmergencyContact) => {
    setAppState(prev => ({
      ...prev,
      contact
    }));
  };

  const handleUpdateMessage = (message: string) => {
    setAppState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        customMessage: message
      }
    }));
  };

  const triggerEmergency = useCallback(() => {
    if (!appState.contact.email) {
      alert("请先配置紧急联系人邮箱。");
      setCurrentView(AppView.CONTACTS);
      return;
    }

    setLoadingLoc(true);

    if (!navigator.geolocation) {
      alert("您的浏览器不支持地理定位。");
      setLoadingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoadingLoc(false);
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        const subject = encodeURIComponent(`紧急: 来自 ${appState.contact.name ? 'Are U Dead App' : '我'} 的求救信号`);
        const body = encodeURIComponent(
          `${appState.settings.customMessage}\n\n` +
          `最后已知位置:\n${mapsLink}\n\n` +
          `(精度: ${position.coords.accuracy} 米)\n\n` +
          `触发时间: ${new Date().toLocaleString()}`
        );

        // Open default mail client
        window.location.href = `mailto:${appState.contact.email}?subject=${subject}&body=${body}`;
      },
      (error) => {
        setLoadingLoc(false);
        console.error("Error getting location", error);
        alert("无法获取位置。将发送不带坐标的邮件。");
        
        const subject = encodeURIComponent(`紧急: 求救信号`);
        const body = encodeURIComponent(
          `${appState.settings.customMessage}\n\n` +
          `位置无法确定。\n\n` +
          `触发时间: ${new Date().toLocaleString()}`
        );
        window.location.href = `mailto:${appState.contact.email}?subject=${subject}&body=${body}`;
      }
    );
  }, [appState]);

  return (
    <div className="bg-background min-h-screen text-white relative font-sans selection:bg-primary selection:text-white">
      {/* Loading Overlay */}
      {loadingLoc && (
        <div className="fixed inset-0 bg-background/90 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
           <p className="font-medium text-sm tracking-wide text-white">正在获取卫星定位...</p>
        </div>
      )}

      {/* Main Content Area */}
      <main className="h-screen pb-[88px]">
        {currentView === AppView.DASHBOARD && (
          <Dashboard 
            appState={appState} 
            onCheckIn={handleCheckIn} 
            onTriggerEmergency={triggerEmergency}
            onSkipTime={handleSkipTime}
          />
        )}
        
        {currentView === AppView.CONTACTS && (
          <Contacts 
            appState={appState} 
            onUpdateContact={handleUpdateContact}
            onUpdateMessage={handleUpdateMessage}
          />
        )}
        
        {currentView === AppView.SETTINGS && (
          <div className="flex flex-col h-full bg-background relative overflow-hidden">
             {/* Decor */}
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-surface_light/20 to-transparent pointer-events-none"></div>

            <header className="pt-14 px-6 mb-8 relative z-10">
              <h1 className="text-3xl font-bold text-white tracking-tight">设置</h1>
            </header>
            
            <div className="px-6 space-y-6 relative z-10">
              <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-5">
                  <h2 className="font-semibold text-white mb-2">关于 Are U Dead?</h2>
                  <p className="text-sm text-text_muted leading-relaxed">
                    本应用是一个各种意义上的“生存确认”系统。它需要您每天进行签到。如果超过 72 小时未活动，它将假设您处于无法行动的状态，并协助您联系紧急联系人。
                  </p>
                </div>
                <div className="bg-surface_light/30 px-5 py-3 border-t border-white/5">
                   <p className="text-[10px] text-text_muted/70 font-mono">Build v1.0.2 • Secure Client-Side</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3">
                 <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <p className="text-xs text-amber-200/80 leading-relaxed">
                   Web 版演示说明: 此应用逻辑运行在本地浏览器中。如果关闭页面或手机断电，自动计时器无法在后台触发邮件发送。真实场景需要后端服务支持。
                 </p>
              </div>

              <button 
                 onClick={() => {
                   if(confirm("确定要清除所有数据并重置应用吗？")) {
                     localStorage.clear();
                     window.location.reload();
                   }
                 }}
                 className="w-full py-4 text-primary text-sm font-medium border border-white/5 rounded-2xl hover:bg-surface_light transition-colors"
                >
                 重置应用数据
               </button>
            </div>
          </div>
        )}
      </main>

      {/* Tab Navigation */}
      <TabBar currentView={currentView} onChange={setCurrentView} />
    </div>
  );
};

export default App;