
import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabase';
import { UserProfile } from '../types';
import EBookReader from './EBookReader';

const SubscriberDashboard: React.FC<{ user: UserProfile, lang: 'es' | 'en' | 'pt' }> = ({ user, lang }) => {
  const [myBooks, setMyBooks] = useState<any[]>([]);
  const [viewingEbook, setViewingEbook] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      // Nota: En una implementación real, aquí filtraríamos por user.id en la DB
      const all = await supabaseService.getAllOrders();
      // Simulamos que el sub solo ve lo que él creó (aquí filtramos por demo)
      setMyBooks(all.filter(o => o.status === 'completed'));
    };
    load();
  }, [user.id]);

  if (viewingEbook) {
    return <EBookReader ebook={viewingEbook} lang={lang} onBack={() => setViewingEbook(null)} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-black gradient-text italic uppercase tracking-tighter">Mi Biblioteca de Activos</h2>
        <p className="text-slate-500 font-serif italic">Gestiona tus creaciones de alto valor.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500"><i className="fa-solid fa-book"></i></div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Libros Activos</p>
            <p className="text-2xl font-black">{myBooks.length}</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500"><i className="fa-solid fa-bolt"></i></div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Créditos IA Restantes</p>
            <p className="text-2xl font-black">{user.limits.ebooksPerMonth - user.limits.ebooksUsed}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myBooks.map(book => (
          <div key={book.id} className="glass-panel rounded-[32px] overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="aspect-video bg-slate-900 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
               <div className="absolute bottom-4 left-4">
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">{book.tier}</p>
                 <h4 className="text-lg font-black uppercase italic leading-tight">{book.niche}</h4>
               </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <span>Cliente: {book.name}</span>
                <span>{new Date(book.createdAt).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={async () => {
                  const data = await supabaseService.getOrder(book.id);
                  setViewingEbook(data.ebookContent);
                }}
                className="w-full py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition"
              >
                Abrir Lector
              </button>
            </div>
          </div>
        ))}
        {myBooks.length === 0 && (
          <div className="col-span-full py-20 text-center glass-panel rounded-[40px] border-2 border-dashed border-white/5">
             <i className="fa-solid fa-book-open text-4xl text-slate-800 mb-4 block"></i>
             <p className="text-slate-500 font-serif italic">Aún no has generado ningún libro. ¡Ve al creador para empezar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriberDashboard;
