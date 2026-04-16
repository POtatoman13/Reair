import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, Sparkles, FileText,
  Zap, ShieldCheck, SearchCheck, Users2, Landmark, 
  ArrowLeft, Printer, LineChart, LayoutDashboard,
  HardHat, CheckCircle2, Square, Wallet, ArrowRight,
  TrendingDown, Coins, Info
} from 'lucide-react';

// --- CONFIGURAZIONE LOGICA DI BUSINESS (BACKEND READY) ---
const BUSINESS_LOGIC = {
  MQ_PER_KW: 5.0,
  DIVISORE_MARGINALITA: 0.45, // Copre 50% Utile Soci + 5% Segnalatore
  FEE_SEGNALATORE: 0.05,
  SCONTO_ANTICIPO_48M: 0.15,
  LOSS_PRODUCTION_STIMATED: 0.15, // 15% perdita produzione se non trattato
  ENERGY_PRICE_KWH: 0.22, // Prezzo medio energia €/kWh
  KW_ANNUAL_YIELD: 1250 // Produzione media annua per kWp in Italia
};

const PRODUCTS = [
  { id: 'rm20', name: 'RM 20 Outdoor', cat: 'outdoor', yield: 40, price: 399, disc: 0.30, tech: 'Nanotecnologia TiO2 anatasio. Vetrificazione covalente autopulente.' },
  { id: 'pa_plus', name: 'PhotoActive Plus', cat: 'outdoor', yield: 60, price: 195, disc: 0.00, tech: 'Catalizzatore antistatico fotovoltaico. Prevenzione soiling industriale.' },
  { id: 'wall', name: 'Wall Indoor', cat: 'indoor', yield: 50, price: 245, disc: 0.35, tech: 'Ioni d’argento Active. Sanificazione H24 certificata ISO 22196.' },
  { id: 'air', name: 'PhotoActive Air', cat: 'indoor', yield: 45, price: 280, disc: 0.30, tech: 'Nanostruttura porosa per decomposizione VOC e NOx indoor.' }
];

const Logo = ({ isDark }) => (
  <div className="flex items-center gap-3">
    <svg width="45" height="45" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#8EBCD6" />
      <path d="M50 25C50 25 30 45 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 45 50 25 50 25Z" fill="white" />
      <path d="M50 80V35" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 65L65 55" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 55L35 45" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <div className="flex flex-col leading-none text-left">
      <span className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#005A8C]'}`}>
        RE<span className="font-light italic text-inherit">air</span>
      </span>
      <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-blue-300/60' : 'text-slate-400'}`}>
        air-health technology
      </span>
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState('manager');
  const [customer, setCustomer] = useState({ name: "", kwp: 100, mq: 500, type: 'outdoor' });
  const [activeProducts, setActiveProducts] = useState(['rm20', 'pa_plus']);
  const [settings, setSettings] = useState({ cycle: 24, labor: 'partner' });

  // --- CALCOLI FINANZIARI E ROI ---
  const totals = useMemo(() => {
    return PRODUCTS.map(p => {
      const area = customer.type === 'outdoor' ? customer.kwp * BUSINESS_LOGIC.MQ_PER_KW : customer.mq;
      const liters = Math.ceil(area / p.yield);
      const productCost = liters * (p.price * (1 - p.disc));
      
      const cleanRate = customer.type === 'outdoor' ? (customer.kwp <= 50 ? 18 : customer.kwp <= 100 ? 15 : customer.kwp <= 300 ? 10 : 8) : 0;
      const cleanCost = customer.type === 'outdoor' ? customer.kwp * cleanRate : 0;
      
      const appRate = settings.labor === 'reair' ? 10 : (p.cat === 'outdoor' ? 0 : 6);
      const laborCost = cleanCost + (area * appRate);
      
      const multiplier = settings.cycle === 48 ? 2 : 1;
      const basicCosts = productCost + laborCost;
      
      let clientPrice = (basicCosts / BUSINESS_LOGIC.DIVISORE_MARGINALITA) * multiplier;
      if (settings.cycle === 48) clientPrice *= (1 - BUSINESS_LOGIC.SCONTO_ANTICIPO_48M);

      const grossMargin = clientPrice - (basicCosts * multiplier);
      const referralFee = clientPrice * BUSINESS_LOGIC.FEE_SEGNALATORE;

      // Logica Risparmio Cliente
      const annualEnergyValue = customer.kwp * BUSINESS_LOGIC.KW_ANNUAL_YIELD * BUSINESS_LOGIC.ENERGY_PRICE_KWH;
      const annualSavingProduction = annualEnergyValue * BUSINESS_LOGIC.LOSS_PRODUCTION_STIMATED;
      const annualSavingCleaning = cleanCost * 2; // 2 pulizie risparmiate

      return {
        ...p, area, liters, productCost: productCost * multiplier, laborCost: laborCost * multiplier,
        clientPrice, netInvestment: clientPrice * 0.50, profit: grossMargin - referralFee,
        annualSaving: annualSavingProduction + annualSavingCleaning,
        paybackMonths: Math.round(((clientPrice * 0.50) / (annualSavingProduction + annualSavingCleaning)) * 12),
        nox: (area * 0.06 * multiplier).toFixed(1),
        trees: Math.round(area * 0.06 * multiplier * 2.4)
      };
    });
  }, [customer, settings]);

  const toggleProduct = (id) => {
    setActiveProducts(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  // --- VISTA GESTIONALE ---
  const ManagerView = () => (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center border-b border-white/10 pb-8">
        <Logo isDark={true} />
        <button onClick={() => setView('preview')} className="bg-[#f97316] text-white px-10 py-4 rounded-2xl font-black uppercase flex items-center gap-3 shadow-2xl hover:bg-orange-600 transition-all active:scale-95">
          <FileText className="w-5 h-5" /> Genera Documento Cliente
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[40px] border border-white/10 space-y-8">
            <h2 className="text-blue-400 font-black uppercase text-xs tracking-widest flex items-center gap-2 italic"><Calculator className="w-4 h-4 text-inherit"/> Configurazione Commessa</h2>
            
            <div className="space-y-6">
               <input type="text" placeholder="Ragione Sociale Cliente..." value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full bg-white/5 border-b-2 border-white/10 py-2 text-xl font-black outline-none focus:border-orange-500 text-white" />
               
               <div className="flex gap-2">
                 {['outdoor', 'indoor'].map(t => (
                   <button key={t} onClick={() => {setCustomer({...customer, type: t}); setActiveProducts(t === 'outdoor' ? ['rm20', 'pa_plus'] : ['wall', 'air']);}} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${customer.type === t ? 'border-blue-500 bg-blue-500/10 text-white text-inherit' : 'opacity-30 text-white text-inherit'}`}>{t}</button>
                 ))}
               </div>

               <div>
                 <label className="text-[10px] font-black opacity-40 block mb-2 uppercase text-white">{customer.type === 'outdoor' ? 'Potenza Impianto (kWp)' : 'Superficie Totale (mq)'}</label>
                 <input type="number" value={customer.type === 'outdoor' ? customer.kwp : customer.mq} onChange={e => setCustomer({...customer, [customer.type === 'outdoor' ? 'kwp' : 'mq']: Number(e.target.value)})} className="w-full bg-transparent border-b-2 border-orange-500 text-5xl font-black outline-none text-white" />
               </div>

               <div className="grid grid-cols-1 gap-2">
                 <span className="text-[10px] font-black opacity-40 uppercase text-white">Logistica Squadra</span>
                 {['reair', 'partner'].map(l => (
                   <button key={l} onClick={() => setSettings({...settings, labor: l})} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${settings.labor === l ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'opacity-30 text-white'}`}>
                     <span className="text-[10px] font-black uppercase">{l === 'reair' ? 'Team ReAir (+10€/mq)' : 'Squadra Partner (Sconto)'}</span>
                     {l === 'reair' ? <HardHat className="w-4 h-4 text-inherit" /> : <Users2 className="w-4 h-4 text-inherit" />}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          <div className="bg-orange-500 p-8 rounded-[40px] shadow-2xl text-white">
            <span className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2"><Wallet className="w-4 h-4 text-inherit"/> Utile Netto Partner (50%)</span>
            <div className="text-4xl font-black mt-2 leading-none italic">€ {totals.reduce((acc, p) => activeProducts.includes(p.id) ? acc + p.profit : acc, 0).toLocaleString(undefined, {maximumFractionDigits:0})}</div>
            <p className="text-[9px] mt-4 opacity-80 font-bold uppercase tracking-widest border-t border-white/20 pt-4">Calcolo automatico post-segnalatore (5%)</p>
          </div>
        </aside>

        <main className="lg:col-span-8 space-y-8">
           <div className="bg-slate-900 p-10 rounded-[48px] border border-white/10 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-10 opacity-5"><TrendingUp className="w-40 h-40 text-white text-inherit"/></div>
             <h3 className="text-xl font-black uppercase text-blue-400 mb-8 italic flex items-center gap-4"><Landmark className="w-6 h-6 text-inherit"/> Business Analytics V42</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-white">
                 <thead className="opacity-40 uppercase font-black border-b border-white/5">
                   <tr><th className="pb-6">Soluzione</th><th className="pb-6">Incasso Cliente</th><th className="pb-6">Costi Vivi</th><th className="pb-6 text-right text-orange-500">Utile Soci</th></tr>
                 </thead>
                 <tbody className="font-bold">
                   {totals.filter(p => p.cat === customer.type).map(p => (
                     <tr key={p.id} className={`border-t border-white/5 transition-all ${!activeProducts.includes(p.id) ? 'opacity-10' : ''}`}>
                       <td className="py-6 text-blue-400 text-inherit text-inherit">{p.name}</td>
                       <td className="py-6">€ {p.clientPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                       <td className="py-6">€ {(p.productCost + p.laborCost).toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                       <td className="py-6 text-right text-orange-400 text-2xl tracking-tighter italic">€ {p.profit.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>

           <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex justify-between items-center text-white">
             <div>
                <span className="text-[10px] font-black uppercase opacity-40 block mb-1">Fee Segnalazione</span>
                <span className="text-3xl font-black text-blue-400 italic">5.0% LORDO</span>
             </div>
             <ArrowRight className="w-8 h-8 text-white/20 text-inherit text-inherit" />
             <div className="text-right">
                <span className="text-[10px] font-black uppercase opacity-40 block mb-1">Target Margine Soci</span>
                <span className="text-3xl font-black text-emerald-400 italic">50.0% NETTO</span>
             </div>
           </div>
        </main>
      </div>
    </div>
  );

  // --- VISTA CLIENTE (DOCUMENTO A4) ---
  const ClientView = () => (
    <div className="bg-white text-slate-900 min-h-screen font-sans">
      <nav className="no-print sticky top-0 z-50 bg-slate-950 p-4 flex justify-between items-center px-10 shadow-2xl">
        <button onClick={() => setView('manager')} className="text-white flex items-center gap-2 font-black uppercase text-xs hover:text-orange-400 transition-all text-inherit">
          <ArrowLeft className="w-4 h-4 text-inherit text-inherit" /> Torna al Gestionale
        </button>
        <button onClick={() => window.print()} className="bg-white text-slate-900 px-8 py-2.5 rounded-full font-black uppercase text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all text-inherit">
          <Printer className="w-4 h-4 text-inherit text-inherit text-inherit" /> Salva Documento PDF
        </button>
      </nav>

      <div className="print-area max-w-[210mm] mx-auto bg-white p-12 md:p-16">
        <header className="flex justify-between items-end border-b-4 border-[#005A8C] pb-10 mb-12">
          <Logo isDark={false} />
          <div className="text-right">
            <h1 className="text-3xl font-black text-[#005A8C] uppercase tracking-tighter m-0 leading-none italic">Proposta Tecnica ReAir</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-4 leading-none text-inherit">Dipartimento Soluzioni Fotovoltaiche 2026</p>
            <p className="text-sm font-black text-slate-900 mt-2 italic underline underline-offset-4 decoration-orange-500">Data: {new Date().toLocaleDateString('it-IT')}</p>
          </div>
        </header>

        <section className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-10 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5"><LineChart className="w-40 h-40 text-[#005A8C] text-inherit text-inherit"/></div>
          <div className="flex justify-between items-start mb-10">
            <div>
              <span className="text-[11px] font-black uppercase opacity-40 block mb-2 tracking-widest text-[#005A8C]">Documentazione per:</span>
              <h2 className="text-5xl font-black text-[#005A8C] uppercase tracking-tighter italic leading-none m-0">{customer.name || "Davide Salvadeo"}</h2>
            </div>
            <div className="bg-[#005A8C] text-white p-6 rounded-3xl text-center shadow-xl min-w-[180px]">
              <span className="text-[10px] font-black uppercase block opacity-60 mb-1">Durata Protocollo</span>
              <p className="text-4xl font-black italic m-0">{settings.cycle} MESI</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <span className="text-[9px] font-black text-orange-500 uppercase block mb-2 tracking-widest">Aumento Resa Annua</span>
               <p className="text-3xl font-black text-slate-900">+15% Guaranteed</p>
               <p className="text-[10px] mt-2 opacity-50 font-medium italic">Protezione attiva dal soiling ambientale.</p>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <span className="text-[9px] font-black text-blue-500 uppercase block mb-2 tracking-widest">Risparmio Manutenzione</span>
               <p className="text-3xl font-black text-slate-900">-2 Pulizie/Anno</p>
               <p className="text-[10px] mt-2 opacity-50 font-medium italic">Abbattimento costi ordinari di lavaggio.</p>
             </div>
             <div className="bg-[#f97316] p-6 rounded-3xl text-white shadow-lg">
               <span className="text-[9px] font-black uppercase block mb-2 tracking-widest opacity-80 text-inherit">Payback Stimato (ROI)</span>
               <p className="text-3xl font-black italic text-white text-inherit">~ 6 MESI</p>
               <p className="text-[10px] mt-2 opacity-80 font-medium italic text-inherit">Recupero investimento in meno di un ciclo.</p>
             </div>
          </div>
        </section>

        <div className="space-y-20">
          {totals.filter(p => activeProducts.includes(p.id)).map((p) => (
            <div key={p.id} className="quote-card-client border-t border-slate-100 pt-16 break-inside-avoid">
              <div className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="flex-1 space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                       <span className="bg-[#005A8C] text-white px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">BU Nanotechnology</span>
                       <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Official Proposal</span>
                    </div>
                    <h3 className="text-6xl font-black text-[#005A8C] uppercase tracking-tighter italic m-0 leading-none">{p.name}</h3>
                  </div>

                  <div className="bg-blue-50/50 border-l-4 border-orange-500 p-6 rounded-2xl flex items-center gap-6 shadow-sm">
                    <SearchCheck className="w-12 h-12 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-[#005A8C] uppercase tracking-tighter m-0">Sopralluogo Tecnico Annuale Incluso</p>
                      <p className="text-[11px] text-slate-500 font-medium italic m-0 mt-1 leading-relaxed">Verifica dell'efficacia fotocatalitica al 12° mese con report di performance energetica e microbiologica.</p>
                    </div>
                  </div>

                  <p className="text-xl text-slate-600 leading-relaxed text-justify font-medium">{p.tech} Il trattamento trasforma molecolarmente le superfici preservando la resa e riducendo i costi di gestione asset.</p>

                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-emerald-600 text-inherit text-inherit">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shadow-inner"><Leaf className="w-7 h-7 text-inherit" /></div>
                      <div className="flex flex-col text-inherit text-inherit"><span className="text-2xl font-black text-slate-900 leading-none text-inherit">{p.trees}</span><span className="text-[9px] font-black uppercase text-slate-400 text-inherit">Alberi Equivalenti</span></div>
                    </div>
                    <div className="flex items-center gap-4 text-blue-500 text-inherit text-inherit">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shadow-inner text-inherit"><Zap className="w-7 h-7 text-inherit" /></div>
                      <div className="flex flex-col text-inherit text-inherit"><span className="text-2xl font-black text-slate-900 leading-none text-inherit text-inherit">{p.nox}kg</span><span className="text-[9px] font-black uppercase text-slate-400 text-inherit">NOx Abbattuti</span></div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[360px] shrink-0 space-y-6">
                   <div className="bg-white border-4 border-[#005A8C] p-8 rounded-[48px] shadow-2xl relative overflow-hidden text-center text-inherit text-inherit">
                     <div className="absolute top-0 right-0 p-4 opacity-5 text-inherit"><Calculator className="w-24 h-24 text-[#005A8C] text-inherit"/></div>
                     <div className="space-y-6 text-inherit text-inherit">
                        <div className="text-inherit">
                          <span className="text-[11px] font-black uppercase opacity-40 block mb-1 tracking-widest text-slate-500 text-inherit">Valore Protocollo ReAir</span>
                          <span className="text-4xl font-black text-[#005A8C] italic text-inherit leading-none">€ {p.clientPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex justify-between items-center text-inherit text-inherit">
                          <span className="text-[9px] font-black text-slate-400 uppercase text-inherit text-inherit text-inherit">Agevolazione Fiscale d'Impresa</span>
                          <span className="text-xl font-black text-emerald-600 text-inherit">- 50%</span>
                        </div>
                        <div className="bg-[#f97316] p-8 rounded-[36px] text-white shadow-xl transform hover:scale-105 transition-all text-inherit text-inherit text-inherit text-inherit">
                           <span className="text-[11px] font-black uppercase opacity-80 block mb-2 text-inherit text-inherit">Investimento Netto Reale</span>
                           <span className="text-5xl font-black leading-none italic text-white text-inherit">€ {p.netPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                           <p className="text-[9px] font-bold mt-4 uppercase tracking-widest border-t border-white/20 pt-4 text-white text-inherit">Recupero totale garantito dal ROI</p>
                        </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-3 px-4 text-slate-400 italic text-inherit">
                     <ShieldCheck className="w-5 h-5 text-emerald-500 text-inherit text-inherit" />
                     <p className="text-[10px] font-bold uppercase tracking-tight text-inherit">Proposta conforme parametri ESG 2026.</p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-24 border-t-2 border-slate-100 pt-10 text-center text-inherit">
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 text-inherit">ReAir S.R.L. | Nanotechnology Headquarters | Milano</p>
        </footer>
      </div>
    </div>
  );

  return (
    <div className="font-sans antialiased text-inherit text-inherit">
      {view === 'manager' ? <ManagerView /> : <ClientView />}
    </div>
  );
};

export default App;
