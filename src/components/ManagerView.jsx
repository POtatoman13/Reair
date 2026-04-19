import React from 'react';
import { CheckCircle2, Square, Calculator, Wallet, Layers, FileText, HardHat, Users } from 'lucide-react';

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
    if (activeProducts.includes(id)) {
      setActiveProducts(activeProducts.filter(pId => pId !== id));
    } else {
      setActiveProducts([...activeProducts, id]);
    }
  };

  // Calcolo utile netto partner basato sui prodotti selezionati
  const partnerProfit = totals
    .filter(p => activeProducts.includes(p.id) && p.cat === customer.type)
    .reduce((sum, p) => sum + p.profit, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-4 md:p-8 font-sans pb-32">
      {/* Header e Pulsante Genera Documento */}
      <div className="max-w-md mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">R</div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">REair</h1>
            <p className="text-xs text-blue-400 font-bold tracking-widest uppercase">Air-Health Technology</p>
          </div>
        </div>
        
        <button 
          onClick={() => setView('client')}
          className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
        >
          <FileText className="w-4 h-4" />
          GENERA DOC
        </button>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        
        {/* Pannello Controlli */}
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-blue-400 mb-6 uppercase font-black text-xs tracking-widest">
            <Calculator className="w-4 h-4" />
            <h2>Engineering Panel</h2>
          </div>

          {/* RAGIONE SOCIALE (IL COLLEGAMENTO È STATO CORRETTO QUI) */}
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Ragione Sociale</label>
            <input 
              type="text" 
              placeholder="Inserisci qui il nome cliente..."
              value={customer.name} 
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })} 
              className="w-full bg-white/5 border-b-2 border-white/10 py-3 px-3 text-xl font-black outline-none focus:border-orange-500 transition-all text-white placeholder:text-slate-700 rounded-t-lg" 
            />
          </div>

          {/* OUTDOOR / INDOOR */}
          <div className="flex gap-2 mb-6 bg-slate-950 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setCustomer({...customer, type: 'outdoor'})}
              className={`flex-1 py-3 rounded-lg font-black text-sm transition-all ${customer.type === 'outdoor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}
            >
              OUTDOOR
            </button>
            <button 
              onClick={() => setCustomer({...customer, type: 'indoor'})}
              className={`flex-1 py-3 rounded-lg font-black text-sm transition-all ${customer.type === 'indoor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}
            >
              INDOOR
            </button>
          </div>

          {/* POTENZA IMPIANTO */}
          <div className="mb-8">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Potenza Impianto (kWp)</label>
            <input 
              type="number" 
              value={customer.kwp || ''} 
              onChange={e => setCustomer({...customer, kwp: Number(e.target.value)})}
              className="w-full bg-transparent border-b-2 border-orange-500/50 focus:border-orange-500 py-2 text-5xl font-black outline-none transition-all text-white" 
            />
          </div>

          {/* SQUADRA */}
          <div className="flex gap-2">
            <button 
              onClick={() => setSettings({...settings, labor: 'reair'})}
              className={`flex-1 py-4 px-2 rounded-2xl border-2 flex items-center justify-between transition-all ${settings.labor === 'reair' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-white/5 text-slate-500 hover:border-white/20'}`}
            >
              <span className="font-bold text-xs">TEAM REAIR</span>
              <HardHat className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSettings({...settings, labor: 'partner'})}
              className={`flex-1 py-4 px-2 rounded-2xl border-2 flex items-center justify-between transition-all ${settings.labor === 'partner' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 text-slate-500 hover:border-white/20'}`}
            >
              <span className="font-bold text-xs">SQUADRA PARTNER</span>
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* UTILE NETTO */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 shadow-xl shadow-orange-500/20 text-white transform transition-all hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Wallet className="w-5 h-5" />
            <h3 className="font-black text-sm uppercase tracking-wider">Utile Netto Partner (50%)</h3>
          </div>
          <p className="text-5xl font-black tracking-tighter italic">
            € {partnerProfit.toLocaleString(undefined, {maximumFractionDigits:0})}
          </p>
        </div>

        {/* TABELLA PRODOTTI INTERATTIVA */}
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center gap-2 text-blue-400 mb-2 uppercase font-black text-xs tracking-widest relative z-10">
            <Layers className="w-4 h-4" />
            <h2>Business Analytics</h2>
          </div>

          <div className="overflow-x-auto mt-6 relative z-10">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="opacity-40 uppercase font-black border-b border-white/10 text-white">
                <tr>
                  <th className="pb-4 pl-4">Soluzione</th>
                  <th className="pb-4">Incasso</th>
                  <th className="pb-4 text-right pr-4 text-orange-500">Utile</th>
                </tr>
              </thead>
              <tbody className="font-bold text-white">
                {totals.filter(p => p.cat === customer.type).map(p => {
                  const isActive = activeProducts.includes(p.id);
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => toggleProduct(p.id)}
                      className={`cursor-pointer transition-all border-b border-white/5 hover:bg-white/5 ${
                        isActive 
                          ? 'bg-blue-900/30 border-l-4 border-l-blue-500' 
                          : 'opacity-50 grayscale'
                      }`}
                    >
                      <td className="py-5 pl-4">
                        <div className="flex items-center gap-3 text-left">
                          <div className={`p-1 rounded-md transition-all ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white/10 text-slate-500'}`}>
                            {isActive ? <CheckCircle2 className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </div>
                          <span className={`text-md font-black leading-tight ${isActive ? 'text-blue-300' : 'text-slate-400'}`}>
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 text-slate-300 whitespace-nowrap">
                        € {p.clientPrice.toLocaleString(undefined, {maximumFractionDigits:0})}
                      </td>
                      <td className={`py-5 text-right text-xl tracking-tighter italic pr-4 whitespace-nowrap ${isActive ? 'text-orange-400' : 'text-slate-500'}`}>
                        € {p.profit.toLocaleString(undefined, {maximumFractionDigits:0})}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
