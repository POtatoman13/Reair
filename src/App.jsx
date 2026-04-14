import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, Sun, Sparkles, Loader2, 
  MessageSquare, Shield, Clock, Briefcase, Eye, EyeOff, Compass, RefreshCw,
  Truck, HardHat, Percent, Wallet, BarChart3
} from 'lucide-react';

const App = () => {
  // --- CONFIGURAZIONE GEMINI API ---
  const apiKey = "AIzaSyAhI3gdRivymDaxiSM-jdqyuyx-g4_6GF8";
  const MODEL_NAME = "gemini-1.5-flash";

  // --- PARAMETRI BUSINESS AGGIORNATI ---
  const MQ_PER_KW = 6.5; 
  const COSTO_POSA_MQ = 10; 
  const BONUS_FEDELTA_MESI = 48; 
  const CICLO_PROTEZIONE = 24;   
  const AGENTE_PERC = 0.07; 

  const PRODUCTS = {
    rm20: { 
      id: 'rm20', 
      name: 'Clean Coating RM 20', 
      listPrice: 399, 
      yield_mq_l: 40, 
      sconto: 0.30, 
      label: 'Protezione Covalente' 
    },
    pa_plus: { 
      id: 'pa_plus', 
      name: 'PhotoActive Plus', 
      listPrice: 195, 
      yield_mq_l: 60, 
      sconto: 0.30, 
      label: 'ESG & Autopulizia' 
    }
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
    
    const costoProdottoNetto = litri * (p.listPrice * (1 - p.sconto));
    const costoPosaTotale = mqTotali * COSTO_POSA_MQ;
    const costiVivi = costoProdottoNetto + costoPosaTotale;
    
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
      alberi: Math.round(kwp * 0.388 * 2.4)
    };
  }, [kwp, selectedProductId, bonusFirma, bonusFedeltaAttivo]);

  const generateAI = async (type) => {
    if (!apiKey) { setAiContent("ERRORE: API Key mancante."); return; }
    setIsAiLoading(true); setAiContent("");
    
    const prompt = type === 'pitch' 
      ? `Sei un esperto ReAir. Scrivi un pitch di vendita IRRESISTIBILE (2-3 righe). Impianto ${kwp}kWp. Recupero investimento in soli 12 MESI. Secondo anno di protezione incluso (24 mesi totali) è puro profitto. Prezzo netto: €${calcs.nettoAlCliente.toLocaleString()}.`
      : `Dati ambientali: ${calcs.nox}kg NOx abbattuti e ${calcs.alberi} alberi equivalenti grazie a ReAir. Genera un report ESG professionale.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      setAiContent(data.candidates?.[0]?.content?.parts?.[0]?.text || "Riprova.");
    } catch (e) {
      setAiContent(`Diagnostica: ${e.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isClientMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* BOLLINO PREMIUM V15 */}
      <div className={`text-white text-[10px] font-black text-center py-1 uppercase tracking-widest flex items-center justify-center gap-2 ${isClientMode ? 'bg-blue-600' : 'bg-indigo-700'}`}>
        <RefreshCw className="w-3 h-3" /> 
        Versione 15.0 - Premium UI & Enhanced Chart - Leggibilità Ottimizzata
      </div>

      <nav className={`sticky top-0 z-30 border-b px-4 py-3 flex justify-between items-center transition-colors ${isClientMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-2">
          <Sun className={`${isClientMode ? 'text-blue-400' : 'text-indigo-600'} w-5 h-5`} />
          <h1 className="text-sm font-black uppercase tracking-tighter">ReAir <span className={isClientMode ? 'text-blue-400' : 'text-indigo-600'}>Field App</span></h1>
        </div>
        <button 
          onClick={() => setIsClientMode(!isClientMode)} 
          className={`px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all ${isClientMode ? 'bg-white text-slate-900' : 'bg-indigo-600 text-white'}`}
        >
          {isClientMode ? 'VISTA PARTNER' : 'VISTA CLIENTE'}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
        
        {/* CONFIGURAZIONE */}
        <section className={`p-6 rounded-3xl border transition-colors ${isClientMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase opacity-60 mb-2 block tracking-widest ${isClientMode ? 'text-slate-300' : 'text-slate-500'}`}>Potenza Fotovoltaico (kWp)</label>
              <input 
                type="number" 
                value={kwp} 
                onChange={(e) => setKwp(Number(e.target.value))} 
                className={`w-full bg-transparent border-b-2 py-2 text-3xl font-black outline-none transition-colors ${isClientMode ? 'border-blue-500 text-white focus:border-blue-400' : 'border-indigo-600 text-slate-900 focus:border-indigo-400'}`} 
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.values(PRODUCTS).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => setSelectedProductId(p.id)} 
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${selectedProductId === p.id 
                    ? (isClientMode ? 'border-blue-500 bg-blue-500/20' : 'border-indigo-600 bg-indigo-50') 
                    : (isClientMode ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-transparent bg-slate-100/50')}`}
                >
                  <span className={`font-black text-[11px] block ${selectedProductId === p.id && isClientMode ? 'text-white' : ''}`}>{p.name}</span>
                  <span className="text-[9px] opacity-60 uppercase font-bold">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => setBonusFirma(!bonusFirma)} className={`p-3 rounded-xl border-2 font-black text-[9px] uppercase transition-all ${bonusFirma ? (isClientMode ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10' : 'border-green-500 text-green-600 bg-green-500/5') : 'border-slate-800 opacity-30'}`}>
                🎁 Bonus Firma -5%
              </button>
              <button onClick={() => setBonusFedeltaAttivo(!bonusFedeltaAttivo)} className={`p-3 rounded-xl border-2 font-black text-[9px] uppercase transition-all ${bonusFedeltaAttivo ? (isClientMode ? 'border-blue-400 text-blue-400 bg-blue-400/10' : 'border-indigo-600 text-indigo-600 bg-indigo-600/5') : 'border-slate-800 opacity-30'}`}>
                ⭐ Bonus Fedeltà -2%
              </button>
            </div>
          </div>
        </section>

        {/* AI PANEL */}
        <section className={`p-6 rounded-3xl border-2 transition-all ${isClientMode ? 'bg-slate-900 border-blue-900/50' : 'bg-white border-indigo-100'}`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-[10px] font-black uppercase flex items-center gap-2 ${isClientMode ? 'text-blue-400' : 'text-indigo-600'}`}>
              <Sparkles className="w-4 h-4 animate-pulse" /> ReAir Strategy AI
            </span>
            <div className="flex gap-2">
              <button onClick={() => generateAI('pitch')} disabled={isAiLoading} className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase flex items-center gap-2 shadow-md active:scale-95">
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Pitch'}
              </button>
              <button onClick={() => generateAI('esg')} disabled={isAiLoading} className={`text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase shadow-md active:scale-95 ${isClientMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800 hover:bg-slate-700'}`}>ESG</button>
            </div>
          </div>
          {aiContent && (
            <div className={`p-4 rounded-2xl border animate-in fade-in slide-in-from-top-1 ${isClientMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-100' : 'bg-indigo-500/5 border-indigo-500/20 text-slate-700'}`}>
              <p className="text-sm italic font-medium leading-relaxed">"{aiContent}"</p>
            </div>
          )}
        </section>

        {/* PROPOSTA CLIENTE */}
        <div className={`rounded-[40px] overflow-hidden border shadow-2xl transition-all ${isClientMode ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-slate-100 shadow-slate-200'}`}>
          <div className={`p-8 text-white flex justify-between items-center ${isClientMode ? 'bg-gradient-to-r from-blue-700 to-indigo-900' : 'bg-indigo-700'}`}>
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase">Offerta Strategica</h2>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest text-white">Programma Protezione {CICLO_PROTEZIONE} mesi</p>
            </div>
            <div className="text-right bg-white/10 px-4 py-1 rounded-xl border border-white/20">
              <span className="text-[10px] font-black block opacity-60">PROGETTO</span>
              <span className="font-bold text-sm uppercase">RE-PROJ-{kwp}</span>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-3xl border-2 text-center transition-colors ${isClientMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                <span className="text-[10px] font-black opacity-40 uppercase block mb-1 tracking-widest">Valore Totale Commessa</span>
                <span className="text-lg line-through opacity-20 block">€ {calcs.prezzoPieno.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <span className={`text-4xl font-black block ${isClientMode ? 'text-white' : 'text-slate-900'}`}>€ {calcs.prezzo.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
              <div className={`p-8 rounded-[32px] text-white text-center shadow-xl flex flex-col justify-center transform hover:scale-[1.02] transition-transform ${isClientMode ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                <span className="text-[10px] font-black opacity-70 uppercase block mb-1">Investimento Netto Reale</span>
                <span className="text-5xl font-black tracking-tighter">€ {calcs.nettoAlCliente.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <p className="text-[9px] mt-2 font-black opacity-60 uppercase tracking-[0.2em]">Post-Detrazione Fiscale 50%</p>
              </div>
            </div>

            {/* GRAFICO ROI PREMIUM */}
            <div className={`p-8 rounded-[32px] border transition-colors ${isClientMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isClientMode ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-600/10 text-indigo-600'}`}>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-xs font-black uppercase tracking-widest ${isClientMode ? 'text-slate-300' : 'text-slate-500'}`}>Analisi Recupero Investimento</span>
                    <p className={`text-[10px] font-bold uppercase ${isClientMode ? 'text-blue-400' : 'text-indigo-600'}`}>Pareggio Garantito al 12° Mese</p>
                  </div>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${isClientMode ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' : 'border-indigo-600/30 text-indigo-600 bg-indigo-50'}`}>
                  Break-Even Rapido
                </div>
              </div>

              <div className="h-48 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isClientMode ? "#3b82f6" : "#4f46e5"} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={isClientMode ? "#3b82f6" : "#4f46e5"} stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Griglia di Sfondo */}
                  <line x1="0" y1="150" x2="400" y2="150" stroke={isClientMode ? "#334155" : "#e2e8f0"} strokeWidth="1" strokeDasharray="4" />
                  <line x1="200" y1="50" x2="200" y2="170" stroke={isClientMode ? "#334155" : "#e2e8f0"} strokeWidth="1" strokeDasharray="4" />

                  {/* Area Riempimento */}
                  <path d="M 0 190 L 200 150 L 400 60 L 400 190 L 0 190 Z" fill="url(#roiGradient)" opacity="0.3" />

                  {/* Linea Principale ROI */}
                  <path 
                    d="M 0 190 L 200 150 L 400 60" 
                    fill="none" 
                    stroke={isClientMode ? "#3b82f6" : "#4f46e5"} 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    filter="url(#glow)"
                  />

                  {/* Punti Chiave */}
                  <circle cx="0" cy="190" r="4" fill={isClientMode ? "#fff" : "#4f46e5"} />
                  <circle cx="200" cy="150" r="10" fill={isClientMode ? "#3b82f6" : "#4f46e5"} className="animate-pulse" />
                  <circle cx="400" cy="60" r="6" fill={isClientMode ? "#10b981" : "#059669"} />

                  {/* Etichette Assi */}
                  <text x="0" y="185" textAnchor="start" className={`text-[8px] font-bold uppercase ${isClientMode ? 'fill-slate-500' : 'fill-slate-400'}`}>Investimento</text>
                  <text x="200" y="130" textAnchor="middle" className={`text-[10px] font-black uppercase ${isClientMode ? 'fill-blue-400' : 'fill-indigo-700'}`}>Pareggio 12m</text>
                  <text x="400" y="50" textAnchor="end" className={`text-[10px] font-black uppercase ${isClientMode ? 'fill-emerald-400' : 'fill-emerald-600'}`}>Utile Netto 24m</text>
                  
                  <text x="0" y="198" textAnchor="start" className={`text-[8px] font-black ${isClientMode ? 'fill-slate-500' : 'fill-slate-400'}`}>Mese 1</text>
                  <text x="400" y="198" textAnchor="end" className={`text-[8px] font-black ${isClientMode ? 'fill-slate-500' : 'fill-slate-400'}`}>Mese 24</text>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`text-center p-5 rounded-3xl border transition-all ${isClientMode ? 'bg-slate-900 border-slate-800' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
                <Leaf className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <span className={`text-2xl font-black block ${isClientMode ? 'text-white' : 'text-slate-900'}`}>{calcs.alberi}</span>
                <span className={`text-[9px] opacity-60 uppercase font-black ${isClientMode ? 'text-slate-300' : 'text-slate-500'}`}>Alberi Equivalenti</span>
              </div>
              <div className={`text-center p-5 rounded-3xl border transition-all ${isClientMode ? 'bg-slate-900 border-slate-800' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
                <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${isClientMode ? 'text-blue-400' : 'text-indigo-600'}`} />
                <span className={`text-2xl font-black block ${isClientMode ? 'text-white' : 'text-slate-900'}`}>+15%</span>
                <span className={`text-[9px] opacity-60 uppercase font-black ${isClientMode ? 'text-slate-300' : 'text-slate-500'}`}>Resa Energetica</span>
              </div>
            </div>
          </div>
        </div>

        {/* MARGINI PARTNER & COSTI OPERATIVI (RISERVATI) */}
        {!isClientMode && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            
            {/* SEZIONE COSTI OPERATIVI */}
            <section className="bg-slate-100 p-8 rounded-[40px] border border-slate-200 shadow-inner">
              <h2 className="text-[10px] font-black uppercase opacity-50 mb-6 flex items-center gap-2 text-slate-600"><Percent className="w-4 h-4" /> Breakdown Costi Operativi (Uscite)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span className="text-[9px] font-black opacity-50 uppercase">Materiale ReAir</span>
                    </div>
                    <p className="text-xl font-black text-slate-800">€ {calcs.costoProdotto.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                  </div>
                  <span className="text-[8px] mt-2 opacity-40 font-bold uppercase">Quantità: {calcs.litri} Litri (Sconto 30%)</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <HardHat className="w-4 h-4 text-orange-500" />
                      <span className="text-[9px] font-black opacity-50 uppercase">Squadra Applicazione</span>
                    </div>
                    <p className="text-xl font-black text-slate-800">€ {calcs.costoPosa.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                  </div>
                  <span className="text-[8px] mt-2 opacity-40 font-bold uppercase">Tariffa: 10€ / mq su {calcs.mq}mq</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-indigo-500" />
                      <span className="text-[9px] font-black opacity-50 uppercase">Provvigione Agente</span>
                    </div>
                    <p className="text-xl font-black text-slate-800">€ {calcs.provvigione.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                  </div>
                  <span className="text-[8px] mt-2 opacity-40 font-bold uppercase">Calcolata al 7% sul fatturato</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-800 rounded-2xl flex justify-between items-center text-white">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Totale Esborso Operativo</span>
                <span className="text-2xl font-black">€ {calcs.costiTotali.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
            </section>

            {/* SEZIONE UTILI */}
            <section className="bg-slate-900 text-white p-8 rounded-[40px] border border-white/5 shadow-2xl">
              <h2 className="text-[10px] font-black uppercase opacity-50 mb-6 flex items-center gap-2 text-blue-400"><Briefcase className="w-4 h-4" /> Partner Margin Analysis</h2>
              <div className="text-5xl font-black text-emerald-400 mb-8 tracking-tighter">€ {calcs.utile.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-xs opacity-50 font-black ml-2 uppercase text-white">Profitto Netto Società (40%)</span></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-white">
                  <span className="text-[9px] opacity-40 block uppercase mb-1 font-black">Socio A (50%)</span>
                  <span className="text-xl font-black">€ {calcs.utileSocio.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-white">
                  <span className="text-[9px] opacity-40 block uppercase mb-1 font-black">Socio B (50%)</span>
                  <span className="text-xl font-black">€ {calcs.utileSocio.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* FORZA REFRESH */}
        <div className="text-center pt-4">
          <button onClick={() => window.location.reload(true)} className={`text-[9px] font-black uppercase tracking-widest border px-4 py-2 rounded-xl transition-all ${isClientMode ? 'text-slate-500 border-slate-800 hover:bg-slate-800' : 'text-slate-400 border-slate-300 hover:bg-slate-200'}`}>
            Sincronizza Update Premium UI
          </button>
        </div>
      </main>

      <footer className={`text-center py-10 text-[9px] font-black tracking-[0.4em] uppercase transition-colors ${isClientMode ? 'text-slate-700' : 'text-slate-400'}`}>
        ReAir S.R.L. | Milano 2026 | Nanotechnology Business Unit
      </footer>
    </div>
  );
};

export default App;
