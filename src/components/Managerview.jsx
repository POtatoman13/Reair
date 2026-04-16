// src/components/ManagerView.jsx
import React from 'react';
import { 
  Calculator, HardHat, Users2, Wallet, TrendingUp, 
  Landmark, ArrowRight, FileText, Layers, CheckCircle2, Square 
} from 'lucide-react';
import { Logo } from './Logo';

export const ManagerView = ({ 
  setView, 
  customer, 
  setCustomer, 
  activeProducts, 
  setActiveProducts, 
  settings, 
  setSettings, 
  totals 
}) => {
  
  const toggleProduct = (id) => {
    setActiveProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 text-white min-h-screen">
      {/* HEADER GESTIONALE */}
      <header className="flex justify-between items-center border-b border-white/10 pb-8">
        <Logo isDark={true} />
        <button 
          onClick={() => setView('client')} 
          className="bg-[#f97316] text-white px-10 py-4 rounded-2xl font-black uppercase flex items-center gap-3 shadow-2xl hover:bg-orange-600 transition-all active:scale-95"
        >
          <FileText className="w-5 h-5" /> Genera Documento Cliente
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLONNA SINISTRA: CONFIGURAZIONE COMMESSA */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[40px] border border-white/10 space-y-8 shadow-xl">
            <h2 className="text-blue-400 font-black uppercase text-xs tracking-widest italic flex items-center gap-2">
              <Calculator className="w-4 h-4"/> Engineering Panel
            </h2>
            
            <div className="space-y-6">
               {/* Nome Cliente */}
               <div className="space-y-2">
                 <label className="text-[10px] font-black opacity-40 uppercase">Ragione Sociale</label>
                 <input 
                   type="text" 
                   placeholder="Nome Azienda..." 
                   value={customer.name} 
                   onChange={e => setCustomer({...customer, name: e.target.value})} 
                   className="w-full bg-white/5 border-b-2 border-white/10 py-2 text-xl font-black outline-none focus:border-orange-500 transition-all text-white" 
                 />
               </div>
               
               {/* Toggle Outdoor/Indoor */}
               <div className="flex gap-2">
                 {['outdoor', 'indoor'].map(t => (
                   <button 
                    key={t} 
                    onClick={() => {
                      setCustomer({...customer, type: t});
                      setActiveProducts(t === 'outdoor' ? ['rm20', 'pa_plus'] : ['wall', 'air']);
                    }} 
                    className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${customer.type === t ? 'border-blue-500 bg-blue-500/10 text-white' : 'opacity-30 text-white border-white/10'}`}
                   >
                     {t}
                   </button>
                 ))}
               </div>

               {/* Input kWp o MQ */}
               <div>
                 <label className="text-[10px] font-black opacity-40 block mb-2 uppercase">
                   {customer.type === 'outdoor' ? 'Potenza Impianto (kWp)' : 'Superficie Totale (mq)'}
                 </label>
                 <input 
                   type="number" 
                   value={customer.type === 'outdoor' ? customer.kwp : customer.mq} 
                   onChange={e => setCustomer({...customer, [customer.type === 'outdoor' ? 'kwp' : 'mq']: Number(e.target.value)})} 
                   className="w-full bg-transparent border-b-2 border-orange-500 text-5xl font-black outline-none text-white" 
                 />
               </div>

               {/* Scelta Team Applicazione */}
               <div className="grid grid-cols-1 gap-2">
                 <span className="text-[10px] font-black opacity-40 uppercase">Logistica Squadra</span>
                 {['reair', 'partner'].map(l => (
                   <button 
                    key={l} 
                    onClick={() => setSettings({...settings, labor: l})} 
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${settings.labor === l ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'opacity-30 text-white border-white/10'}`}
                   >
                     <span className="text-[10px] font-black uppercase">{l === 'reair' ? 'Team ReAir (+10€/mq)' : 'Squadra Partner (Sconto)'}</span>
                     {l === 'reair' ? <HardHat className="w-4 h-4" /> : <Users2 className="w-4 h-4" />}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {/* BOX UTILE SOCIO */}
          <div className="bg-orange-500 p-8 rounded-[40px] shadow-2xl text-white">
            <span className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2"><Wallet className="w-4 h-4"/> Utile Netto Partner (50%)</span>
            <div className="text-4xl font-black mt-2 leading-none italic">
              € {totals.reduce((acc, p) => activeProducts.includes(p.id) ? acc + p.profit : acc, 0).toLocaleString(undefined, {maximumFractionDigits:0})}
            </div>
            <p className="text-[9px] mt-4 opacity-80 font-bold uppercase tracking-widest border-t border-white/20 pt-4">Calcolo al netto del 5% segnalatore</p>
          </div>
        </aside>

        {/* COLONNA DESTRA: ANALISI ECONOMICA DETTAGLIATA */}
        <main className="lg:col-span-8 space-y-8">
           <section className="bg-slate-900 p-10 rounded-[48px] border border-white/10 overflow-hidden relative shadow-xl">
             <div className="absolute top-0 right-0 p-10 opacity-5 text-white"><TrendingUp className="w-40 h-40"/></div>
             <h3 className="text-xl font-black uppercase text-blue-400 mb-8 italic flex items-center gap-4">
               <Layers className="w-6 h-6"/> Business Analytics V42.5
             </h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="opacity-40 uppercase font-black border-b border-white/5 text-white">
                   <tr>
                     <th className="pb-6">Soluzione Tecnologica</th>
                     <th className="pb-6">Incasso Cliente</th>
                     <th className="pb-6">Costi Vivi (Prodotto + Posa)</th>
                     <th className="pb-6 text-right text-orange-500">Utile Netto</th>
                   </tr>
                 </thead>
                 <tbody className="font-bold text-white">
                   {totals.filter(p => p.cat === customer.type).map(p => (
                     <tr key={p.id} className={`border-t border-white/5 transition-all ${!activeProducts.includes(p.id) ? 'opacity-10' : ''}`}>
                       <td className="py-6">
                         <button onClick={() => toggleProduct(p.id)} className="flex items-center gap-3 text-blue-400 text-left">
                           {activeProducts.includes(p.id) ? <CheckCircle2 className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-30" />}
                           {p.name}
                         </button>
                       </td>
                       <td className="py-6 text-slate-300">€ {p.clientPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                       <td className="py-6 text-slate-300">€ {(p.productCost + p.laborCost).toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                       <td className="py-6 text-right text-orange-400 text-2xl tracking-tighter italic">€ {p.profit.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </section>

           <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex justify-between items-center text-white">
             <div>
                <span className="text-[10px] font-black uppercase opacity-40 block mb-1">Fee Segnalazione</span>
                <span className="text-3xl font-black text-blue-400 italic">5.0% LORDO</span>
             </div>
             <ArrowRight className="w-8 h-8 text-white/20" />
             <div className="text-right">
                <span className="text-[10px] font-black uppercase opacity-40 block mb-1">Margine Target</span>
                <span className="text-3xl font-black text-emerald-400 italic">50.0% NETTO</span>
             </div>
           </div>
        </main>
      </div>
    </div>
  );
};
