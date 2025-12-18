
import React, { useState } from 'react';
import { integrationService } from '../services/integrations';

const MarketingHub: React.FC<{ lang: 'es' | 'en' | 'pt' }> = ({ lang }) => {
  const [loading, setLoading] = useState(false);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);

  const i18n = {
    es: {
      header: 'Centro de Automatización Total',
      sub: 'Conecta Hotmart, Make.com y MailerLite en un solo flujo.',
      setupTitle: 'Guía de Conexión (Make.com)',
      webhookUrl: 'Endpoint de Supabase / API',
      steps: [
        { t: '1. Trigger Hotmart', d: 'Configura Webhook en Hotmart para "Compra Aprobada".', icon: 'fa-cart-shopping' },
        { t: '2. Make.com Bridge', d: 'Recibe el JSON y crea una fila en Supabase.', icon: 'fa-bridge' },
        { t: '3. MailerLite Link', d: 'Make envía el primer email con el link ?orderId=...', icon: 'fa-link' },
        { t: '4. App Delivery', d: 'El cliente llena el form, la App genera y avisa a Make.', icon: 'fa-check-double' }
      ]
    }
  }[lang] || { es: {} };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black gradient-text italic uppercase tracking-tighter">{i18n.header}</h2>
          <p className="text-slate-500 font-serif italic">{i18n.sub}</p>
        </div>
        <button 
          onClick={() => setShowWebhookGuide(!showWebhookGuide)}
          className="px-6 py-3 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20"
        >
          {showWebhookGuide ? 'Ocultar Guía' : 'Ver Configuración Make'}
        </button>
      </header>

      {showWebhookGuide && (
        <div className="glass-panel p-8 rounded-[40px] border-2 border-blue-500/30 animate-slideDown space-y-6">
           <h3 className="text-xl font-black italic uppercase text-blue-400">{i18n.setupTitle}</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <p className="text-sm font-bold text-slate-300">Configuración del Webhook en Hotmart:</p>
                 <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 font-mono text-[10px] text-blue-300">
                    URL: https://tudominio.supabase.co/rest/v1/orders<br/>
                    METHOD: POST<br/>
                    HEADER: apikey: TU_SUPABASE_KEY
                 </div>
              </div>
              <div className="space-y-4">
                 <p className="text-sm font-bold text-slate-300">Estructura JSON esperada (Make.com):</p>
                 <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 font-mono text-[10px] text-emerald-300">
                    {`{
  "orderId": "{{hotmart.transaction}}",
  "email": "{{hotmart.email}}",
  "name": "{{hotmart.first_name}}",
  "tier": "TIER_3",
  "status": "pending_form"
}`}
                 </div>
              </div>
           </div>
           <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <p className="text-[10px] italic font-serif text-blue-200">
                <b>Nota:</b> Al recibir este JSON, Make debe enviar un email mediante MailerLite con el link personalizado: <br/>
                <span className="text-white">https://tu-app.com/?orderId=&#123;&#123;transaction&#125;&#125;</span>
              </p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {i18n.steps.map((step, i) => (
          <div key={i} className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
             <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-blue-500 shadow-inner">
                <i className={`fa-solid ${step.icon} text-xl`}></i>
             </div>
             <div>
                <h4 className="text-xs font-black uppercase text-slate-200 tracking-tighter">{step.t}</h4>
                <p className="text-[10px] text-slate-500 italic font-serif leading-tight mt-1">{step.d}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-10 rounded-[40px] border border-white/5 flex flex-col items-center text-center space-y-6">
         <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-3xl text-emerald-500 animate-pulse">
            <i className="fa-solid fa-robot"></i>
         </div>
         <div className="max-w-md">
            <h3 className="text-2xl font-black italic uppercase tracking-widest">Motor de Fulfillment Activo</h3>
            <p className="text-xs text-slate-500 font-serif italic mt-2">
              Tu aplicación está lista para recibir tráfico. Asegúrate de tener los grupos de MailerLite configurados con los tags correctos.
            </p>
         </div>
         <div className="flex gap-4">
            <button className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition">Probar Trigger MailerLite</button>
            <button className="px-8 py-4 bg-slate-900 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition">Ver Logs de Make.com</button>
         </div>
      </div>
    </div>
  );
};

export default MarketingHub;
