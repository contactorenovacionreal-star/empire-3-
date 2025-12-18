
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { supabaseService } from '../services/supabase';
import { integrationService } from '../services/integrations';
import { EBook, EBookTier, Chapter, BonusAsset, SubscriptionPlan } from '../types';
import { marked } from 'marked';

interface Props {
  lang: 'es' | 'en' | 'pt';
  userId?: string;
}

const EBookGenerator: React.FC<Props> = ({ lang, userId = 'usr_invitado' }) => {
  const [step, setStep] = useState<'tier' | 'details' | 'form' | 'writing' | 'bonuses'>('tier');
  const [loading, setLoading] = useState(false);
  const [currentEBook, setCurrentEBook] = useState<Partial<EBook>>({
    title: '',
    niche: '',
    language: lang,
    tier: EBookTier.TIER_3,
    chapters: [],
    bonuses: []
  });
  
  const [persona, setPersona] = useState({ name: '', age: '', personalContext: '' });
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const safeMarked = (content: any): string => {
    if (!content) return '';
    const str = Array.isArray(content) ? content.join('\n\n') : String(content);
    return marked.parse(str) as string;
  };

  const handleTierSelect = (tier: EBookTier) => {
    setCurrentEBook(prev => ({ ...prev, tier }));
    setStep('details');
  };

  const handleStartForm = async () => {
    setLoading(true);
    try {
      const qs = await geminiService.generateNicheQuestions(currentEBook.niche!, currentEBook.tier!, lang);
      setQuestions(qs);
      setStep('form');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const generateInitialChapters = () => {
    const tier = currentEBook.tier!;
    const counts = { [EBookTier.TIER_1]: 3, [EBookTier.TIER_2]: 7, [EBookTier.TIER_3]: 10 }[tier];
    return Array.from({length: counts}).map((_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: i === 0 ? "PORTADA" : `Capítulo ${i}`,
      content: '',
      status: 'pending' as const
    }));
  };

  const handleFinishForm = () => {
    setCurrentEBook(prev => ({ ...prev, chapters: generateInitialChapters() }));
    setStep('writing');
  };

  const writeChapter = async (index: number) => {
    if (!currentEBook.chapters) return;
    const updated = [...currentEBook.chapters];
    updated[index].status = 'generating';
    setCurrentEBook(prev => ({ ...prev, chapters: updated }));

    try {
      const result = await geminiService.generateChapter(updated[index].title, currentEBook.niche!, currentEBook.tier!, { ...persona, ...answers }, lang);
      const imageUrl = await geminiService.generateChapterImage(result.imagePrompt, currentEBook.tier!);
      updated[index] = { ...updated[index], content: result.content, imageUrl: imageUrl || undefined, status: 'completed' };
      setCurrentEBook(prev => ({ ...prev, chapters: updated }));
      
      // Persistencia Real: Guardar progreso en Supabase tras cada capítulo
      await supabaseService.saveEBook(userId, { ...currentEBook, chapters: updated });
    } catch (e) {
      updated[index].status = 'pending';
      setCurrentEBook(prev => ({ ...prev, chapters: updated }));
    }
  };

  const finalizeEBook = async () => {
    setLoading(true);
    try {
      // 1. Generar Bonus
      const bonuses = await geminiService.generateBonuses(currentEBook.title!, currentEBook.niche!, currentEBook.tier!, lang);
      const finalized = { ...currentEBook, bonuses };
      setCurrentEBook(finalized);
      
      // 2. Guardar final en DB
      await supabaseService.saveEBook(userId, finalized);
      
      // 3. Integración MailerLite: Registrar al cliente en la lista de "Ebook Creado"
      await integrationService.subscribeToMailerLite(persona.name + "@cliente.com", persona.name, "Creadores de EBooks");

      setStep('bonuses');
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20 no-print">
      <header className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black italic tracking-tighter gradient-text uppercase">EBook Real-Time Factory</h2>
           <p className="text-slate-500 font-serif italic">Connected to Supabase & MailerLite.</p>
        </div>
        {currentEBook.chapters?.every(c => c.status === 'completed') && step === 'writing' && (
          <button onClick={finalizeEBook} disabled={loading} className="bg-amber-600 px-6 py-3 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-all">
            {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-gift mr-2"></i>}
            Finalizar y Activar Marketing
          </button>
        )}
      </header>

      {step === 'tier' && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
           {[EBookTier.TIER_1, EBookTier.TIER_2, EBookTier.TIER_3].map(t => (
             <button 
               key={t} 
               onClick={() => handleTierSelect(t)} 
               className="glass-panel p-8 rounded-3xl text-left transition-all group relative overflow-hidden border-2 border-white/5 hover:border-blue-500"
             >
               <div className="w-12 h-12 rounded-xl bg-slate-900 mb-6 flex items-center justify-center text-xl">
                 <i className={`fa-solid ${t === 'TIER_3' ? 'fa-crown text-amber-500' : t === 'TIER_2' ? 'fa-bolt text-blue-500' : 'fa-seedling text-emerald-500'}`}></i>
               </div>
               <h3 className="text-xl font-black mb-2">{t}</h3>
               <p className="text-xs text-slate-500 italic mb-6 leading-relaxed">Inicia el protocolo de creación para este nivel.</p>
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 group-hover:text-white transition">Seleccionar Nivel</span>
             </button>
           ))}
        </div>
      )}

      {step === 'details' && (
        <div className="max-w-2xl mx-auto glass-panel p-10 rounded-3xl space-y-6 shadow-2xl">
           <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título del Activo Digital</label>
             <input value={currentEBook.title} onChange={e => setCurrentEBook({...currentEBook, title: e.target.value})} placeholder="Título de tu Masterpiece..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors" />
           </div>
           <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nicho de Mercado</label>
             <input value={currentEBook.niche} onChange={e => setCurrentEBook({...currentEBook, niche: e.target.value})} placeholder="Ej: Longevidad, Cripto, Ventas..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors" />
           </div>
           <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre del Cliente a Personalizar</label>
             <input value={persona.name} onChange={e => setPersona({...persona, name: e.target.value})} placeholder="Nombre del avatar..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors" />
           </div>
           <button onClick={handleStartForm} className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all mt-4">Generar Diagnóstico de Experto</button>
        </div>
      )}

      {step === 'form' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-2xl font-black italic border-l-4 border-blue-500 pl-4">Mapping de Cliente Personalizado</h3>
          {questions.map((q, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
              <p className="text-sm font-bold text-slate-300">{i+1}. {q}</p>
              <textarea onChange={e => setAnswers({...answers, [q]: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 outline-none text-sm italic font-serif" rows={2} />
            </div>
          ))}
          <button onClick={handleFinishForm} className="w-full bg-emerald-600 py-4 rounded-xl font-black shadow-xl hover:bg-emerald-700 uppercase tracking-widest">Iniciar Síntesis AI</button>
        </div>
      )}

      {step === 'writing' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-panel p-6 rounded-2xl sticky top-24 border border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Arquitectura del Libro</h4>
              <div className="space-y-2">
                {currentEBook.chapters?.map((c, i) => (
                  <button key={i} onClick={() => setCurrentChapterIndex(i)} className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${currentChapterIndex === i ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white'}`}>
                    <span className="truncate">{i+1}. {c.title}</span>
                    <div className="flex gap-2 items-center">
                      {c.status === 'completed' && <i className="fa-solid fa-check-circle text-emerald-500"></i>}
                      {c.status === 'pending' && <span onClick={(e) => { e.stopPropagation(); writeChapter(i); }} className="text-[8px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black">ESCRIBIR</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            {currentEBook.chapters?.[currentChapterIndex] && (
              <div className="glass-panel p-12 rounded-3xl min-h-[600px] border border-white/5 font-serif italic text-lg leading-relaxed shadow-inner">
                <h3 className="text-3xl font-black gradient-text not-italic mb-8 border-b border-white/5 pb-4 uppercase tracking-tighter">{currentEBook.chapters[currentChapterIndex].title}</h3>
                {currentEBook.chapters[currentChapterIndex].imageUrl && <img src={currentEBook.chapters[currentChapterIndex].imageUrl} className="w-full aspect-video object-cover rounded-2xl mb-8 shadow-2xl border border-white/10" />}
                <div className="markdown-body prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: safeMarked(currentEBook.chapters[currentChapterIndex].content) }} />
                {currentEBook.chapters[currentChapterIndex].status === 'generating' && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                    <p className="text-sm font-black uppercase text-slate-500 animate-pulse tracking-widest">Sincronizando Inteligencia...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'bonuses' && (
        <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
           <header className="text-center">
             <h3 className="text-4xl font-black gradient-text italic mb-2 tracking-tighter uppercase">Activos de Autoridad Unlocked</h3>
             <p className="text-slate-500 font-serif italic">Tu EBook ha sido guardado en la nube y sincronizado con MailerLite.</p>
           </header>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentEBook.bonuses?.map((bonus, i) => (
                <div key={i} className="glass-panel p-8 rounded-3xl border-t-2 border-amber-500/30 space-y-4 hover:scale-[1.02] transition-transform">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-amber-500 shadow-inner"><i className={`fa-solid ${bonus.type === 'checklist' ? 'fa-list-check' : bonus.type === 'worksheet' ? 'fa-pen-to-square' : 'fa-map-location-dot'}`}></i></div>
                  <h4 className="font-black text-sm uppercase tracking-widest">{bonus.title}</h4>
                  <div className="text-[10px] text-slate-400 font-serif italic leading-relaxed overflow-hidden h-32" dangerouslySetInnerHTML={{ __html: safeMarked(bonus.content.substring(0, 150) + '...') }} />
                  <button className="w-full py-2 bg-slate-900 border border-white/5 rounded-lg text-[9px] font-black uppercase hover:bg-amber-600 transition">Inspeccionar Activo</button>
                </div>
              ))}
           </div>
           <button onClick={() => window.print()} className="w-full bg-white text-slate-950 py-6 rounded-2xl font-black text-xl shadow-2xl hover:scale-[1.01] transition-all uppercase tracking-widest">
             Generar PDF de Alta Resolución
           </button>
        </div>
      )}
    </div>
  );
};

export default EBookGenerator;
