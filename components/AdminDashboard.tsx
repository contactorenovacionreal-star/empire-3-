
import React, { useState, useEffect } from 'react';
import { supabaseService, supabase } from '../services/supabase';
import EBookReader from './EBookReader';

const AdminDashboard: React.FC<{ lang: 'es' | 'en' | 'pt' }> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'logs'>('stats');
  const [orders, setOrders] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(supabaseService.isConfigured());
  const [logs, setLogs] = useState<{t: string, m: string, id: string}[]>([]);
  const [viewingEbook, setViewingEbook] = useState<any>(null);

  const addLog = (message: string) => {
    setLogs(prev => [{ t: new Date().toLocaleTimeString(), m: message, id: Math.random().toString() }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    if (!isConfigured) return;

    const load = async () => {
      const data = await supabaseService.getAllOrders();
      setOrders(data);
      setIsConnected(true);
    };

    load();

    const channel = supabase!
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        addLog(`Cambio en DB: ${payload.eventType} en ID ${payload.new?.id}`);
        load(); 
      })
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [isConfigured]);

  const handleViewOrder = async (orderId: string) => {
    const order = await supabaseService.getOrder(orderId);
    if (order.ebookContent) {
      setViewingEbook(order.ebookContent);
    } else {
      alert("Este libro aún no ha sido generado o está en proceso.");
    }
  };

  if (viewingEbook) {
    return <EBookReader ebook={viewingEbook} lang={lang} onBack={() => setViewingEbook(null)} />;
  }

  const i18n = {
    es: {
      header: 'Centro de Mando Empire',
      stats: 'Métricas',
      orders: 'Órdenes Activas',
      logs: 'Nexo Live',
      simulateBtn: 'Simular Venta Hotmart',
      table: { customer: 'Cliente', product: 'Nivel', status: 'Estado IA', date: 'Llegada' }
    }
  }[lang] || { es: {} };

  const getStatusBadge = (order: any) => {
    switch (order.status) {
      case 'pending_form': return <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">Falta Formulario</span>;
      case 'generating': return (
        <div className="flex flex-col gap-1 w-full max-w-[120px]">
          <span className="text-blue-500 text-[8px] font-black uppercase tracking-widest animate-pulse">Escribiendo {order.progress}%</span>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${order.progress}%` }}></div>
          </div>
        </div>
      );
      case 'completed': return <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Finalizado</span>;
      default: return <span className="text-slate-500 uppercase text-[9px] font-black tracking-widest">{order.status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black gradient-text italic uppercase tracking-tighter">{i18n.header}</h2>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
          </div>
          <p className="text-slate-500 font-serif italic text-sm">Monitoreo de Fulfillment en Tiempo Real</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5">
           {(['stats', 'orders', 'logs'] as const).map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
               {i18n[tab] || tab}
             </button>
           ))}
        </div>
      </header>

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="glass-panel p-8 rounded-3xl border-b-4 border-blue-500/40">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Ventas</p>
              <p className="text-4xl font-black">{orders.length}</p>
           </div>
           <div className="glass-panel p-8 rounded-3xl border-b-4 border-emerald-500/40">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Libros Listos</p>
              <p className="text-4xl font-black">{orders.filter(o => o.status === 'completed').length}</p>
           </div>
           <div className="glass-panel p-8 rounded-3xl border-b-4 border-amber-500/40">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pendientes Form</p>
              <p className="text-4xl font-black">{orders.filter(o => o.status === 'pending_form').length}</p>
           </div>
           <div className="glass-panel p-8 rounded-3xl border-b-4 border-purple-500/40">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">MRR Proyectado</p>
              <p className="text-4xl font-black text-emerald-400">${orders.length * 97}</p>
           </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="glass-panel rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
           <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80">
                 <tr>
                    <th className="p-5 text-[9px] font-black uppercase tracking-widest text-slate-500">{i18n.table.customer}</th>
                    <th className="p-5 text-[9px] font-black uppercase tracking-widest text-slate-500">{i18n.table.status}</th>
                    <th className="p-5 text-[9px] font-black uppercase tracking-widest text-slate-500">Tier</th>
                    <th className="p-5 text-[9px] font-black uppercase tracking-widest text-slate-500">Link</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                       <td className="p-5">
                          <p className="font-bold text-sm text-slate-200">{order.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono italic">{order.email}</p>
                       </td>
                       <td className="p-5">{getStatusBadge(order)}</td>
                       <td className="p-5"><span className="text-[10px] font-black text-blue-400">{order.tier}</span></td>
                       <td className="p-5">
                          <div className="flex gap-2">
                             <button 
                               onClick={() => window.open(`?orderId=${order.id}`, '_blank')} 
                               className="bg-slate-800 p-2.5 rounded-xl text-xs hover:bg-white hover:text-slate-950 transition-all shadow-lg"
                               title="Ver como cliente"
                             >
                                <i className="fa-solid fa-user"></i>
                             </button>
                             <button 
                               onClick={() => handleViewOrder(order.id)} 
                               className="bg-blue-600 p-2.5 rounded-xl text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                               title="Inspeccionar Libro"
                             >
                                <i className="fa-solid fa-magnifying-glass"></i>
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {orders.length === 0 && (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-600 font-serif italic text-sm">No hay órdenes registradas todavía...</td></tr>
                 )}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="glass-panel p-8 rounded-[40px] border border-white/5 bg-black/60 font-mono text-xs h-[500px] overflow-hidden flex flex-col">
           <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
              <span className="text-emerald-500 font-black tracking-widest uppercase italic">Nexo Live Terminal</span>
           </div>
           <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-4">
              {logs.map(log => (
                <div key={log.id} className="flex gap-4 animate-slideUp">
                  <span className="text-slate-600 shrink-0">[{log.t}]</span>
                  <span className="text-slate-300">{log.m}</span>
                </div>
              ))}
              {logs.length === 0 && <p className="text-slate-600 italic">Esperando actividad...</p>}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
