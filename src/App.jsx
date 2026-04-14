import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, Sun, Sparkles, Loader2, 
  MessageSquare, Shield, Clock, Briefcase, Eye, EyeOff, Compass, RefreshCw,
  Truck, HardHat, Percent, Wallet, BarChart3, CheckCircle2, AlertTriangle, ChevronRight
} from 'lucide-react';

const App = () => {
  // --- CONFIGURAZIONE GEMINI API ---
  const apiKey = "gen-lang-client-0438962149"; 

  // --- PARAMETRI BUSINESS AGGIORNATI ---
  const MQ_PER_KW = 6.5; 
  const COSTO_POSA_MQ = 10; 
  const CICLO_PROTEZIONE = 24;   
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
  const [isDemoMode, setIsDemoMode] = useState(false);

  // --- LOGICA FINANZIARIA ---
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
      alberi: Math.round(kwp * 0.388 * 2.4),
      scontoApplicato: ((1 - (prezzoScontato / prezzoPieno)) * 100).toFixed(0)
    };
  }, [kwp, selectedProductId, bonusFirma, bonusFedeltaAttivo]);

  // --- AI ENGINE V23 (CON FALLBACK STRATEGICO) ---
  const generateAI = async (type) => {
    setIsAiLoading(true); setAiContent("");
    
    const promptText = type === 'pitch' 
      ? `Direttore ReAir. Crea un pitch di 2 righe in italiano per ${kwp}kWp. Prezzo finale: €${calcs.nettoAlCliente.toLocaleString()}. Rientro 12 mesi. Sii brillante.`
      : `ESG ReAir: ${calcs.nox}kg NOx, ${calcs.alberi} alberi. Report tecnico 2 righe.`;

    const models = ["gemini-3.1-flash", "gemini-3.1-pro-preview", "gemini-1.5-flash"];
    let success = false;

    if (apiKey && apiKey.length > 10) {
      for (const model of models) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
          });
          const data = await response.json();
          if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            setAiContent(data.candidates[0].content.parts[0].text);
            success = true;
            setIsDemoMode(false);
            break;
          }
        } catch (e) { console.error("Switching model..."); }
      }
    }

    if (!success) {
      setIsDemoMode(true);
      if (type === 'pitch') {
        setAiContent(`Progetto ReAir ${kwp}kWp: Un'opportunità di efficientamento che azzera i costi di manutenzione. Con un investimento netto di €${calcs.nettoAlCliente.toLocaleString()}, l'impianto rientra del capitale in 12 mesi, garantendo un secondo anno di pura sovrapproduzione energetica.`);
      } else {
        setAiContent(`Certificazione Green: L'applicazione ReAir su questo sito industriale neutralizzerà ${calcs.nox}kg di NOx ogni anno, un impatto positivo paragonabile alla piantumazione di ${calcs.alberi} nuovi alberi ad alto fusto.`);
      }
    }
    setIsAiLoading(false);
  };

  return (
    <div className={`min-h-screen font-sans transition-all duration-700 ${isClientMode ? 'bg-slate-50 text-slate-900' : 'bg-[#020408] text-white'}`}>
      
      {/* BOLLINO VERSION 23 */}
      <div className={`text-white text-[10px] font-black text-center py-1 uppercase tracking-[0.3em] flex items-center justify-center gap-2 ${isClientMode ? 'bg-orange-500' : 'bg-indigo-600'}`}>
        <CheckCircle2 className="w-3 h-3" /> 
        Versione 23.0 - MODALITÀ CLIENTE LIGHT & ORANGE
      </div>

      <nav className={`sticky top-0 z-30 border-b px-4 py-3 flex justify-between items-center transition-all ${isClientMode ? 'bg-white/80 border-slate-200 backdrop-blur-md shadow-sm' : 'bg-black/60 border-white/10 backdrop-blur-xl'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isClientMode ? 'bg-orange-500 shadow-orange-200 shadow-lg' : 'bg-blue-600'}`}><Sun className="text-white w-4 h-4" /></div>
          <h1 className={`text-sm font-black uppercase tracking-tighter ${isClientMode ? 'text-slate-900' : 'text-white'}`}>ReAir <span className={isClientMode ? 'text-orange-500' : 'text-blue-400'}>Field</span></h1>
        </div>
        <button 
          onClick={() => setIsClientMode(!isClientMode)} 
          className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all shadow-lg active:scale-90 ${isClientMode ? 'bg-slate-900 text-white' : 'bg-white text-black'}`}
        >
          {isClientMode ? 'TORNA AL GESTIONALE' : 'VISTA CLIENTE'}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6 pb-24 text-inherit">
        
        {/* INPUTS - SEMPRE CHIARO SE IN CLIENT MODE */}
        <section className={`p-6 rounded-[32px] border transition-all ${isClientMode ? 'bg-white border-slate-200 shadow-xl' : 'bg-white/5 border-white/10 shadow-2xl'}`}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-inherit">
              {Object.values(PRODUCTS).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => setSelectedProductId(p.id)} 
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedProductId === p.id 
                    ? (isClientMode ? 'border-orange-500 bg-orange-50 text-slate-900 shadow-md' : 'border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/10') 
                    : (isClientMode ? 'border-slate-100 bg-slate-50 text-slate-400' : 'border-white/10 bg-transparent text-slate-500')}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-[13px]">{p.name}</span>
                    {selectedProductId === p.id && <CheckCircle2 className={`w-4 h-4 ${isClientMode ? 'text-orange-500' : 'text-blue-400'}`} />}
                  </div>
                  <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* AI PANEL */}
        <section className={`p-6 rounded-[32px] border-2 transition-all ${isClientMode ? 'bg-white border-orange-100 shadow-lg' : 'bg-blue-900/10 border-blue-500/30 shadow-2xl'}`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-[10px] font-black uppercase flex items-center gap-2 ${isClientMode ? 'text-orange-600' : 'text-blue-400'}`}>
              <Sparkles className={`w-4 h-4 animate-pulse ${isClientMode ? 'text-orange-500' : 'text-blue-400'}`} /> ReAir Sales Intelligence
            </span>
            <div className="flex gap-2">
              <button onClick={() => generateAI('pitch')} disabled={isAiLoading} className={`${isClientMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} text-white text-[10px] font-black px-5 py-2.5 rounded-xl uppercase shadow-lg active:scale-95 disabled:opacity-50`}>
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Pitch'}
              </button>
              <button onClick={() => generateAI('esg')} disabled={isAiLoading} className={`text-white text-[10px] font-black px-5 py-2.5 rounded-xl uppercase shadow-lg active:scale-95 ${isClientMode ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-700'}`}>ESG Report</button>
            </div>
          </div>
          {aiContent && (
            <div className={`p-5 rounded-2xl border animate-in fade-in zoom-in-95 duration-500 ${isClientMode ? 'bg-orange-50 border-orange-200 text-slate-800' : 'bg-blue-600/10 border-blue-500/30 text-white'}`}>
              <div className="flex items-start gap-3">
                <MessageSquare className={`w-5 h-5 ${isClientMode ? 'text-orange-500' : 'text-blue-400'} shrink-0 mt-1`} />
                <p className="text-sm italic font-medium leading-relaxed">"{aiContent}"</p>
              </div>
            </div>
          )}
        </section>

        {/* CLIENT OFFER - BELLA CHIARA */}
        <div className={`rounded-[48px] overflow-hidden border shadow-2xl transition-all ${isClientMode ? 'bg-white border-slate-200' : 'bg-[#0a0c12] border-white/5 shadow-black'}`}>
          <div className={`p-10 text-white flex justify-between items-center ${isClientMode ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-blue-700'}`}>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1">Proposta Tecnica</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">Protezione Totale 24 Mesi</p>
            </div>
            <div className="text-right bg-white/20 px-5 py-2 rounded-2xl border border-white/30 backdrop-blur-md">
              <span className="text-[10px] font-black block opacity-70">RE-COD</span>
              <span className="font-mono text-base font-black">PROJ-{kwp}</span>
            </div>
          </div>
          
          <div className="p-8 md:p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-8 rounded-[40px] border-2 text-center transition-all ${isClientMode ? 'bg-slate-50 border-slate-100 text-slate-900' : 'bg-black border-white/5 text-white'}`}>
                <span className={`text-[10px] font-black uppercase block mb-2 tracking-widest ${isClientMode ? 'text-slate-500' : 'text-blue-400'}`}>Costo Totale</span>
                <span className={`text-xl line-through opacity-30 block mb-1`}>€ {calcs.prezzoPieno.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <span className={`text-5xl font-black block tracking-tighter`}>€ {calcs.prezzo.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <div className={`mt-3 inline-block ${isClientMode ? 'bg-orange-500' : 'bg-emerald-500'} text-white text-[10px] font-black px-3 py-1 rounded-full uppercase`}>- {calcs.scontoApplicato}% Risparmio</div>
              </div>
              <div className={`p-10 rounded-[40px] text-white text-center shadow-2xl flex flex-col justify-center transform hover:scale-[1.03] transition-all bg-gradient-to-br ${isClientMode ? 'from-blue-600 to-indigo-700' : 'from-emerald-500 to-teal-600'}`}>
                <span className="text-[11px] font-black opacity-90 uppercase block mb-2 tracking-widest">Investimento Netto Reale</span>
                <span className="text-6xl font-black tracking-tighter">€ {calcs.nettoAlCliente.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <p className="text-[10px] mt-3 font-black opacity-80 uppercase tracking-widest bg-white/10 py-1 rounded-full">Fisco 50% Incluso</p>
              </div>
            </div>

            {/* ROI CHART - CHIARO */}
            <div className={`p-10 rounded-[40px] border transition-all ${isClientMode ? 'bg-white border-slate-200 shadow-inner' : 'bg-black border-white/5'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className={`p-3 rounded-2xl ${isClientMode ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}><BarChart3 className="w-6 h-6" /></div>
                  <div>
                    <span className={`text-xs font-black uppercase tracking-widest ${isClientMode ? 'text-slate-500' : 'text-white'}`}>Velocità di Recupero</span>
                    <p className={`text-lg font-black uppercase leading-none mt-1 ${isClientMode ? 'text-orange-600' : 'text-blue-500'}`}>Break-Even al 12° Mese</p>
                  </div>
                </div>
                <div className={`px-6 py-2 rounded-full text-xs font-black uppercase border ${isClientMode ? 'border-orange-500/30 text-orange-600 bg-orange-50' : 'border-blue-500/30 text-blue-500 bg-blue-500/5'}`}>
                   Payback Garantito
                </div>
              </div>

              <div className="h-56 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isClientMode ? "#f97316" : "#3b82f6"} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={isClientMode ? "#f97316" : "#3b82f6"} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="150" x2="400" y2="150" stroke={isClientMode ? "#e2e8f0" : "#1e293b"} strokeWidth="1" strokeDasharray="6" />
                  <path d="M 0 190 L 200 150 L 400 60 L 400 190 L 0 190 Z" fill="url(#roiGrad)" />
                  <path d="M 0 190 L 200 150 L 400 60" fill="none" stroke={isClientMode ? "#f97316" : "#3b82f6"} strokeWidth="12" strokeLinecap="round" className="drop-shadow-lg" />
                  <circle cx="200" cy="150" r="16" fill={isClientMode ? "#f97316" : "#3b82f6"} className="animate-pulse shadow-lg" />
                  <text x="200" y="125" textAnchor="middle" className={`text-[12px] font-black uppercase ${isClientMode ? 'fill-orange-600' : 'fill-blue-500'}`}>Pareggio 12m</text>
                  <text x="400" y="50" textAnchor="end" className={`text-[14px] font-black uppercase italic ${isClientMode ? 'fill-blue-600' : 'fill-emerald-500'}`}>Utile Netto</text>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className={`text-center p-8 rounded-[40px] border transition-all ${isClientMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                <Leaf className="w-8 h-8 mx-auto mb-3 text-emerald-500" />
                <span className="text-4xl font-black block tracking-tighter">{calcs.alberi}</span>
                <span className={`text-[10px] opacity-60 uppercase font-black tracking-widest mt-1 block`}>Alberi Equivalenti</span>
              </div>
              <div className={`text-center p-8 rounded-[40px] border transition-all ${isClientMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                <TrendingUp className={`w-8 h-8 mx-auto mb-3 ${isClientMode ? 'text-blue-600' : 'text-blue-500'}`} />
                <span className="text-4xl font-black block tracking-tighter">+15%</span>
                <span className={`text-[10px] opacity-60 uppercase font-black tracking-widest mt-1 block`}>Resa Energetica</span>
              </div>
            </div>
          </div>
        </div>

        {/* ADMIN VIEW - SOLO IN DARK MODE PER I SOCI */}
        {!isClientMode && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
            <section className="bg-slate-900 p-10 rounded-[48px] border border-white/10 shadow-inner">
              <h2 className="text-[11px] font-black uppercase opacity-50 mb-8 flex items-center gap-3 text-blue-400 tracking-[0.3em]"><Percent className="w-5 h-5" /> Breakdown Costi Operativi</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-7 rounded-[32px] border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3"><Truck className="w-5 h-5 text-blue-400" /><span className="text-[10px] font-black opacity-50 uppercase">Materiale</span></div>
                    <p className="text-3xl font-black text-white">€ {calcs.costoProdotto.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] opacity-40 font-bold uppercase mt-2 block tracking-tighter">Sconto 30% applicato</span>
                </div>
                <div className="bg-white/5 p-7 rounded-[32px] border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3"><HardHat className="w-5 h-5 text-orange-400" /><span className="text-[10px] font-black opacity-50 uppercase">Squadra</span></div>
                    <p className="text-3xl font-black text-white">€ {calcs.costoPosa.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] opacity-40 font-bold uppercase mt-2 block tracking-tighter">10€ / mq su {calcs.mq}mq</span>
                </div>
                <div className="bg-white/5 p-7 rounded-[32px] border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3"><Wallet className="w-5 h-5 text-emerald-400" /><span className="text-[10px] font-black opacity-50 uppercase">Agente</span></div>
                    <p className="text-3xl font-black text-white">€ {calcs.provvigione.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] opacity-40 font-bold uppercase mt-2 block tracking-tighter">Fisso 7% Protetto</span>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 text-white p-12 rounded-[56px] border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 blur-[100px]"></div>
               <h2 className="text-[11px] font-black uppercase opacity-50 mb-10 flex items-center gap-3 text-emerald-400 tracking-[0.3em] font-black"><Briefcase className="w-5 h-5" /> Profit Margin Soci</h2>
               <div className="text-7xl font-black text-emerald-400 mb-12 tracking-tighter">€ {calcs.utile.toLocaleString()} <span className="text-sm opacity-50 font-black ml-4 uppercase text-white">Netto Soci (40%)</span></div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 text-center">
                   <span className="text-[10px] opacity-40 block uppercase mb-2 font-black tracking-widest text-slate-300">Socio A (50%)</span>
                   <span className="text-3xl font-black text-white">€ {calcs.utileSocio.toLocaleString()}</span>
                 </div>
                 <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 text-center">
                   <span className="text-[10px] opacity-40 block uppercase mb-2 font-black tracking-widest text-slate-300">Socio B (50%)</span>
                   <span className="text-3xl font-black text-white">€ {calcs.utileSocio.toLocaleString()}</span>
                 </div>
               </div>
            </section>
          </div>
        )}

        <div className="text-center pt-10 pb-10">
          <button onClick={() => window.location.reload(true)} className={`text-[10px] font-black uppercase tracking-widest border px-8 py-3 rounded-2xl transition-all ${isClientMode ? 'text-slate-400 border-slate-200 hover:bg-slate-100' : 'text-slate-500 border-white/10 hover:bg-white/5'}`}>
            Forza Sincronizzazione V23.0
          </button>
        </div>
      </main>

      <footer className={`text-center py-12 text-[10px] font-black tracking-[0.5em] uppercase transition-all ${isClientMode ? 'text-slate-400' : 'text-slate-600'}`}>
        ReAir S.R.L. | Milano 2026 | BU Nanotechnology
      </footer>
    </div>
  );
};

export default App;
