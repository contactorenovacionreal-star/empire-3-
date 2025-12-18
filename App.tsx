
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EBookGenerator from './components/EBookGenerator';
import MarketingHub from './components/MarketingHub';
import LandingPageGenerator from './components/LandingPageGenerator';
import SubscriptionManager from './components/SubscriptionManager';
import AdminDashboard from './components/AdminDashboard';
import SubscriberDashboard from './components/SubscriberDashboard';
import SkoolMastery from './components/SkoolMastery';
import PublicCustomerForm from './components/PublicCustomerForm';
import { SubscriptionPlan, UserProfile } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [lang, setLang] = useState<'es' | 'en' | 'pt'>('es');
  
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  const [user, setUser] = useState<UserProfile>({
    id: 'usr_123',
    name: 'Dueño del Imperio',
    email: 'admin@empire.ai',
    role: 'admin', 
    plan: SubscriptionPlan.EMPIRE,
    limits: { ebooksPerMonth: 100, ebooksUsed: 12, aiVideoCredits: 500, aiVideoUsed: 0 }
  });

  const toggleRole = () => {
    const isNowSubscriber = user.role === 'admin';
    setUser(prev => ({
      ...prev,
      role: isNowSubscriber ? 'subscriber' : 'admin',
      name: isNowSubscriber ? 'Alumno de Skool' : 'Dueño del Imperio',
      email: isNowSubscriber ? 'alumno@skool.com' : 'admin@empire.ai'
    }));
    setActiveTab('dashboard'); 
  };

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  if (orderId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 flex items-center justify-center">
        {!hasApiKey && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 text-center">
             <div className="max-w-md glass-panel p-10 rounded-3xl space-y-6">
                <h2 className="text-xl font-black uppercase italic">Configurando Motor AI</h2>
                <button onClick={async () => { await (window as any).aistudio.openSelectKey(); setHasApiKey(true); }} className="w-full py-4 bg-blue-600 rounded-2xl font-black">Activar para Generar mi EBook</button>
             </div>
          </div>
        )}
        <PublicCustomerForm orderId={orderId} lang={lang} />
      </div>
    );
  }

  const renderContent = () => {
    const adminOnlyTabs = ['skool', 'landing', 'marketing', 'admin'];
    if (user.role === 'subscriber' && adminOnlyTabs.includes(activeTab)) {
      return <SubscriberDashboard user={user} lang={lang} />;
    }

    switch (activeTab) {
      case 'dashboard': 
        return user.role === 'admin' 
          ? <AdminDashboard lang={lang} /> 
          : <SubscriberDashboard user={user} lang={lang} />;
      case 'my-books': 
        // Aunque no esté en el sidebar del alumno, mantenemos el componente para el admin
        return <SubscriberDashboard user={user} lang={lang} />;
      case 'creator': 
        return <EBookGenerator lang={lang} userId={user.id} />;
      case 'skool': 
        return <SkoolMastery lang={lang} />;
      case 'landing': 
        return <LandingPageGenerator lang={lang} />;
      case 'marketing': 
        return <MarketingHub lang={lang} />;
      case 'billing': 
        return <SubscriptionManager user={user} lang={lang} />;
      case 'admin': 
        return <AdminDashboard lang={lang} />;
      default: 
        return user.role === 'admin' ? <AdminDashboard lang={lang} /> : <SubscriberDashboard user={user} lang={lang} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {!hasApiKey && activeTab !== 'billing' && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 text-center">
          <div className="max-w-md glass-panel p-10 rounded-3xl space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Activar Motor SaaS</h2>
            <button onClick={async () => { await (window as any).aistudio.openSelectKey(); setHasApiKey(true); }} className="w-full py-4 bg-blue-600 font-black rounded-2xl uppercase text-sm">
              Conectar Google Cloud
            </button>
          </div>
        </div>
      )}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={user.role} 
        lang={lang} 
        setLang={setLang}
        onToggleRole={toggleRole}
      />
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
