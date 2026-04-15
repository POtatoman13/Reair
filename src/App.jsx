import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, BarChart3, Sparkles, Loader2, MessageSquare, 
  Shield, Briefcase, CheckCircle2, HardHat, Truck, Percent,
  Wind, School, Building2, Beaker, Printer, UserPlus, FileText,
  Clock, Zap, ShieldCheck, CheckSquare, Square
} from 'lucide-react';

// --- COMPONENTE LOGO REAIR ---
const LogoReAir = ({ isClientMode }) => (
  <div className="flex items-center gap-3">
    <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#8EBCD6" />
      <path d="M50 25C50 25 30 45 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 45 50 25 50 25Z" fill="white" />
      <path d="M50 80V35" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <div className="flex flex-col leading-none text-left">
      <span className={`text-xl font-black tracking-tighter ${isClientMode ? 'text-[#005A8C]' : 'text-white'}`}>
        RE<span className="font-light italic">air</span>
      </span>
      <span className={`text-[7px] font-bold uppercase tracking-[0.2em] ${isClientMode ? 'text-[#8EBCD6]' : 'text-blue-300/60'}`}>
        air-health technology
      </span>
    </div>
  </div>
);

const App = () => {
  // Chiave API fornita dall'ambiente
  const apiKey = ""; 

  // --- DATABASE PRODOTTI REAIR ---
  const PRODUCTS_DATA = [
    { 
      id: 'rm20', name: 'Clean Coating RM 20', category: 'outdoor', yield: 40, price: 399, discount: 0.30, 
      tech: 'Nanotecnologia TiO2 anatasio. Legame covalente silanico per superfici autopulenti e fotocatalisi estrema.'
    },
    { 
      id: 'pa_plus', name: 'PhotoActive Plus', category: 'outdoor', yield: 60, price: 195, discount: 0.30, 
      tech: 'Catalizzatore fotocatalitico antistatico per la prevenzione del soiling fotovoltaico industriale.'
    },
    { 
      id: 'wall', name: 'ReAir Wall Indoor', category: 'indoor', yield: 50, price: 245, discount: 0.35, 
      tech: 'Ioni d’argento + semiconduttori LED active. Efficacia sanificante certificata ISO 22196.'
    },
    { 
      id: 'air', name: 'PhotoActive Air', category: 'indoor', yield: 45, price: 280, discount: 0.30, 
      tech: 'Nanostruttura porosa per la decomposizione molecolare di inquinanti gassosi VOC e NOx.'
    }
  ];

  // --- STATI APPLICAZIONE ---
  const [inputVal, setInputVal] = useState(300);
  const [customerName, setCustomerName] = useState("");
  const [isClientMode, setIsClientMode] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('outdoor'); 
  const [activeProducts, setActiveProducts] = useState(['rm20', 'pa_plus']);
  const [cycleMonths, setCycleMonths] = useState(24);

  const SCONTO_ANTICIPO_48M = 0.15; 

  const toggleProduct = (id) => {
    setActiveProducts(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  // --- LOGICA COSTI SQUADRA ---
  const getLaborCost = (val) => {
    if (val <= 50) return 18;
    if (val <= 100) return 15;
    if (val <= 300) return 10;
    return 8;
  };

  // --- CALCOLI FINANZIARI ---
  const calcs = useMemo(() => {
    return PRODUCTS_DATA.map(p => {
      const mq = p.category === 'outdoor' ? inputVal * 6.5 : inputVal;
      const litriSingle = Math.ceil(mq / p.yield);
      const matCostSingle = litriSingle * (p.price * (1 - p.discount));
      const unitLabCost = p.category === 'outdoor' ? getLaborCost(inputVal) : 6;
      const labCostSingle = p.category === 'outdoor' ? inputVal * unitLabCost : mq * unitLabCost;
      
      const multiplier = cycleMonths === 48 ? 2 : 1;
      const matCostTotal = matCostSingle * multiplier;
      const labCostTotal = labCostSingle * multiplier;
      
      const baseFatturato = (matCostSingle + labCostSingle) / 0.53;
      let finalPrice = baseFatturato * multiplier;

      if (cycleMonths === 48) {
        finalPrice = finalPrice * (1 - SCONTO_ANTICIPO_48M);
      }

      const profit = finalPrice * 0.40;
      const comm = finalPrice * 0.07;
      const netPrice = finalPrice * 0.50; 
      
      return {
        ...p, mq, litri: litriSingle * multiplier, matCost: matCostTotal, labCost: labCostTotal, unitLabCost,
        finalPrice, netPrice, profit, comm,
        nox: (mq * 0.06 * multiplier).toFixed(1),
        trees: Math.round(mq * 0.06 * multiplier * 2.4)
      };
    });
  }, [inputVal, cycleMonths]);

  // --- AI ENGINE ---
  const generateAI = async (mode) => {
    setIsLoading(true); setAiResponse("");
    const selectedList = calcs.filter(p => activeProducts.includes(p.id));
    if (selectedList.length === 0) { 
        setAiResponse("Seleziona i prodotti prima di generare l'analisi.");
        setIsLoading(false); 
        return; 
    }

    const prompt = `Agisci come Direttore ReAir. Fornisci un ${mode} per: ${selectedList.map(p => p.name).join(", ")}. 
    Dettagli: Cliente ${customerName || 'Nuovo Partner'}, Dimensione ${inputVal} ${selectedCategory}, Protocollo ${cycleMonths} mesi. 
    REGOLE: NON usare la parola 'garanzia'. Parla di 'Protocollo di Mantenimento'. Sii breve e persuasivo.`;

    const callGemini = async (retryCount = 0) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok && retryCount < 3) {
            await new Promise(r => setTimeout(r, 1000));
            return callGemini(retryCount + 1);
        }
        const data = await response.json();
        setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "Errore AI.");
      } catch { setAiResponse("Errore di connessione."); }
      finally { setIsLoading(false); }
    };
    callGemini();
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isClientMode ? 'bg-slate-50 text-slate-900' : 'bg-[#020408] text-white'}`}>
      
      <style>{`
        @media print {
          nav, .no-print, button, footer { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-container { padding: 0 !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
          .quote-card { border: 1px solid #e2e8f0 !important; break-inside: avoid; page-break-inside: avoid; margin-bottom: 30px !important; }
          .print-header-top { display: flex !important; justify-content: space-between; align-items: center; border-bottom: 2px solid #005A8C; padding-bottom: 20px; margin-bottom: 40px; }
          .client-box { border: 1px solid #e2e8f0 !important; background: #f8fafc !important; color: black !important; }
        }
        .print-header-top { display: none; }
      `}</style>

      <div className="no-print text-white text-[9px] font-black text-center py-1 uppercase tracking-[0.4em] flex items-center justify-center gap-2 bg-[#005A8C]">
        <ShieldCheck className="w-3 h-3" /> ReAir Maintenance Manager V33.2
      </div>

      <nav className="no-print sticky top-0 z-30 border-b p-4 flex justify-between items-center bg-black/60 border-white/10 backdrop-blur-xl">
        <LogoReAir isClientMode={false} />
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-emerald-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-lg">
            <Printer className="w-4 h-4" /> PDF PREVENTIVO
          </button>
          <button onClick={() => setIsClientMode(!isClientMode)} className="bg-white text-black px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-lg transition-all active:scale-95">
            {isClientMode ? 'TORNA AL GESTIONALE' : 'VISTA CLIENTE'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 pb-20 print-container text-inherit">
        
        {/* PDF HEADER */}
        <div className="print-header-top">
           <LogoReAir isClientMode={true} />
           <div className="text-right">
             <h1 className="font-black text-2xl text-[#005A8C] uppercase m-0">Proposta Protocollo Tecnico</h1>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Data: {new Date().toLocaleDateString('it-IT')}</p>
           </div>
        </div>

        {/* CONFIGURAZIONE PARTNER */}
        <section className="no-print p-8 rounded-[40px] border bg-white/5 border-white/10 shadow-2xl space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-6 lg:col-span-1 text-white">
              <label className="text-[10px] font-black uppercase opacity-50 flex items-center gap-2 tracking-widest mb-3">
                <UserPlus className="w-4 h-4 text-blue-400"/> Ragione Sociale Cliente
              </label>
              <input 
                type="text" 
                placeholder="Nome Azienda..." 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white/10 py-3 text-xl font-black outline-none focus:border-blue-500 transition-all"
              />
              
              <div className="pt-4">
                <span className="text-[10px] font-black uppercase opacity-40 block mb-4 tracking-widest">Protocollo Attivo:</span>
                <div className="flex gap-2">
                  <button onClick={() => setCycleMonths(24)} className={`flex-1 p-3 rounded-xl border-2 font-black uppercase text-[9px] transition-all ${cycleMonths === 24 ? 'border-blue-500 bg-blue-500/20' : 'border-white/5 opacity-40'}`}>24 Mesi</button>
                  <button onClick={() => setCycleMonths(48)} className={`flex-1 p-3 rounded-xl border-2 font-black uppercase text-[9px] transition-all ${cycleMonths === 48 ? 'border-orange-500 bg-orange-500/20' : 'border-white/5 opacity-40'}`}>48 Mesi (-15%)</button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 text-white">
               <label className="text-[10px] font-black uppercase opacity-50 flex items-center gap-2 tracking-widest mb-4">
                <CheckSquare className="w-4 h-4 text-emerald-400"/> Includi nel Preventivo
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRODUCTS_DATA.map(p => (
                  <button key={p.id} onClick={() => toggleProduct(p.id)} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${activeProducts.includes(p.id) ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 opacity-30 text-slate-500'}`}>
                    <span className="text-[10px] font-black uppercase">{p.name}</span>
                    {activeProducts.includes(p.id) ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 text-white">
              <label className="text-[10px] font-black uppercase opacity-50 block tracking-widest mb-4 text-inherit">Dimensione Progetto</label>
              <div className="flex gap-2 mb-6 text-inherit">
                <button onClick={() => setSelectedCategory('outdoor')} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedCategory === 'outdoor' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-white/5 opacity-30 text-white'}`}>Outdoor (kWp)</button>
                <button onClick={() => setSelectedCategory('indoor')} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedCategory === 'indoor' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-white/5 opacity-30 text-white'}`}>Indoor (mq)</button>
              </div>
              <input 
                type="number" 
                value={inputVal} 
                onChange={(e) => setInputVal(Number(e.target.value))} 
                className="w-full bg-transparent border-b-2 border-blue-500 py-2 text-5xl font-black outline-none" 
              />
            </div>
          </div>
        </section>

        {/* BOX CLIENTE */}
        <div className={`client-box p-8 rounded-3xl border-2 border-dashed transition-all ${isClientMode ? 'border-slate-200 bg-white text-slate-900' : 'border-white/10 bg-white/5 text-white'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] font-black uppercase opacity-40 block tracking-[0.3em] mb-2 text-inherit">Documentazione per:</span>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-inherit">
                {customerName || "Gentile Cliente"}
              </h2>
            </div>
            <div className="bg-[#005A8C] text-white px-8 py-5 rounded-2xl shadow-xl">
              <span className="text-[10px] font-black uppercase opacity-60 block mb-1 tracking-widest">Protocollo</span>
              <p className="text-3xl font-black">{cycleMonths} MESI</p>
            </div>
          </div>
        </div>

        {/* AI CONSOLE */}
        <section className="no-print p-8 rounded-[40px] border-2 border-blue-500/30 bg-blue-900/10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
              <div className="text-[14px] font-black uppercase tracking-widest block">Strategia Gemini 3.1 Suite</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['pitch', 'esg', 'tech'].map(m => (
                <button key={m} onClick={() => generateAI(m)} disabled={isLoading} className="bg-[#005A8C] text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase shadow-md active:scale-95 transition-all">
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : `GENERA ${m.toUpperCase()}`}
                </button>
              ))}
            </div>
          </div>
          {aiResponse && <div className="p-8 rounded-3xl bg-black/40 border border-white/5 text-base font-medium leading-relaxed italic text-blue-50 whitespace-pre-wrap">{aiResponse}</div>}
        </section>

        {/* SCHEDE PRODOTTO */}
        <div className="grid grid-cols-1 gap-10">
          {calcs.filter(p => activeProducts.includes(p.id)).map(p => (
            <div key={p.id} className="quote-card p-10 rounded-[64px] border transition-all bg-white shadow-2xl flex flex-col lg:flex-row gap-12 items-center border-slate-100 overflow-hidden relative text-slate-900">
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-[#005A8C]">{p.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-2 tracking-widest">Nanotechnology Maintenance 2026</p>
                </div>
                <p className="text-lg font-medium leading-relaxed text-slate-600">
                  {p.tech} Il protocollo prevede un richiamo periodico ogni 24 mesi per preservare l'efficacia antibatterica e fotocatalitica certificata delle superfici.
                </p>
                <div className="flex flex-wrap gap-8 pt-4">
                  <div className="flex items-center gap-3 text-emerald-600 font-black uppercase text-[12px]"><ShieldCheck className="w-6 h-6"/> Efficacia Certificata</div>
                  <div className="flex items-center gap-3 text-blue-600 font-black uppercase text-[12px]"><TrendingUp className="w-6 h-6"/> Rendimento Asset</div>
                </div>
              </div>

              <div className="w-full lg:w-[450px] space-y-5">
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                   <span className="text-[11px] font-black uppercase opacity-50 block mb-2 tracking-[0.2em] text-slate-500 tracking-widest">Investimento Protocollo {cycleMonths} Mesi</span>
                   <span className="text-5xl font-black text-slate-900">€ {p.finalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                </div>
                <div className={`p-10 rounded-[40px] text-white shadow-2xl text-center transform hover:scale-105 transition-all bg-gradient-to-br ${p.category === 'outdoor' ? 'from-[#005A8C] to-blue-800' : 'from-emerald-600 to-teal-700'}`}>
                   <span className="text-[11px] font-black uppercase opacity-70 block mb-2 tracking-widest">Netto Reale post-fisco 50%</span>
                   <span className="text-6xl font-black">€ {p.netPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                   <p className="text-[10px] mt-4 font-bold opacity-90 uppercase tracking-tighter">
                     {cycleMonths === 48 ? 'Sconto Pagamento Anticipato Incluso' : 'Protocollo Standard'}
                   </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DASHBOARD PARTNER (No-Print) */}
        {!isClientMode && (
          <section className="no-print bg-slate-900 p-10 rounded-[64px] border border-white/10 space-y-12 shadow-2xl text-white">
            <h2 className="text-[16px] font-black uppercase text-blue-400 tracking-[0.5em] flex items-center gap-5"><Calculator className="w-8 h-8" /> Business Analytics V33.2</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="opacity-40 uppercase font-black text-white tracking-[0.3em]">
                  <tr>
                    <th className="pb-10">Prodotto</th>
                    <th className="pb-10">Materiali</th>
                    <th className="pb-10">Squadre</th>
                    <th className="pb-10 text-right">Utile Soci (40%)</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-white">
                  {calcs.map(p => (
                    <tr key={p.id} className={`border-t border-white/5 group hover:bg-white/5 transition-colors ${!activeProducts.includes(p.id) ? 'opacity-10' : ''}`}>
                      <td className="py-10 text-blue-400 font-black text-xl">{p.name}</td>
                      <td className="py-10">€ {p.matCost.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      <td className="py-10">€ {p.labCost.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      <td className="py-10 text-emerald-400 text-right text-3xl">€ {p.profit.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <footer className="no-print text-center py-20 text-[10px] font-black opacity-30 uppercase tracking-[0.8em]">
        ReAir S.R.L. | Milano Headquarters | Maintenance Protocol 2026
      </footer>
    </div>
  );
};

export default App;
