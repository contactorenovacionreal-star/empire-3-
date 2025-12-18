
import React, { useState } from 'react';
import { marked } from 'marked';

interface Props {
  ebook: any;
  onBack?: () => void;
  lang: 'es' | 'en' | 'pt';
}

const EBookReader: React.FC<Props> = ({ ebook, onBack, lang }) => {
  const [activeChapter, setActiveChapter] = useState(0);

  const safeMarked = (content: any): string => {
    if (!content) return '';
    return marked.parse(String(content)) as string;
  };

  const i18n = {
    es: {
      back: 'Volver al Nexo',
      download: 'Descargar PDF',
      chapters: 'Arquitectura del Conocimiento',
      bonuses: 'Activos Adicionales',
      reading: 'Progreso de Asimilación'
    }
  }[lang] || { es: {} };

  const currentChapter = ebook.chapters[activeChapter];

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex animate-fadeIn overflow-hidden">
      {/* Sidebar de Navegación del Libro */}
      <aside className="w-80 border-r border-white/5 bg-[#0a0f1e] p-8 flex flex-col gap-8 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Digital Masterpiece</p>
          <h2 className="text-2xl font-black italic uppercase leading-tight gradient-text">{ebook.title}</h2>
        </div>

        <nav className="flex-1 space-y-6">
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{i18n.chapters}</p>
            <div className="space-y-1">
              {ebook.chapters.map((ch: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveChapter(i)}
                  className={`w-full text-left p-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${
                    activeChapter === i 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${activeChapter === i ? 'bg-blue-600 text-white' : 'bg-slate-800'}`}>
                    {i + 1}
                  </span>
                  <span className="truncate">{ch.title}</span>
                </button>
              ))}
            </div>
          </div>

          {ebook.bonuses && ebook.bonuses.length > 0 && (
            <div className="space-y-3">
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">{i18n.bonuses}</p>
              <div className="space-y-1">
                {ebook.bonuses.map((b: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-[10px] font-bold text-amber-200/60 flex items-center gap-3">
                    <i className="fa-solid fa-gift"></i>
                    {b.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <button 
            onClick={() => window.print()}
            className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition shadow-xl"
          >
            <i className="fa-solid fa-file-pdf mr-2"></i> {i18n.download}
          </button>
          {onBack && (
            <button onClick={onBack} className="w-full text-slate-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition">
              <i className="fa-solid fa-arrow-left mr-2"></i> {i18n.back}
            </button>
          )}
        </div>
      </aside>

      {/* Área de Lectura Principal */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        <div className="max-w-4xl mx-auto py-20 px-10">
          <article className="glass-panel p-16 rounded-[60px] border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Cabecera del Capítulo */}
            <header className="mb-16 space-y-8">
              <div className="flex justify-between items-center">
                <span className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                  Capítulo {activeChapter + 1}
                </span>
                <span className="text-slate-600 font-mono text-[10px]">Lector Empire v3.1</span>
              </div>
              
              <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-tight gradient-text">
                {currentChapter.title}
              </h1>

              {currentChapter.imageUrl && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[40px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <img 
                    src={currentChapter.imageUrl} 
                    alt={currentChapter.title} 
                    className="relative w-full aspect-[21/9] object-cover rounded-[40px] border border-white/10 shadow-2xl"
                  />
                </div>
              )}
            </header>

            {/* Contenido del EBook */}
            <div 
              className="markdown-body prose prose-invert max-w-none text-lg font-serif italic leading-relaxed text-slate-300"
              dangerouslySetInnerHTML={{ __html: safeMarked(currentChapter.content) }}
            />

            <footer className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Empire AI - Premium Content</p>
              <div className="flex gap-4">
                <button 
                  disabled={activeChapter === 0}
                  onClick={() => setActiveChapter(v => v - 1)}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-950 transition disabled:opacity-20"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button 
                  disabled={activeChapter === ebook.chapters.length - 1}
                  onClick={() => setActiveChapter(v => v + 1)}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-950 transition disabled:opacity-20"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
};

export default EBookReader;
