
import React from 'react';
import { SubscriptionPlan, UserProfile } from '../types';

interface Props {
  user: UserProfile;
  lang: 'es' | 'en' | 'pt';
}

const SubscriptionManager: React.FC<Props> = ({ user, lang }) => {
  const i18n = {
    es: {
      header: 'Tu Plan de Imperio',
      usage: 'Consumo Mensual',
      ebooks: 'EBooks Generados',
      videos: 'Créditos Video AI',
      upgrade: 'Subir de Nivel',
      plans: 'Planes Disponibles',
      starter: 'Starter - Ideal para principiantes',
      pro: 'Pro - Para creadores serios',
      empire: 'Empire - Control Total'
    },
    en: {
      header: 'Your Empire Plan',
      usage: 'Monthly Consumption',
      ebooks: 'EBooks Generated',
      videos: 'AI Video Credits',
      upgrade: 'Upgrade Now',
      plans: 'Available Plans',
      starter: 'Starter - Great for beginners',
      pro: 'Pro - For serious creators',
      empire: 'Empire - Total Control'
    },
    pt: {
      header: 'Seu Plano de Império',
      usage: 'Consumo Mensal',
      ebooks: 'EBooks Gerados',
      videos: 'Créditos Vídeo IA',
      upgrade: 'Fazer Upgrade',
      plans: 'Planos Disponíveis',
      starter: 'Starter - Ideal para iniciantes',
      pro: 'Pro - Para criadores sérios',
      empire: 'Empire - Controle Total'
    }
  }[lang];

  const plans = [
    { id: SubscriptionPlan.STARTER, price: '$29', color: 'blue' },
    { id: SubscriptionPlan.PRO, price: '$79', color: 'purple' },
    { id: SubscriptionPlan.EMPIRE, price: '$197', color: 'amber' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-black gradient-text italic uppercase tracking-tighter">{i18n.header}</h2>
        <p className="text-slate-500 font-serif italic">Current Plan: <span className="text-blue-400 font-bold">{user.plan}</span></p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="font-black text-xl flex items-center gap-3"><i className="fa-solid fa-chart-line text-blue-500"></i> {i18n.usage}</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                <span>{i18n.ebooks}</span>
                <span>{user.limits.ebooksUsed} / {user.limits.ebooksPerMonth}</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000" 
                  style={{ width: `${(user.limits.ebooksUsed / user.limits.ebooksPerMonth) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                <span>{i18n.videos}</span>
                <span>{user.limits.aiVideoUsed} / {user.limits.aiVideoCredits}</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all duration-1000" 
                  style={{ width: `${(user.limits.aiVideoUsed / user.limits.aiVideoCredits) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-6 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-2xl text-blue-400 mb-4">
             <i className="fa-solid fa-rocket"></i>
           </div>
           <h3 className="text-xl font-black uppercase italic tracking-tighter">{i18n.upgrade}</h3>
           <p className="text-sm text-slate-500 font-serif italic mb-6">Escala tu negocio al mercado global y desbloquea el Tier 3 Masterpiece.</p>
           <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">Ver Planes Elite</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(p => (
          <div key={p.id} className={`glass-panel p-8 rounded-3xl border-t-4 transition-all hover:scale-105 cursor-pointer ${user.plan === p.id ? 'border-blue-500' : 'border-slate-800'}`}>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{p.id}</h4>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">{p.price}</span>
              <span className="text-xs text-slate-600">/mo</span>
            </div>
            <ul className="space-y-3 text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest">
               <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500"></i> AI Generation</li>
               <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500"></i> Market Hub</li>
               <li className="flex items-center gap-2"><i className={`fa-solid ${p.id === 'EMPIRE' ? 'fa-check text-emerald-500' : 'fa-xmark text-rose-500'}`}></i> Tier 3 Access</li>
            </ul>
            <button className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${user.plan === p.id ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-white text-slate-950 hover:bg-blue-500 hover:text-white'}`}>
              {user.plan === p.id ? 'Active Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionManager;
