// src/components/ClientView.jsx
import React from 'react';
import { 
  ArrowLeft, Printer, LineChart, SearchCheck, 
  Leaf, Zap, ShieldCheck, Calculator 
} from 'lucide-react';
import { Logo } from './Logo.jsx';

export const ClientView = ({ setView, customer, settings, setSettings, totals, activeProducts }) => {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans animate-in slide-in-from-right duration-700">
      {/* BARRA DI NAVIGAZIONE (Nascosta in Stampa) */}
      <nav className="no-print sticky top-0 z-50 bg-slate-950 p-4 flex justify-between items-center px-10 shadow-2xl">
        <button 
          onClick={() => setView('manager')} 
          className="text-white flex items-center gap-2 font-black uppercase text-xs hover:text-orange-400 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Torna alla Gestione
        </button>
        <div className="flex gap-4">
           <button 
            onClick={() => setSettings({...settings, cycle: settings.cycle === 24 ? 48 : 24})} 
            className="bg-white/10 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase border border-white/20"
           >
             Protocollo: {settings.cycle} Mesi
           </button>
           <button 
            onClick={handlePrint} 
            className="bg-white text-slate-900 px-8 py-2.5 rounded-full font-black uppercase text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all"
           >
             <Printer className="w-4 h-4" /> Salva Documento PDF
           </button>
        </div>
      </nav>

      {/* AREA DOCUMENTO (OTTIMIZZATA A4) */}
      <div className="print-area max-w-[210mm] mx-auto bg-white p-12 md:p-16">
        
        {/* HEADER DOCUMENTALE */}
        <header className="flex justify-between items-end border-b-4 border-[#005A8C] pb-10 mb-12">
          <Logo isDark={false} />
          <div className="text-right">
            <h1 className="text-3xl font-black text-[#005A8C] uppercase tracking-tighter m-0 leading-none italic">Proposta Tecnica ReAir</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-4 leading-none">Nanotechnology Excellence 2026</p>
            <p className="text-sm font-black text-slate-900 mt-2 underline underline-offset-4 decoration-orange-500 italic">
              Rif: {customer.name || 'D. Salvadeo'} | Data: {new Date().toLocaleDateString('it-IT')}
            </p>
          </div>
        </header>

        {/* SEZIONE ANALISI STRATEGICA ROI */}
        <section className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-10 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <LineChart className="w-40 h-40 text-[#005A8C]"/>
          </div>
          <div className="flex justify-between items-start mb-10">
            <div>
              <span className="text-[11px] font-black uppercase opacity-40 block mb-2 tracking-widest text-[#005A8C]">Analisi Strategica ROI</span>
              <h2 className="text-5xl font-black text-[#005A8C] uppercase tracking-tighter italic leading-none m-0">Performance & Risparmio</h2>
            </div>
            <div className="bg-[#005A8C] text-white p-6 rounded-3xl text-center shadow-xl min-w-[180px]">
              <span className="text-[10px] font-black uppercase block opacity-60 mb-1 text-inherit">Durata Protocollo</span>
              <p className="text-4xl font-black italic m-0 text-inherit">{settings.cycle} MESI</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <span className="text-[9px] font-black text-orange-500 uppercase block mb-2 tracking-widest">Aumento Resa Annua</span>
               <p className="text-3xl font-black text-slate-900 leading-tight">+15% Guaranteed</p>
               <p className="text-[10px] mt-2 opacity-50 font-medium italic text-slate-500">Protezione attiva dal soiling ambientale.</p>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <span className="text-[9px] font-black text-blue-500 uppercase block mb-2 tracking-widest">Risparmio Manutenzione</span>
               <p className="text-3xl font-black text-slate-900 leading-tight">-2 Pulizie/Anno</p>
               <p className="text-[10px] mt-2 opacity-50 font-medium italic text-slate-500">Abbattimento costi ordinari di lavaggio.</p>
             </div>
             <div className="bg-[#f97316] p-6 rounded-3xl text-white shadow-lg">
               <span className="text-[9px] font-black uppercase block mb-2 tracking-widest opacity-80 text-inherit">Payback Stimato (ROI)</span>
               <p className="text-3xl font-black italic text-white text-inherit">~ 6 MESI</p>
               <p className="text-[10px] mt-2 opacity-80 font-medium italic text-inherit text-inherit">Recupero investimento in meno di un ciclo.</p>
             </div>
          </div>
        </section>

        {/* SCHEDE PRODOTTO DETTAGLIATE */}
        <div className="space-y-20">
          {totals.filter(p => activeProducts.includes(p.id)).map((p) => (
            <div key={p.id} className="quote-card-client border-t border-slate-100 pt-16 break-inside-avoid">
              <div className="flex flex-col lg:flex-row gap-16 items-start">
                
                {/* DESCRIZIONE TECNICA */}
                <div className="flex-1 space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                       <span className="bg-[#005A8C] text-white px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">BU Nanotechnology</span>
                       <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Protocollo Certificato</span>
                    </div>
                    <h3 className="text-6xl font-black text-[#005A8C] uppercase tracking-tighter italic m-0 leading-none">{p.name}</h3>
                  </div>

                  <div className="bg-blue-50/50 border-l-4 border-orange-500 p-6 rounded-2xl flex items-center gap-6 shadow-sm">
                    <SearchCheck className="w-12 h-12 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-[#005A8C] uppercase tracking-tighter m-0 text-inherit">Sopralluogo Tecnico Annuo Incluso</p>
                      <p className="text-[11px] text-slate-500 font-medium italic m-0 mt-1 leading-relaxed">Verifica dell'efficacia fotocatalitica al 12° mese con report di performance energetica e microbiologica.</p>
                    </div>
                  </div>

                  <p className="text-xl text-slate-600 leading-relaxed text-justify font-medium">
                    {p.tech} Il trattamento trasforma molecolarmente le superfici preservando la resa e riducendo drasticamente i costi di gestione asset.
                  </p>

                  {/* IMPATTO ESG */}
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-emerald-600">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shadow-inner">
                        <Leaf className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-900 leading-none">{p.trees}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400">Alberi Equivalenti</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-blue-500">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shadow-inner">
                        <Zap className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-900 leading-none">{p.nox}kg</span>
                        <span className="text-[9px] font-black uppercase text-slate-400">NOx Abbattuti</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOX FINANZIARIO */}
                <div className="w-full lg:w-[360px] shrink-0 space-y-6">
                   <div className="bg-white border-4 border-[#005A8C] p-8 rounded-[48px] shadow-2xl relative overflow-hidden text-center">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Calculator className="w-24 h-24 text-[#005A8C]"/>
                     </div>
                     <div className="space-y-6">
                        <div>
                          <span className="text-[11px] font-black uppercase opacity-40 block mb-1 tracking-widest text-slate-500">Valore Protocollo ReAir</span>
                          <span className="text-4xl font-black text-[#005A8C] italic leading-none">
                            € {p.clientPrice.toLocaleString(undefined, {maximumFractionDigits:0})}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Detrazione d'Impresa</span>
                          <span className="text-xl font-black text-emerald-600">- 50%</span>
                        </div>
                        <div className="bg-[#f97316] p-8 rounded-[36px] text-white shadow-xl transform hover:scale-105 transition-all">
                           <span className="text-[11px] font-black uppercase opacity-80 block mb-2">Investimento Netto Reale</span>
                           <span className="text-5xl font-black leading-none italic text-white">
                             € {p.netPrice.toLocaleString(undefined, {maximumFractionDigits:0})}
                           </span>
                           <p className="text-[9px] font-bold mt-4 uppercase tracking-widest border-t border-white/20 pt-4 text-white">
                             Recupero totale garantito dal ROI
                           </p>
                        </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-3 px-4 text-slate-400 italic">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" />
                     <p className="text-[10px] font-bold uppercase tracking-tight">Certificazione ESG & Efficientamento Energetico 2026.</p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER DOCUMENTO */}
        <footer className="mt-24 border-t-2 border-slate-100 pt-10 text-center">
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4">
             ReAir S.R.L. | Nanotechnology Headquarters | Milano
           </p>
        </footer>
      </div>
    </div>
  );
};
