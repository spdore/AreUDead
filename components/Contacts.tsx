import React, { useState, useEffect } from 'react';
import { AppState, EmergencyContact } from '../types';
import { generateEmergencyMessage } from '../services/geminiService';

interface ContactsProps {
  appState: AppState;
  onUpdateContact: (contact: EmergencyContact) => void;
  onUpdateMessage: (msg: string) => void;
}

const Contacts: React.FC<ContactsProps> = ({ appState, onUpdateContact, onUpdateMessage }) => {
  const [formData, setFormData] = useState<EmergencyContact>(appState.contact);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{show: boolean, type: 'success' | 'error', msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  // Sync formData with appState if appState changes externally (though rare in this flow)
  useEffect(() => {
    setFormData(appState.contact);
  }, [appState.contact]);

  const handleChange = (field: keyof EmergencyContact, value: string) => {
    // Only update local state, do not trigger parent update immediately
    const newData = { ...formData, [field]: value };
    setFormData(newData);
  };

  const handleSaveContact = () => {
    // Basic Validation
    if (!formData.name.trim()) {
      setFeedback({ show: true, type: 'error', msg: '保存失败: 请填写联系人姓名' });
      setTimeout(() => setFeedback(prev => ({ ...prev, show: false })), 3000);
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFeedback({ show: true, type: 'error', msg: '保存失败: 邮箱格式不正确' });
      setTimeout(() => setFeedback(prev => ({ ...prev, show: false })), 3000);
      return;
    }

    // Save
    onUpdateContact(formData);
    setFeedback({ show: true, type: 'success', msg: '联系人信息已更新' });
    setTimeout(() => setFeedback(prev => ({ ...prev, show: false })), 3000);
  };

  const handleGenerateMessage = async () => {
    setIsGenerating(true);
    const message = await generateEmergencyMessage("Me", formData.name, 'serious');
    onUpdateMessage(message);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
       {/* Background accent */}
       <div className="absolute -top-[10%] -right-[10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

      <header className="pt-14 px-6 mb-8 relative z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">紧急联系人</h1>
        <p className="text-text_muted text-sm mt-1">设置当您失联时系统的联系对象。</p>
      </header>

      {/* Feedback Toast */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg transition-all duration-300 transform ${feedback.show ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center space-x-2 text-sm font-medium ${feedback.type === 'success' ? 'bg-safe text-black' : 'bg-primary text-white'} px-4 py-2 rounded-full`}>
            {feedback.type === 'success' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            <span>{feedback.msg}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-28 space-y-8 relative z-10">
        
        {/* Contact Info Card */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
             <h2 className="text-xs font-semibold text-text_muted uppercase tracking-wider ml-1">联系人信息</h2>
          </div>
          
          <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-1">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="姓名 (例如: 妈妈)"
                className="w-full bg-transparent p-4 text-white placeholder-text_muted/50 focus:outline-none focus:bg-surface_light/50 transition-colors"
              />
              <div className="h-[1px] bg-white/5 mx-4"></div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="电子邮箱地址"
                className="w-full bg-transparent p-4 text-white placeholder-text_muted/50 focus:outline-none focus:bg-surface_light/50 transition-colors"
              />
            </div>
          </div>
          <button 
            onClick={handleSaveContact}
            className="w-full py-3 bg-surface_light hover:bg-white/10 text-white text-sm font-medium rounded-xl border border-white/5 transition-colors active:scale-[0.98]"
          >
            保存联系人设置
          </button>
        </section>

        {/* Message Card */}
        <section className="space-y-3">
          <div className="flex justify-between items-end px-1">
             <h2 className="text-xs font-semibold text-text_muted uppercase tracking-wider">紧急消息</h2>
             <button
                onClick={handleGenerateMessage}
                disabled={isGenerating || !process.env.API_KEY}
                className="flex items-center space-x-1 text-[10px] text-primary hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <span>生成中...</span>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>AI 自动撰写</span>
                  </>
                )}
             </button>
          </div>
          
          <div className="bg-surface border border-white/5 rounded-2xl p-1 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-all">
            <textarea
              value={appState.settings.customMessage}
              onChange={(e) => onUpdateMessage(e.target.value)}
              rows={6}
              className="w-full bg-transparent p-4 text-white text-sm leading-relaxed placeholder-text_muted/50 focus:outline-none resize-none"
              placeholder="输入紧急情况下发送的消息内容..."
            />
          </div>
          <p className="text-[10px] text-text_muted px-2">
            * 邮件发送时，系统会自动附带您当前的 GPS 坐标位置链接。
          </p>
        </section>

      </div>
    </div>
  );
};

export default Contacts;