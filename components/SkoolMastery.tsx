
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { SkoolAssets } from '../types';
import { marked } from 'marked';

interface Props {
  lang: 'es' | 'en' | 'pt';
}

const SkoolMastery: React.FC<Props> = ({ lang }) => {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<SkoolAssets | null>(null);
  const [niche, setNiche] = useState('Personal Finance & Wealth');
  const [target, setTarget] = useState('High-performance entrepreneurs in the US');

  const safeMarked = (content: any): string => {
    if (!content) return '';
    const str = Array.isArray(content) ? content.join('\n\n') : String(content);
    return marked.parse(str) as string;
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await geminiService.generateSkoolStrategy(niche, target);
      setAssets(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header>
        <h2 className="text-3xl font-black gradient-text italic uppercase tracking-tighter">Skool Mastery Hub</h2>
        <p className="text-slate-500 font-serif italic">Your global expansion command center. Target the English Market like a Pro.</p>
      </header>

      <div className="glass-panel p-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Community Niche</label>
          <input 
            value={niche} 
            onChange={e => setNiche(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. Health Optimization, Real Estate Investing..."
          />
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Market Description</label>
          <input 
            value={target} 
            onChange={e => setTarget(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. 30-45 year old professionals in USA..."
          />
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
        >
          {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-earth-americas mr-2"></i>}
          Generate Global Strategy
        </button>
      </div>

      {assets && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl text-blue-400">Skool About Page (Sales Copy)</h3>
              <button onClick={() => copyToClipboard(assets.aboutPage)} className="text-[10px] bg-white text-slate-950 px-3 py-1 rounded-full font-black uppercase">Copy</button>
            </div>
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 font-serif text-sm italic leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar"
                 dangerouslySetInnerHTML={{ __html: safeMarked(assets.aboutPage) }} />
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-6">
             <h3 className="font-black text-xl text-emerald-400">30-Day Growth Roadmap</h3>
             <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 font-serif text-sm italic leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar"
                  dangerouslySetInnerHTML={{ __html: safeMarked(assets.growthPlan) }} />
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-6">
             <h3 className="font-black text-xl text-purple-400">High-Converting Ad Copy</h3>
             <div className="space-y-4">
                {assets.adCopy.map((ad, i) => (
                  <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-3">
                    <p className="text-[10px] font-black uppercase text-slate-500">Variant {i+1}</p>
                    <p className="text-xs italic leading-relaxed">{ad}</p>
                    <button onClick={() => copyToClipboard(ad)} className="text-[9px] font-black uppercase text-blue-400">Copy Script</button>
                  </div>
                ))}
             </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-6">
             <h3 className="font-black text-xl text-amber-400">Client Closing DM Scripts</h3>
             <div className="space-y-4">
                {assets.dmScripts.map((dm, i) => (
                  <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-3">
                    <p className="text-[10px] font-black uppercase text-slate-500">Closing Method {i+1}</p>
                    <p className="text-xs italic leading-relaxed">{dm}</p>
                    <button onClick={() => copyToClipboard(dm)} className="text-[9px] font-black uppercase text-amber-500">Copy Script</button>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkoolMastery;
