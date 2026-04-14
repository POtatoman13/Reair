import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, Sun, Sparkles, Loader2, 
  MessageSquare, Shield, Clock, Briefcase, Eye, EyeOff, Compass, RefreshCw,
  Truck, HardHat, Percent, Wallet, BarChart3, CheckCircle2, AlertTriangle, ChevronRight
} from 'lucide-react';

// --- COMPONENTE LOGO REAIR (Design Vettoriale) ---
const LogoReAir = ({ isClientMode }) => (
  <div className="flex items-center gap-3">
    <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#8EBCD6" />
      <path d="M50 25C50 25 30 45 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 45 50 25 50 25Z" fill="white" />
      <path d="M50 80V35" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 65L65 55" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 55L35 45" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <div className="flex flex-col leading-none">
      <span className={`text-2xl font-black tracking-tighter ${isClientMode ? 'text-[#005A8C]' : 'text-white'}`}>
        RE<span className="font-light italic">air</span>
      </span>
      <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${isClientMode ? 'text-[#8EBCD6]' : 'text-blue-300/60'}`}>
        air-health technology
      </span>
    </div>
  </div>
);

const App = () => {
  // --- CONFIGURAZIONE GEMINI API ---
  const apiKey = "AIzaSyBhaSB7be2AZmzk-EjjzRaH4VDUZd5V3So"; 

  // --- PARAMETRI BUSINESS AGGIORNATI ---
  const MQ_PER_KW = 6.5; 
  const COSTO_POSA_MQ = 10; 
  const CICLO_PROTEZIONE_MESI = 24;   
  const AGENTE_PERC = 0.07; 

  const PRODUCTS = {
    rm20: { id: 'rm20', name: 'Clean Coating RM 20', listPrice: 399, yield_mq_l: 40, sconto: 0.30, label: 'Protezione Covalente' },
    pa_plus: { id: 'pa_plus', name: 'PhotoActive Plus', listPrice: 195, yield_mq_l: 60, sconto: 0.30, label: 'ESG & Autopulizia' }
  };

  const [kwp, setKwp] = useState(300);
  const [selectedProductId, setSelectedProductId] = useState('rm20');
  const [bonusFirma, setBonusFirma] = useState(true);
  const [bonusFedeltaAttivo, setBonusFedeltaAttivo] = useState(false);
  const [isClientMode, setIsClientMode] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- CALCOLI FINANZIARI ---
  const calcs = useMemo(() => {
    const p = PRODUCTS[selectedProductId];
    const mqTotali = kwp * MQ_PER_KW;
    const litri = Math.ceil(mqTotali / p.yield_mq_l);
    
    // Uscite: Sconto 30% sui prodotti + 10€/mq per la squadra
    const costoProdottoNetto = litri * (p.listPrice * (1 - p.sconto));
    const costoPosaTotale = mqTotali * COSTO_POSA_MQ;
    const costiVivi = costoProdottoNetto + costoPosaTotale;
    
    // Fatturato: calcolato per garantire il 40% netto ai soci e il 7% all'agente (Divisore 0.53)
    const prezzoScontato = costiVivi / 0.53;
    const provvigioneValore = prezzoScontato * AGENTE_PERC;
    const utileTotale = prezzoScontato - costiVivi - provvigioneValore;
    
    const scontoFirmaPerc = bonusFirma ? 0.05 : 0;
    const scontoFedeltaPerc = bonusFedeltaAttivo ? 0.02 : 0;
    const prezzoPieno = prezzoScontato / (1 - (scontoFirmaPerc + scontoFedeltaPerc));

    return {
      mq: mqTotali,
      litri: litri,
      costoProdotto: costoProdottoNetto,
      costoPosa: costoPosaTotale,
      provvigione: provvigioneValore,
      costiTotali: costiVivi + provvigioneValore,
      prezzo: prezzoScontato,
      prezzoPieno: prezzoPieno,
      utile: utileTotale,
      utileSocio: utileTotale / 2,
      nettoAlCliente: prezzoScontato * 0.50,
      nox: (kwp * 0.388).toFixed(1),
      alberi: Math.round(kwp * 0.388 * 2.4),
      scontoApplicato: ((1 - (prezzoScontato / prezzoPieno)) * 100).toFixed(0)
    };
  }, [kwp, selectedProductId, bonusFirma, bonusFedeltaAttivo]);

  // --- AI ENGINE CON FALLBACK ---
  const generateAI = async (type) => {
    setIsAiLoading(true); setAiContent("");
    
    const promptText = type === 'pitch' 
      ? `Direttore ReAir. Pitch rapido per impianto ${kwp}kWp. Prezzo netto reale: €${calcs.nettoAlCliente.toLocaleString()}. Recupero in 12 mesi. Protezione 24 mesi.`
      : `Dati ESG: ${calcs.nox}kg NOx abbattuti e ${calcs.alberi} alberi equivalenti grazie a ReAir.`;

    const models = ["gemini-3.1-pro-preview", "gemini-3.1-flash", "gemini-1.5-pro"];
    let success = false;

    if (apiKey && apiKey.length > 5) {
      for (const model of models) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
          });
          const data = await response.json();
          if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            setAiContent(data.candidates[0].content.parts[0].text);
            success = true;
            break;
          }
        } catch (e) { /* Fallback */ }
      }
    }

    if (!success) {
      if (type === 'pitch') {
        setAiContent(`Proposta ReAir per ${kwp}kWp: Ottimizzazione garantita con rientro dell'investimento in soli 12 mesi. Con un costo netto reale di €${calcs.nettoAlCliente.toLocaleString()}, trasformiamo la manutenzione in puro profitto energetico.`);
      } else {
        setAiContent(`Certificazione ESG: L'impianto neutralizzerà ${calcs.nox}kg di inquinanti NOx all'anno, pari alla piantumazione di ${calcs.alberi} alberi nel perimetro aziendale.`);
      }
    }
    setIsAiLoading(false);
  };

  return (
    <div className={`min-h-screen font-sans transition-all duration-700 ${isClientMode ? 'bg-slate-50 text-slate-900' : 'bg-[#010204] text-white'}`}>
      
      {/* STATUS BAR */}
      <div className={`text-white text-[10px] font-black text-center py-1 uppercase tracking-[0.3em] flex items-center justify-center gap-2 ${isClientMode ? 'bg-orange-500' : 'bg-[#005A8C]'}`}>
        <CheckCircle2 className="w-3 h-3" /> 
        {isClientMode ? 'PROPOSTA COMMERCIALE CLIENTE' : 'DASHBOARD ANALITICA PARTNER'}
      </div>

      <nav className={`sticky top-0 z-30 border-b px-4 py-3 flex justify-between items-center transition-all ${isClientMode ? 'bg-white/80 border-slate-200 backdrop-blur-md shadow-sm' : 'bg-black/60 border-white/10 backdrop-blur-xl'}`}>
        <LogoReAir isClientMode={isClientMode} />
        <button 
          onClick={() => setIsClientMode(!isClientMode)} 
          className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all shadow-lg active:scale-90 ${isClientMode ? 'bg-[#005A8C] text-white' : 'bg-white text-black'}`}
        >
          {isClientMode ? 'GESTIONALE SOCI' : 'VISTA CLIENTE'}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6 pb-24 text-inherit">
        
        {/* CONFIGURATORE */}
        <section className={`p-6 rounded-[40px] border transition-all ${isClientMode ? 'bg-white border-slate-200 shadow-xl' : 'bg-white/5 border-white/10 shadow-2xl'}`}>
          <div className="space-y-6">
            <div className="relative">
              <label className={`text-[10px] font-black uppercase mb-2 block tracking-widest ${isClientMode ? 'text-slate-500' : 'text-blue-400'}`}>Potenza Impianto (kWp)</label>
              <input 
                type="number" 
                value={kwp} 
                onChange={(e) => setKwp(Number(e.target.value))} 
                className={`w-full bg-transparent border-b-2 py-2 text-5xl font-black outline-none transition-all ${isClientMode ? 'border-orange-500 text-slate-900 focus:border-orange-600' : 'border-blue-500 text-white focus:border-blue-400'}`} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(PRODUCTS).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => setSelectedProductId(p.id)} 
                  className={`p-5 rounded-3xl border-2 text-left transition-all ${selectedProductId === p.id 
                    ? (isClientMode ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-md' : 'border-blue-500 bg-blue-500/20 text-white') 
                    : (isClientMode ? 'border-slate-100 bg-slate-50 text-slate-400' : 'border-white/10 bg-transparent text-slate-500')}`}
                >
                  <div className="flex justify-between items-center mb-1 text-inherit">
                    <span className="font-black text-[14px]">{p.name}</span>
                    {selectedProductId === p.id && <CheckCircle2 className={`w-4 h-4 ${isClientMode ? 'text-orange-500' : 'text-blue-400'}`} />}
                  </div>
                  <span className="text-[10px] uppercase font-bold opacity-60">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setBonusFirma(!bonusFirma)} className={`p-3 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${bonusFirma ? (isClientMode ? 'border-orange-500 text-orange-600 bg-orange-50 shadow-md' : 'border-emerald-500 text-emerald-500 bg-emerald-500/5') : 'border-slate-200 opacity-40'}`}>
                🎁 Firma Rapida -5%
              </button>
              <button onClick={() => setBonusFedeltaAttivo(!bonusFedeltaAttivo)} className={`p-3 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${bonusFedeltaAttivo ? (isClientMode ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-md' : 'border-[#8EBCD6] text-[#8EBCD6] bg-blue-500/5') : 'border-slate-200 opacity-40'}`}>
                ⭐ Fedeltà 48m -2%
              </button>
            </div>
          </div>
        </section>

        {/* AI INSIGHTS */}
        <section className={`p-6 rounded-[40px] border-2 transition-all ${isClientMode ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/10 border-blue-500/30'}`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-[11px] font-black uppercase flex items-center gap-2 ${isClientMode ? 'text-[#005A8C]' : 'text-blue-400'}`}>
              <Sparkles className="w-4 h-4 animate-pulse" /> Strategic Assistant AI
            </span>
            <div className="flex gap-2">
              <button onClick={() => generateAI('pitch')} disabled={isAiLoading} className={`text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase shadow-lg active:scale-95 disabled:opacity-50 ${isClientMode ? 'bg-[#005A8C]' : 'bg-blue-600'}`}>
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Pitch AI'}
              </button>
              <button onClick={() => generateAI('esg')} disabled={isAiLoading} className={`text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase shadow-lg active:scale-95 ${isClientMode ? 'bg-orange-500' : 'bg-slate-700'}`}>ESG AI</button>
            </div>
          </div>
          {aiContent && (
            <div className={`p-6 rounded-[32px] border animate-in fade-in slide-in-from-top-2 ${isClientMode ? 'bg-white border-blue-100 text-slate-800 shadow-sm' : 'bg-white/5 border-white/10 text-white'}`}>
              <div className="flex items-start gap-4">
                <MessageSquare className={`w-6 h-6 shrink-0 mt-1 ${isClientMode ? 'text-orange-500' : 'text-blue-400'}`} />
                <p className="text-sm italic font-medium leading-relaxed">"{aiContent}"</p>
              </div>
            </div>
          )}
        </section>

        {/* PROPOSTA COMMERCIALE */}
        <div className={`rounded-[56px] overflow-hidden border shadow-2xl transition-all ${isClientMode ? 'bg-white border-slate-100' : 'bg-[#0a0c12] border-white/5 shadow-black'}`}>
          <div className={`p-10 text-white flex justify-between items-center ${isClientMode ? 'bg-gradient-to-br from-[#8EBCD6] to-[#005A8C]' : 'bg-blue-700'}`}>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1">Offerta ReAir</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-90 text-white">Programma Protezione Energetica 24 Mesi</p>
            </div>
            <div className="text-right bg-white/20 px-5 py-2 rounded-2xl border border-white/30 backdrop-blur-md font-black text-xs text-white">
              REF-ID-{kwp}
            </div>
          </div>
          
          <div className="p-8 md:p-12 space-y-10 text-inherit">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-10 rounded-[48px] border-2 text-center transition-all ${isClientMode ? 'bg-slate-50 border-slate-100 text-slate-900' : 'bg-black border-white/5 text-white'}`}>
                <span className="text-[10px] font-black uppercase block mb-2 tracking-widest opacity-40">Valore dell'Intervento</span>
                <span className="text-2xl line-through opacity-30 block mb-1">€ {calcs.prezzoPieno.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <span className="text-6xl font-black block tracking-tighter">€ {calcs.prezzo.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <div className={`mt-4 inline-block ${isClientMode ? 'bg-orange-500 shadow-orange-100 shadow-lg' : 'bg-emerald-600'} text-white text-[11px] font-black px-6 py-2 rounded-full uppercase`}>
                  Risparmio: {calcs.scontoApplicato}%
                </div>
              </div>
              <div className={`p-10 rounded-[48px] text-white text-center shadow-2xl flex flex-col justify-center transform hover:scale-[1.03] transition-all bg-gradient-to-br ${isClientMode ? 'from-orange-500 to-orange-600' : 'from-emerald-500 to-teal-600'}`}>
                <span className="text-[11px] font-black opacity-90 uppercase block mb-2 tracking-widest text-white">Investimento Netto d'Impresa</span>
                <span className="text-6xl font-black tracking-tighter text-white">€ {calcs.nettoAlCliente.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <p className="text-[10px] mt-4 font-black opacity-80 uppercase tracking-widest bg-white/20 py-2 rounded-full px-4 text-white">Bonus Fiscale 50% Incluso</p>
              </div>
            </div>

            {/* CHART ROI 12 MESI */}
            <div className={`p-10 rounded-[48px] border transition-all ${isClientMode ? 'bg-slate-50 border-slate-200' : 'bg-black border-white/5 shadow-inner'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isClientMode ? 'bg-blue-100 text-[#005A8C]' : 'bg-blue-500/10 text-blue-500'}`}><BarChart3 className="w-8 h-8" /></div>
                  <div className="text-center sm:text-left">
                    <span className={`text-xs font-black uppercase tracking-widest ${isClientMode ? 'text-slate-500' : 'text-slate-400'}`}>Recupero dell'investimento</span>
                    <p className={`text-xl font-black uppercase leading-none mt-1 ${isClientMode ? 'text-[#005A8C]' : 'text-blue-500'}`}>Break-Even: 12 Mesi</p>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full relative px-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isClientMode ? "#f97316" : "#3b82f6"} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={isClientMode ? "#f97316" : "#3b82f6"} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="150" x2="400" y2="150" stroke={isClientMode ? "#e2e8f0" : "#1e293b"} strokeWidth="1" strokeDasharray="8" />
                  <path d="M 0 190 L 200 150 L 400 60 L 400 190 L 0 190 Z" fill="url(#roiGrad)" />
                  <path d="M 0 190 L 200 150 L 400 60" fill="none" stroke={isClientMode ? "#f97316" : "#3b82f6"} strokeWidth="14" strokeLinecap="round" />
                  <circle cx="200" cy="150" r="18" fill={isClientMode ? "#f97316" : "#3b82f6"} className="animate-pulse shadow-xl" />
                  
                  <text x="200" y="120" textAnchor="middle" className={`text-[12px] font-black uppercase ${isClientMode ? 'fill-orange-600' : 'fill-blue-400'}`}>Pareggio 12m</text>
                  <text x="400" y="50" textAnchor="end" className={`text-[14px] font-black uppercase italic ${isClientMode ? 'fill-blue-700' : 'fill-emerald-500'}`}>Profitto 24m</text>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-inherit">
              <div className={`text-center p-8 rounded-[48px] border transition-all ${isClientMode ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/10'}`}>
                <Leaf className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                <span className="text-5xl font-black block tracking-tighter text-inherit">{calcs.alberi}</span>
                <span className="text-[11px] opacity-60 uppercase font-black tracking-widest mt-1 block text-inherit">Alberi Equivalenti</span>
              </div>
              <div className={`text-center p-8 rounded-[48px] border transition-all ${isClientMode ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/10'}`}>
                <TrendingUp className={`w-12 h-12 mx-auto mb-4 ${isClientMode ? 'text-[#005A8C]' : 'text-blue-500'}`} />
                <span className="text-5xl font-black block tracking-tighter text-inherit">+15%</span>
                <span className="text-[11px] opacity-60 uppercase font-black tracking-widest mt-1 block text-inherit">Resa Energetica</span>
              </div>
            </div>
          </div>
        </div>

        {/* GESTIONALE PARTNER (ONLY IN DARK MODE) */}
        {!isClientMode && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
            <section className="bg-slate-900 p-10 rounded-[56px] border border-white/10 shadow-inner">
              <h2 className="text-[11px] font-black uppercase opacity-50 mb-10 flex items-center gap-4 text-blue-400 tracking-[0.4em] font-black"><Percent className="w-6 h-6" /> Breakdown Uscite Operative</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-inherit"><Truck className="w-6 h-6 text-blue-400" /><span className="text-[10px] font-black opacity-50 uppercase text-white">Materiali</span></div>
                    <p className="text-4xl font-black text-white">€ {calcs.costoProdotto.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] opacity-40 uppercase font-bold mt-4">Sconto 30% applicato</span>
                </div>
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-inherit"><HardHat className="w-6 h-6 text-orange-400" /><span className="text-[10px] font-black opacity-50 uppercase text-white">Squadra Posa</span></div>
                    <p className="text-4xl font-black text-white">€ {calcs.costoPosa.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] opacity-40 uppercase font-bold mt-4">Costo 10€ / mq</span>
                </div>
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-inherit"><Wallet className="w-6 h-6 text-emerald-400" /><span className="text-[10px] font-black opacity-50 uppercase text-white">Provvigione</span></div>
                    <p className="text-4xl font-black text-white">€ {calcs.provvigione.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] opacity-40 uppercase font-bold mt-4">7% sul fatturato</span>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 text-white p-14 rounded-[64px] border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 blur-[120px]"></div>
               <h2 className="text-[11px] font-black uppercase opacity-50 mb-12 flex items-center gap-4 text-emerald-400 tracking-[0.4em] font-black tracking-widest"><Briefcase className="w-6 h-6" /> Utile Reale Commessa</h2>
               <div className="text-8xl font-black text-emerald-400 mb-14 tracking-tighter">€ {calcs.utile.toLocaleString()} <span className="text-sm opacity-50 font-black ml-6 uppercase text-white tracking-widest">Netto Soci (40%)</span></div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-white">
                 <div className="bg-white/5 p-10 rounded-[48px] border border-white/10 text-center text-inherit">
                   <span className="text-[11px] opacity-40 block uppercase mb-3 font-black tracking-widest text-slate-300">Socio A (50%)</span>
                   <span className="text-4xl font-black text-white">€ {calcs.utileSocio.toLocaleString()}</span>
                 </div>
                 <div className="bg-white/5 p-10 rounded-[48px] border border-white/10 text-center text-inherit">
                   <span className="text-[11px] opacity-40 block uppercase mb-3 font-black tracking-widest text-slate-300">Socio B (50%)</span>
                   <span className="text-4xl font-black text-white">€ {calcs.utileSocio.toLocaleString()}</span>
                 </div>
               </div>
            </section>
          </div>
        )}

        <div className="text-center pt-12 pb-16">
          <button onClick={() => window.location.reload(true)} className={`text-[10px] font-black uppercase tracking-[0.3em] border px-10 py-4 rounded-3xl transition-all ${isClientMode ? 'text-slate-400 border-slate-200 hover:bg-slate-100' : 'text-slate-500 border-white/10 hover:bg-white/5'}`}>
            Sincronizzazione Engine 3.1
          </button>
        </div>
      </main>

      <footer className={`text-center py-16 text-[10px] font-black tracking-[0.6em] uppercase transition-all ${isClientMode ? 'text-slate-400' : 'text-slate-600'}`}>
        ReAir S.R.L. | Milano 2026 | Nanotechnology B.U.
      </footer>
    </div>
  );
};

export default App;
