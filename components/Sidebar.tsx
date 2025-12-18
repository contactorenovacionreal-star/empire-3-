
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: 'admin' | 'subscriber';
  lang: 'es' | 'en' | 'pt';
  setLang: (l: 'es' | 'en' | 'pt') => void;
  onToggleRole?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role, lang, setLang, onToggleRole }) => {
  const i18n = {
    es: {
      dashboard: 'Mi Biblioteca',
      myBooks: 'Mis Libros',
      creator: 'Creador EBook',
      landing: 'Landing Pages',
      marketing: 'Marketing Hub',
      skool: 'Estrategia Skool',
      billing: 'Suscripción',
      admin: 'Nexo Dueño (Global)',
      langLabel: 'Idioma App',
      switchRole: 'Probar como ' + (role === 'admin' ? 'Alumno' : 'Dueño')
    },
    en: {
      dashboard: 'My Library',
      myBooks: 'My Books',
      creator: 'EBook Creator',
      landing: 'Landing Pages',
      marketing: 'Marketing Hub',
      skool: 'Skool Strategy',
      billing: 'Subscription',
      admin: 'Owner Nexus',
      langLabel: 'App Language',
      switchRole: 'Test as ' + (role === 'admin' ? 'Student' : 'Owner')
    },
    pt: {
      dashboard: 'Minha Biblioteca',
      myBooks: 'Meus Livros',
      creator: 'Criador de EBook',
      landing: 'Páginas de Vendas',
      marketing: 'Hub de Marketing',
      skool: 'Estratégia Skool',
      billing: 'Assinatura',
      admin: 'Nexo Dono',
      langLabel: 'Idioma App',
      switchRole: 'Testar como ' + (role === 'admin' ? 'Aluno' : 'Dono')
    }
  }[lang];

  // DEFINICIÓN DE MENÚS POR ROL
  const menuItems = role === 'admin' 
    ? [
        { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard Global' },
        { id: 'my-books', icon: 'fa-book', label: i18n.myBooks },
        { id: 'creator', icon: 'fa-book-medical', label: i18n.creator },
        { id: 'skool', icon: 'fa-graduation-cap', label: i18n.skool },
        { id: 'landing', icon: 'fa-window-maximize', label: i18n.landing },
        { id: 'marketing', icon: 'fa-bullhorn', label: i18n.marketing },
        { id: 'billing', icon: 'fa-credit-card', label: i18n.billing },
        { id: 'admin', icon: 'fa-user-shield', label: i18n.admin },
      ]
    : [
        { id: 'dashboard', icon: 'fa-house-user', label: i18n.dashboard },
        { id: 'creator', icon: 'fa-magic-wand-sparkles', label: i18n.creator },
        { id: 'billing', icon: 'fa-id-card', label: i18n.billing },
      ];

  return (
    <div className="w-64 glass-panel h-screen flex flex-col p-6 sticky top-0 shadow-2xl border-r border-white/5">
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-crown text-white"></i>
        </div>
        <h1 className="text-xl font-bold gradient-text tracking-tight italic">Empire AI</h1>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === item.id 
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner shadow-blue-500/10' 
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
            <span className="font-semibold text-sm tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 space-y-6 border-t border-white/5">
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
             <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
             {i18n.langLabel}
          </p>
          <div className="grid grid-cols-3 gap-1 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
            {['es', 'en', 'pt'].map(l => (
              <button 
                key={l}
                onClick={() => setLang(l as any)}
                className={`flex flex-col items-center justify-center py-2 rounded-xl text-[10px] font-bold transition-all duration-300 ${
                  lang === l 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>{l.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onToggleRole}
          className="w-full group flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-white/5 hover:border-blue-500/50 transition-all"
        >
          <div className="relative">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`} className="w-10 h-10 rounded-full border-2 border-slate-700/50" alt="Profile" />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] ${role === 'admin' ? 'bg-amber-500' : 'bg-blue-500'}`}>
               <i className={`fa-solid ${role === 'admin' ? 'fa-shield' : 'fa-user'}`}></i>
            </div>
          </div>
          <div className="overflow-hidden text-left flex-1">
            <p className="text-[10px] font-black truncate text-slate-100 uppercase tracking-tighter">{role === 'admin' ? 'DUEÑO EMPIRE' : 'ALUMNO SKOOL'}</p>
            <p className="text-[9px] text-blue-400 font-bold animate-pulse group-hover:text-white transition-colors">
              {i18n.switchRole}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
