
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/gemini';

interface Props {
  lang: 'es' | 'en' | 'pt';
}

const LandingPageGenerator: React.FC<Props> = ({ lang }) => {
  const [loading, setLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  
  // Safe parsing of draft data
  const getInitialDraft = () => {
    try {
      const stored = localStorage.getItem('active_ebook_draft');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          title: parsed?.ebook?.title || '',
          niche: parsed?.ebook?.niche || ''
        };
      }
    } catch (e) {
      console.warn("Could not parse draft from local storage", e);
    }
    return { title: '', niche: '' };
  };

  const initialDraft = getInitialDraft();

  const [inputs, setInputs] = useState({
    title: initialDraft.title,
    niche: initialDraft.niche,
    priceTier1: '9.99',
    priceTier2: '29.99',
    priceTier3: '97.00',
    linkTier1: '#',
    linkTier2: '#',
    linkTier3: '#',
  });

  const i18n = {
    es: {
      header: 'Creador de Landing Page',
      sub: 'Genera un embudo de ventas profesional en segundos.',
      btn: 'Construir Landing Majestuosa',
      pricing: 'Precios y Checkout',
      t1: 'Precio Tier 1 ($)',
      t3: 'Precio Tier 3 ($)',
      link3: 'Link Checkout Tier 3 (Hotmart)',
      export: 'Exportar a Netlify',
      exportDesc: 'Una vez generado, descarga el archivo y arrástralo a Netlify Drop para tener tu web en vivo en 10 segundos.',
      dlBtn: 'Descargar index.html',
      previewPh: 'Tu vista previa de landing aparecerá aquí.',
      genTxt: 'Renovación Real está redactando tu copia de ventas...'
    },
    en: {
      header: 'Landing Page Creator',
      sub: 'Generate a professional sales funnel in seconds.',
      btn: 'Build Majestic Landing',
      pricing: 'Pricing & Checkout',
      t1: 'Tier 1 Price ($)',
      t3: 'Tier 3 Price ($)',
      link3: 'Tier 3 Checkout Link (Hotmart)',
      export: 'Export to Netlify',
      exportDesc: 'Once generated, download the file and drag it into Netlify Drop for a live website in 10 seconds.',
      dlBtn: 'Download index.html',
      previewPh: 'Your majestic landing page preview will appear here.',
      genTxt: 'Renovación Real is writing your sales copy...'
    },
    pt: {
      header: 'Criador de Landing Page',
      sub: 'Gere um funil de vendas profesional em segundos.',
      btn: 'Construir Landing Majestosa',
      pricing: 'Preços e Checkout',
      t1: 'Preço Tier 1 ($)',
      t3: 'Preço Tier 3 ($)',
      link3: 'Link Checkout Tier 3 (Hotmart)',
      export: 'Exportar para Netlify',
      exportDesc: 'Após gerado, baixe o arquivo e arraste-o para o Netlify Drop para ter seu site no ar em 10 segundos.',
      dlBtn: 'Baixar index.html',
      previewPh: 'Sua visualização da landing aparecerá aqui.',
      genTxt: 'Renovación Real está redigindo seu copy de vendas...'
    }
  }[lang];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const html = await geminiService.generateLandingPage(
        inputs.title,
        inputs.niche,
        { tier1: inputs.priceTier1, tier2: inputs.priceTier2, tier3: inputs.priceTier3 },
        { tier1: inputs.linkTier1, tier2: inputs.linkTier2, tier3: inputs.linkTier3 },
        lang
      );
      setHtmlContent(html || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `index.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{i18n.header}</h2>
          <p className="text-slate-400">{i18n.sub}</p>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50">
          {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rocket"></i>}
          {i18n.btn}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-blue-400">
              <i className="fa-solid fa-tags"></i> {i18n.pricing}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">{i18n.t1}</label>
                <input value={inputs.priceTier1} onChange={e => setInputs({...inputs, priceTier1: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">{i18n.t3}</label>
                <input value={inputs.priceTier3} onChange={e => setInputs({...inputs, priceTier3: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <hr className="border-slate-800" />
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">{i18n.link3}</label>
                <input value={inputs.linkTier3} onChange={e => setInputs({...inputs, linkTier3: e.target.value})} placeholder="https://pay.hotmart.com/..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl space-y-4 bg-emerald-600/5 border-emerald-500/20">
            <h3 className="font-bold flex items-center gap-2 text-emerald-400"><i className="fa-solid fa-cloud-arrow-up"></i> {i18n.export}</h3>
            <p className="text-xs text-slate-400">{i18n.exportDesc}</p>
            <button onClick={handleDownload} disabled={!htmlContent} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition disabled:opacity-30">{i18n.dlBtn}</button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {htmlContent ? (
            <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[700px]">
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                <span className="text-xs text-slate-500 font-mono italic">Preview: Personalized Experience Landing</span>
              </div>
              <iframe srcDoc={htmlContent} className="w-full flex-1 bg-white" title="Landing Preview" />
            </div>
          ) : (
            <div className="h-full min-h-[500px] border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-4">
              <i className="fa-solid fa-browser text-5xl opacity-20"></i>
              <p className="font-serif italic">{i18n.previewPh}</p>
              {loading && <div className="flex flex-col items-center gap-2"><i className="fa-solid fa-wand-sparkles fa-spin text-blue-500 text-2xl"></i><span className="text-sm animate-pulse">{i18n.genTxt}</span></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPageGenerator;
