
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { supabaseService } from '../services/supabase';
import { integrationService } from '../services/integrations';
import EBookReader from './EBookReader';

interface Props {
  orderId: string;
  lang: 'es' | 'en' | 'pt';
}

const PublicCustomerForm: React.FC<Props> = ({ orderId, lang }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'welcome' | 'form' | 'processing' | 'success' | 'reading'>('welcome');
  const [orderData, setOrderData] = useState<any>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentTask, setCurrentTask] = useState('');
  const [progress, setProgress] = useState(0);
  const [finalEbook, setFinalEbook] = useState<any>(null);

  const i18n = {
    es: {
      welcome: 'Configurando tu Masterpiece',
      thanks: '¡Gracias por tu compra!',
      sub: 'Para que tu libro sea 100% efectivo, nuestro sistema necesita conocer tu contexto actual.',
      btnStart: 'Personalizar mi EBook',
      formTitle: 'Diagnóstico de Experto',
      btnSubmit: 'Enviar y Procesar mi Libro',
      successTitle: '¡Todo listo!',
      successMsg: 'Tu Masterpiece personalizada ha sido sintetizada con éxito.',
      btnRead: 'Entrar a mi Masterpiece',
      processing: 'Sintetizando Inteligencia',
    }
  }[lang] || { es: {} };

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await supabaseService.getOrder(orderId);
      setOrderData(data);
      if (data.status === 'generating') {
        setStep('processing');
        setProgress(data.progress);
      } else if (data.status === 'completed') {
        setFinalEbook(data.ebookContent);
        setStep('success');
      }
    };
    fetchOrder();
  }, [orderId]);

  const startCustomization = async () => {
    setLoading(true);
    try {
      const qs = await geminiService.generateNicheQuestions(orderData.niche, orderData.tier, lang);
      setQuestions(qs);
      setStep('form');
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStep('processing');
    
    (async () => {
      try {
        await supabaseService.updateOrderStatus(orderId, 'generating', 5);
        setCurrentTask("Analizando perfil...");

        const chapterTitles = orderData.tier === 'TIER_3' 
          ? ["Visión de Élite", "Mecanismo Único", "Protocolos", "Escala", "Conclusión"]
          : ["Introducción", "Método", "Pasos"];

        let chapters = [];
        for (let i = 0; i < chapterTitles.length; i++) {
          const cp = Math.round(10 + ((i + 1) / chapterTitles.length) * 80);
          setCurrentTask(`Redactando Capítulo ${i + 1}...`);
          setProgress(cp);
          await supabaseService.updateOrderStatus(orderId, 'generating', cp);
          
          const res = await geminiService.generateChapter(chapterTitles[i], orderData.niche, orderData.tier, { name: orderData.customerName, personalContext: JSON.stringify(answers) }, lang);
          const imageUrl = await geminiService.generateChapterImage(res.imagePrompt, orderData.tier);
          
          chapters.push({ title: chapterTitles[i], content: res.content, imageUrl: imageUrl || undefined });
        }

        const bonuses = await geminiService.generateBonuses(orderData.customerName, orderData.niche, orderData.tier, lang);
        const ebook = { title: orderData.niche, chapters, bonuses };
        
        await supabaseService.saveEBook(orderId, ebook);
        setFinalEbook(ebook);
        setStep('success');
      } catch (e) {
        console.error(e);
        await supabaseService.updateOrderStatus(orderId, 'error', 0);
      }
    })();
  };

  if (step === 'reading' && finalEbook) {
    return <EBookReader ebook={finalEbook} lang={lang} />;
  }

  return (
    <div className="max-w-2xl w-full">
      {step === 'welcome' && (
        <div className="glass-panel p-12 rounded-[40px] text-center space-y-8 animate-fadeIn border-2 border-white/5 shadow-2xl">
           <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20">
             <i className="fa-solid fa-crown text-white"></i>
           </div>
           <div className="space-y-3">
             <h2 className="text-3xl font-black italic uppercase tracking-tighter gradient-text leading-tight">{i18n.thanks}, {orderData?.customerName}</h2>
             <p className="text-slate-400 font-serif italic text-lg">{i18n.sub}</p>
           </div>
           <button onClick={startCustomization} disabled={loading} className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl">
             {loading ? 'Iniciando...' : i18n.btnStart}
           </button>
        </div>
      )}

      {step === 'form' && (
        <div className="glass-panel p-10 rounded-[40px] space-y-8 animate-fadeIn border border-white/5">
           <header className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-blue-500">
                <i className="fa-solid fa-brain"></i>
              </div>
              <h3 className="text-xl font-black italic uppercase">{i18n.formTitle}</h3>
           </header>
           <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {questions.map((q, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{q}</p>
                  <textarea 
                    onChange={e => setAnswers({...answers, [q]: e.target.value})}
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 outline-none focus:border-blue-500/50 transition-all font-serif italic text-slate-300"
                    rows={2}
                  />
                </div>
              ))}
           </div>
           <button onClick={handleSubmit} disabled={loading} className="w-full py-5 bg-blue-600 rounded-2xl font-black uppercase tracking-widest shadow-xl">
             {i18n.btnSubmit}
           </button>
        </div>
      )}

      {step === 'processing' && (
        <div className="glass-panel p-12 rounded-[40px] text-center space-y-8 animate-fadeIn border border-blue-500/30">
           <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={377} strokeDashoffset={377 - (377 * progress) / 100}
                        className="text-blue-500 transition-all duration-500" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-2xl">{progress}%</div>
           </div>
           <div className="space-y-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter animate-pulse">{i18n.processing}</h3>
              <p className="text-blue-400 font-mono text-[11px] uppercase tracking-widest">{currentTask}</p>
           </div>
        </div>
      )}

      {step === 'success' && (
        <div className="glass-panel p-12 rounded-[40px] text-center space-y-10 animate-fadeIn border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
           <div className="w-24 h-24 bg-emerald-500/10 rounded-full mx-auto flex items-center justify-center text-4xl text-emerald-500">
             <i className="fa-solid fa-circle-check"></i>
           </div>
           <div className="space-y-4">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">{i18n.successTitle}</h2>
              <p className="text-slate-400 font-serif italic text-lg">{i18n.successMsg}</p>
           </div>
           <button 
             onClick={() => setStep('reading')}
             className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-[30px] font-black uppercase tracking-[0.2em] hover:scale-105 transition shadow-2xl shadow-blue-500/20"
           >
             {i18n.btnRead}
           </button>
        </div>
      )}
    </div>
  );
};

export default PublicCustomerForm;
