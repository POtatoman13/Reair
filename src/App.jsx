import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, BarChart3, Sparkles, Loader2, MessageSquare, 
  Shield, Briefcase, CheckCircle2, HardHat, Truck, Percent,
  Wind, School, Building2, Beaker, Printer, UserPlus, FileText
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
  const apiKey = "AIzaSyAhI3gdRivymDaxiSM-jdqyuyx-g4_6GF8"; // Injected at runtime

  // Database Prodotti Completo
  const PRODUCTS_DATA = [
    { 
      id: 'rm20', name: 'Clean Coating RM 20', type: 'kwp', yield: 40, price: 399, discount: 0.30, 
      tech: 'Nanotecnologia al Biossido di Titanio (TiO2) anatasio puro. Legame covalente silanico. Fotocatalisi estrema.'
    },
    { 
      id: 'pa_plus', name: 'PhotoActive Plus', type: 'kwp', yield: 60, price: 195, discount: 0.30, 
      tech: 'Catalizzatore fotocatalitico con additivi antistatici per la prevenzione del soiling su moduli fotovoltaici.'
    },
    { 
      id: 'wall', name: 'ReAir Wall Indoor', type: 'mq', yield: 50, price: 245, discount: 0.35, 
      tech: 'Ioni d’argento + semiconduttori drogati per attività con luce LED. Battericida e virucida ISO 22196.'
    },
    { 
      id: 'air', name: 'PhotoActive Air', type: 'mq', yield: 45, price: 280, discount: 0.30, 
      tech: 'Rivestimento nanostrutturato ad alta porosità per l\'assorbimento e la decomposizione di inquinanti gassosi (VOC, NOx).'
    }
  ];

  const [inputVal, setInputVal] = useState(300);
  const [customerName, setCustomerName] = useState("");
  const [isClientMode, setIsClientMode] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('outdoor'); 

  // Calcolo dinamico costi squadra (18€ -> 8€ per kW)
  const getLaborCost = (val) => {
    if (val <= 50) return 18;
    if (val <= 100) return 15;
    if (val <= 300) return 10;
    return 8;
  };

  const calcs = useMemo(() => {
    return PRODUCTS_DATA.map(p => {
      const mq = p.type === 'kwp' ? inputVal * 6.5 : inputVal;
      const litri = Math.ceil(mq / p.yield);
      const matCost = litri * (p.price * (1 - p.discount));
      const unitLabCost = p.type === 'kwp' ? getLaborCost(inputVal) : 6;
      const labCostTotal = p.type === 'kwp' ? inputVal * unitLabCost : mq * unitLabCost;
      const totalCost = matCost + labCostTotal;
      const finalPrice = totalCost / 0.53; // Margine 40% + 7% Agente
      
      return {
        ...p,
        mq,
        litri,
        matCost,
        labCost: labCostTotal,
        unitLabCost,
        finalPrice,
        netPrice: finalPrice * 0.50,
        profit: finalPrice * 0.40,
        comm: finalPrice * 0.07,
        nox: (mq * 0.06).toFixed(1),
        trees: Math.round(mq * 0.06 * 2.4)
      };
    });
  }, [inputVal]);

  const generateAI = async (mode) => {
    setIsLoading(true);
    setAiResponse("");

    const instruction = mode === 'pitch' 
      ? "Genera un pitch commerciale breve e persuasivo (3 righe max)"
      : mode === 'esg' 
        ? "Genera un report sull'impatto ambientale ESG con dati su NOx e alberi"
        : "Fornisci una spiegazione scientifica della composizione molecolare e dei benefici tecnici";

    const prompt = `Agisci come Direttore ReAir. ${instruction} per TUTTI i 4 prodotti ReAir in ordine sequenziale (1. RM 20, 2. PA Plus, 3. Wall Indoor, 4. PA Air). 
    Ragione Sociale Cliente: ${customerName || 'Nuovo Partner'}. 
    Dimensioni progetto: ${inputVal} ${selectedCategory === 'outdoor' ? 'kWp' : 'mq'}. 
    Rispondi in Italiano con un tono professionale ed innovativo.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiResponse(text || "Errore nella generazione AI.");
    } catch (err) {
      setAiResponse("Errore di connessione all'AI. Inserire chiave API valida.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isClientMode ? 'bg-slate-50 text-slate-900' : 'bg-[#020408] text-white'}`}>
      
      {/* STYLE PER ESPORTAZIONE PDF PROFESSIONALE */}
      <style>{`
        @media print {
          nav, .no-print, button, footer { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-container { padding: 0 !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
          .quote-card { border: 1px solid #e2e8f0 !important; break-inside: avoid; page-break-inside: avoid; margin-bottom: 20px !important; box-shadow: none !important; }
          .print-header-top { display: flex !important; justify-content: space-between; align-items: center; border-bottom: 2px solid #005A8C; padding-bottom: 15px; margin-bottom: 30px; }
          .client-header { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; color: black !important; }
        }
        .print-header-top { display: none; }
      `}</style>

      {/* STATUS BAR APP */}
      <div className="no-print text-white text-[9px] font-black text-center py-1 uppercase tracking-[0.4em] flex items-center justify-center gap-2 bg-indigo-600">
        <CheckCircle2 className="w-3 h-3" /> 
        ReAir Quote Engine v30.1 - Esportazione Preventivo PDF
      </div>

      <nav className="no-print sticky top-0 z-30 border-b p-4 flex justify-between items-center bg-black/60 border-white/10 backdrop-blur-xl">
        <LogoReAir isClientMode={false} />
        <div className="flex gap-2">
          <button onClick={handlePrint} className="bg-emerald-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-lg hover:bg-emerald-700 transition-colors">
            <Printer className="w-3 h-3" /> Esporta PDF
          </button>
          <button onClick={() => setIsClientMode(!isClientMode)} className="bg-white text-black px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all shadow-lg active:scale-95">
            {isClientMode ? 'AREA PARTNER' : 'VISTA CLIENTE'}
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 pb-20 print-container">
        
        {/* HEADER PDF PROFESSIONALE (Solo Stampa) */}
        <div className="print-header-top">
           <LogoReAir isClientMode={true} />
           <div className="text-right">
             <h1 className="font-black text-2xl text-[#005A8C] uppercase m-0">Proposta di Efficientamento</h1>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Documento Tecnico ReAir 2026</p>
             <p className="text-[10px] font-bold text-slate-400">Data: {new Date().toLocaleDateString('it-IT')}</p>
           </div>
        </div>

        {/* PANNELLO CONFIGURAZIONE (Partner Only) */}
        <section className="no-print p-8 rounded-[32px] border bg-white/5 border-white/10 shadow-2xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase opacity-50 flex items-center gap-2 tracking-widest">
                <UserPlus className="w-4 h-4 text-blue-400"/> Ragione Sociale / Cliente
              </label>
              <input 
                type="text" 
                placeholder="Inserire Nome Azienda..." 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white/20 py-2 text-2xl font-black outline-none focus:border-blue-500 transition-all text-white"
              />
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={() => setSelectedCategory('outdoor')} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedCategory === 'outdoor' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-white/5 opacity-30'}`}>Outdoor (kWp)</button>
                <button onClick={() => setSelectedCategory('indoor')} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedCategory === 'indoor' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-white/5 opacity-30'}`}>Indoor (mq)</button>
              </div>
              <input 
                type="number" 
                value={inputVal} 
                onChange={(e) => setInputVal(Number(e.target.value))} 
                className="w-full bg-transparent border-b-2 border-blue-500 py-2 text-5xl font-black outline-none text-white" 
              />
            </div>
          </div>
        </section>

        {/* INTESTAZIONE CLIENTE (Sempre visibile) */}
        <div className={`client-header p-8 rounded-3xl border-2 border-dashed transition-all ${isClientMode ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/5'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase opacity-40 block tracking-[0.3em] mb-2 text-inherit">Destinatario della Proposta</span>
              <h2 className={`text-3xl font-black uppercase tracking-tighter ${isClientMode ? 'text-[#005A8C]' : 'text-white'}`}>
                {customerName || "Spettabile Cliente"}
              </h2>
            </div>
            <div className="md:text-right">
              <span className="text-[10px] font-black uppercase opacity-40 block tracking-[0.3em] mb-2 text-inherit">Tecnologia Selezionata</span>
              <p className="font-black uppercase text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {selectedCategory === 'outdoor' ? 'Efficiency & ESG' : 'Health & Pure Air'}
              </p>
            </div>
          </div>
        </div>

        {/* AI SUITE - SEQUENZIALE (Nascosto in stampa) */}
        <section className="no-print p-8 rounded-[40px] border-2 border-blue-500/30 bg-blue-900/10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg"><Sparkles className="w-5 h-5 text-white" /></div>
              <div>
                <span className="text-[12px] font-black uppercase tracking-widest block text-white">Gemini 3.1 Strategy Console</span>
                <span className="text-[10px] opacity-60 uppercase font-bold text-blue-200 italic">Analisi sequenziale 4 prodotti ReAir</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['pitch', 'esg', 'tech'].map(m => (
                <button key={m} onClick={() => generateAI(m)} disabled={isLoading} className="bg-[#005A8C] text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase shadow-md active:scale-95 transition-all">
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : `Genera ${m.toUpperCase()}`}
                </button>
              ))}
            </div>
          </div>
          {aiResponse && (
            <div className="p-8 rounded-3xl bg-black/40 border border-white/5 text-base font-medium leading-relaxed italic text-blue-50 animate-in fade-in slide-in-from-top-4">
              <div className="whitespace-pre-wrap prose prose-invert max-w-none">{aiResponse}</div>
            </div>
          )}
        </section>

        {/* GRIGLIA PROPOSTE TECNICHE PER PREVENTIVO */}
        <div className="grid grid-cols-1 gap-8">
          {calcs.filter(p => selectedCategory === 'outdoor' ? p.type === 'kwp' : p.type === 'mq').map(p => (
            <div key={p.id} className="quote-card p-10 rounded-[56px] border transition-all bg-white shadow-2xl flex flex-col lg:flex-row gap-10 items-center border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-[#005A8C]">{p.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Protocollo Molecolare Certificato 2026</p>
                </div>
                <p className="text-base font-medium leading-relaxed text-slate-600">
                  {p.tech} Questo trattamento crea una superficie bio-attiva che garantisce una protezione costante h24. Riduce i costi operativi del {selectedCategory === 'outdoor' ? '15%' : '30%'} e assicura una durabilità certificata per {p.id === 'rm20' ? '8 anni' : '4 anni'}.
                </p>
                <div className="flex flex-wrap gap-8 pt-4">
                  <div className="flex items-center gap-3 text-emerald-600 font-black uppercase text-[12px]">
                    <Leaf className="w-5 h-5"/> {p.trees} Alberi Equivalenti
                  </div>
                  <div className="flex items-center gap-3 text-blue-600 font-black uppercase text-[12px]">
                    {selectedCategory === 'outdoor' ? <TrendingUp className="w-5 h-5"/> : <Wind className="w-5 h-5"/>}
                    {selectedCategory === 'outdoor' ? '+15% Resa Energetica' : '99.9% Purezza Aria'}
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-96 space-y-4">
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                   <span className="text-[10px] font-black uppercase opacity-50 block mb-1 tracking-widest text-slate-500">Valore Progetto Chiavi in Mano</span>
                   <span className="text-4xl font-black text-slate-900">€ {p.finalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                </div>
                <div className={`p-8 rounded-[36px] text-white shadow-2xl text-center transform hover:scale-105 transition-all bg-gradient-to-br ${selectedCategory === 'outdoor' ? 'from-[#005A8C] to-blue-800' : 'from-emerald-600 to-teal-700'}`}>
                   <span className="text-[10px] font-black uppercase opacity-70 block mb-2 tracking-widest">Investimento Netto Reale</span>
                   <span className="text-5xl font-black">€ {p.netPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                   <p className="text-[10px] mt-3 font-bold opacity-80 uppercase tracking-tighter">Inclusa Detrazione Fiscale 50%</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BUSINESS DASHBOARD (Partner Only - Nascosta in stampa) */}
        {!isClientMode && (
          <section className="no-print bg-slate-900 p-10 rounded-[64px] border border-white/10 space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#005A8C]/10 blur-[120px] -z-10"></div>
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h2 className="text-[14px] font-black uppercase text-blue-400 tracking-[0.5em] flex items-center gap-4"><Calculator className="w-6 h-6" /> Partner Insight Manager</h2>
              <div className="text-right">
                <span className="text-[10px] font-black opacity-30 uppercase block text-white">Provvigione Protetta</span>
                <span className="text-xl font-black text-orange-400">7.0% Net</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="opacity-40 uppercase font-black tracking-[0.2em] text-white">
                  <tr>
                    <th className="pb-8">Soluzione</th>
                    <th className="pb-8">Prodotti ReAir</th>
                    <th className="pb-8">Costo Squadra</th>
                    <th className="pb-8">Fee Agente</th>
                    <th className="pb-8 text-right">Profitto Soci (40%)</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-white">
                  {calcs.map(p => (
                    <tr key={p.id} className="border-t border-white/5 group hover:bg-white/5 transition-colors">
                      <td className="py-8 text-blue-400 font-black text-lg">{p.name}</td>
                      <td className="py-8">€ {p.matCost.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="opacity-30 ml-2 font-normal text-xs">({p.litri}L)</span></td>
                      <td className="py-8">€ {p.labCost.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="opacity-30 ml-2 font-normal text-xs">(@ {p.unitLabCost}€)</span></td>
                      <td className="py-8 text-orange-400">€ {p.comm.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      <td className="py-8 text-emerald-400 text-right text-2xl">€ {p.profit.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <footer className="no-print text-center py-20 text-[10px] font-black opacity-30 uppercase tracking-[0.8em] border-t border-current border-opacity-5">
        ReAir S.R.L. | Milano Corporate Headquarters | Nanotechnology Division | 2026
      </footer>
    </div>
  );
};

export default App;
