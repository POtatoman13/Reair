import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, ShieldCheck, Calculator, Leaf, DollarSign, 
  BarChart3, Sun, FileText, Sparkles, Loader2, AlertCircle, 
  MessageSquareQuote, Zap, Shield, Clock, Briefcase, ChevronRight,
  Eye, EyeOff, Compass, CheckCircle2, Wallet, HardHat, Truck, Percent,
  Home, Building2, School, Wind, ShieldAlert
} from 'lucide-react';

// --- COMPONENTE LOGO REAIR ---
const LogoReAir = ({ isClientMode }) => (
  <div className="flex items-center gap-3">
    <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#8EBCD6" />
      <path d="M50 25C50 25 30 45 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 45 50 25 50 25Z" fill="white" />
      <path d="M50 80V35" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 65L65 55" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 55L35 45" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <div className="flex flex-col leading-none text-left">
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
  // --- CONFIGURAZIONE API ---
  const apiKey = "AIzaSyAhI3gdRivymDaxiSM-jdqyuyx-g4_6GF8"; 

  // --- PARAMETRI BUSINESS 2026 ---
  const MQ_PER_KW = 6.5; 
  const TAX_DEDUCTION = 0.50;           
  const AGENTE_PERC = 0.07; 

  const PRODUCTS = {
    // CATEGORIA OUTDOOR (FOTOVOLTAICO)
    rm20: { id: 'rm20', category: 'outdoor', name: 'Clean Coating RM 20', listPrice: 399, yield_mq_l: 40, sconto: 0.30, label: 'Protezione Covalente 8 Anni' },
    pa_plus: { id: 'pa_plus', category: 'outdoor', name: 'PhotoActive Plus', listPrice: 195, yield_mq_l: 60, sconto: 0.30, label: 'ESG & Autopulizia' },
    // CATEGORIA INDOOR (SCUOLE / UFFICI)
    wall_indoor: { id: 'wall_indoor', category: 'indoor', name: 'ReAir Wall Indoor', listPrice: 245, yield_mq_l: 50, sconto: 0.35, label: 'Superfici Pure (Scuole/Uffici)' },
    air_purify: { id: 'air_purify', category: 'indoor', name: 'PhotoActive Air', listPrice: 280, yield_mq_l: 45, sconto: 0.30, label: 'Sanificazione Aria Continua' }
  };

  const [inputVal, setInputVal] = useState(300); // kWp se outdoor, mq se indoor
  const [selectedProductId, setSelectedProductId] = useState('rm20');
  const [bonusFirma, setBonusFirma] = useState(true);
  const [isClientMode, setIsClientMode] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- LOGICA COSTI SQUADRA ---
  const getCostoSquadraPerKW = (kw) => {
    if (kw <= 50) return 18;
    if (kw <= 100) return 15;
    if (kw <= 300) return 10;
    return 8;
  };

  const calcs = useMemo(() => {
    const product = PRODUCTS[selectedProductId];
    const isIndoor = product.category === 'indoor';
    
    // Calcolo mq effettivi
    const mqTotali = isIndoor ? inputVal : inputVal * MQ_PER_KW;
    const litri = Math.ceil(mqTotali / product.yield_mq_l);
    
    // Uscite materiali
    const costoProdottoNetto = litri * (product.listPrice * (1 - product.sconto));
    
    // Uscite squadra (Dinamica per outdoor, fissa a 6€/mq per indoor)
    const costoPosa = isIndoor ? mqTotali * 6 : inputVal * getCostoSquadraPerKW(inputVal);
    
    const costiVivi = costoProdottoNetto + costoPosa;

    // Fatturato (Garantisce 40% utile soci e 7% agente -> Divisore 0.53)
    const prezzoScontato = costiVivi / 0.53;
    const provvigioneValore = prezzoScontato * AGENTE_PERC;
    const utileTotale = prezzoScontato - costiVivi - provvigioneValore;
    
    const scontoFirmaPerc = bonusFirma ? 0.05 : 0;
    const prezzoPieno = prezzoScontato / (1 - scontoFirmaPerc);

    const costoNettoCliente = prezzoScontato * TAX_DEDUCTION;

    return {
      isIndoor,
      productName: product.name,
      litri,
      costoProdottoNetto,
      costoPosa,
      prezzoScontato,
      prezzoPieno,
      provvigioneValore,
      utileTotale,
      utileSocio: utileTotale / 2,
      costoNettoCliente,
      scontoApplicato: ((1 - (prezzoScontato / prezzoPieno)) * 100).toFixed(0),
      nox: (mqTotali * 0.06).toFixed(1), // Stimato su mq per indoor/outdoor
      alberi: Math.round(mqTotali * 0.06 * 2.4),
      mqTotali
    };
  }, [inputVal, selectedProductId, bonusFirma]);

  // --- ENGINE AI GEMINI 3.1 ---
  const generateAI = async (type) => {
    setIsAiLoading(true); setAiContent("");
    const targetAmbiente = calcs.isIndoor ? "scuola/ufficio" : "impianto fotovoltaico";
    const prompt = type === 'pitch' 
      ? `Direttore ReAir. Pitch per ${targetAmbiente} di ${calcs.mqTotali}mq con ${calcs.productName}. Prezzo netto €${calcs.costoNettoCliente.toLocaleString()}. Focus: salute e ROI.`
      : `Dati: ${calcs.nox}kg NOx abbattuti e ${calcs.alberi} alberi equivalenti tramite ReAir in ${targetAmbiente}.`;
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setAiContent(String(text));
    } catch (e) {
      setAiContent(calcs.isIndoor 
        ? `Protezione Totale Scuole: L'applicazione ReAir trasforma le pareti in un purificatore naturale. Con un investimento netto di €${calcs.costoNettoCliente.toLocaleString()}, garantiamo aria salubre per studenti e personale per 4 anni.`
        : `Efficienza Impianti: Per il vostro sito da ${inputVal}kWp, ReAir assicura il break-even in 12 mesi, abbattendo i costi di manutenzione e migliorando il profilo ESG.`);
    }
    setIsAiLoading(false);
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${isClientMode ? 'bg-white text-slate-900' : 'bg-[#010204] text-white'}`}>
      
      {/* STATUS BAR */}
      <div className={`text-white text-[10px] font-black text-center py-1 uppercase tracking-[0.3em] flex items-center justify-center gap-2 ${isClientMode ? 'bg-[#005A8C]' : 'bg-indigo-600'}`}>
        <CheckCircle2 className="w-3 h-3" /> 
        Versione 27.0 - CATALOGO INDOOR & OUTDOOR COMPLETO
      </div>

      <nav className={`sticky top-0 z-30 border-b px-4 py-3 flex justify-between items-center transition-all ${isClientMode ? 'bg-white/80 border-slate-200 backdrop-blur-md' : 'bg-black/60 border-white/10 backdrop-blur-xl'}`}>
        <LogoReAir isClientMode={isClientMode} />
        <button 
          onClick={() => setIsClientMode(!isClientMode)} 
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all shadow-lg active:scale-90 ${isClientMode ? 'bg-[#005A8C] text-white' : 'bg-white text-black'}`}
        >
          {isClientMode ? 'GESTIONALE SOCI' : 'VISTA CLIENTE'}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6 pb-20 text-inherit">
        
        {/* SELETTORE CATEGORIA & INPUT */}
        <section className={`p-6 rounded-[32px] border transition-all ${isClientMode ? 'bg-white border-slate-200 shadow-xl' : 'bg-white/5 border-white/10 shadow-2xl'}`}>
            <div className="space-y-6">
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedProductId('rm20'); setInputVal(300); }} 
                  className={`flex-1 p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-[10px] uppercase transition-all ${PRODUCTS[selectedProductId].category === 'outdoor' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-slate-100 opacity-40'}`}
                >
                  <Building2 className="w-4 h-4" /> Outdoor (KWp)
                </button>
                <button 
                  onClick={() => { setSelectedProductId('wall_indoor'); setInputVal(1000); }}
                  className={`flex-1 p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-[10px] uppercase transition-all ${PRODUCTS[selectedProductId].category === 'indoor' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-slate-100 opacity-40'}`}
                >
                  <School className="w-4 h-4" /> Indoor (Mq)
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase mb-2 block tracking-widest opacity-50">
                  {calcs.isIndoor ? 'Superficie Totale Pareti (mq)' : 'Potenza Impianto Nominale (kWp)'}
                </label>
                <input 
                  type="number" 
                  value={inputVal} 
                  onChange={(e) => setInputVal(Number(e.target.value))} 
                  className={`w-full bg-transparent border-b-2 border-current py-2 text-5xl font-black outline-none transition-all ${isClientMode ? 'border-[#8EBCD6] text-slate-900' : 'border-blue-500 text-white'}`} 
                />
              </div>

              {/* SELETTORE PRODOTTI FILTRATO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(PRODUCTS)
                  .filter(p => p.category === PRODUCTS[selectedProductId].category)
                  .map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => setSelectedProductId(p.id)} 
                    className={`p-5 rounded-3xl border-2 text-left transition-all ${selectedProductId === p.id 
                      ? (isClientMode ? 'border-[#005A8C] bg-blue-50 text-[#005A8C]' : 'border-blue-500 bg-blue-500/20') 
                      : (isClientMode ? 'border-slate-100 bg-slate-50 text-slate-400' : 'border-white/10 text-slate-500')}`}
                  >
                    <div className="flex justify-between items-center mb-1 font-black">
                      <span className="text-[13px]">{p.name}</span>
                      {selectedProductId === p.id && <CheckCircle2 className={`w-4 h-4 ${isClientMode ? 'text-[#005A8C]' : 'text-blue-400'}`} />}
                    </div>
                    <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
        </section>

        {/* AI PANEL */}
        <section className={`p-6 rounded-[40px] border-2 transition-all ${isClientMode ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/10 border-blue-500/30'}`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-[11px] font-black uppercase flex items-center gap-2 ${isClientMode ? 'text-[#005A8C]' : 'text-blue-400'}`}>
              <Sparkles className="w-4 h-4 animate-pulse" /> ReAir Sales Intelligence
            </span>
            <div className="flex gap-2">
              <button onClick={() => generateAI('pitch')} disabled={isAiLoading} className={`text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase shadow-lg ${isClientMode ? 'bg-[#005A8C]' : 'bg-blue-600'}`}>
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sales Pitch'}
              </button>
              <button onClick={() => generateAI('esg')} disabled={isAiLoading} className={`text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase shadow-lg ${isClientMode ? 'bg-orange-500' : 'bg-slate-700'}`}>Report ESG</button>
            </div>
          </div>
          {aiContent && (
            <div className={`p-6 rounded-[32px] border animate-in fade-in duration-500 ${isClientMode ? 'bg-white border-blue-100 text-slate-800' : 'bg-white/5 border-white/10 text-white'}`}>
              <div className="flex items-start gap-4 italic font-medium leading-relaxed">
                <MessageSquareQuote className={`w-6 h-6 shrink-0 ${isClientMode ? 'text-blue-500' : 'text-blue-400'}`} />
                <p>"{aiContent}"</p>
              </div>
            </div>
          )}
        </section>

        {/* PROPOSTA COMMERCIALE */}
        <div className={`rounded-[56px] overflow-hidden border shadow-2xl transition-all ${isClientMode ? 'bg-white border-slate-100' : 'bg-[#0a0c12] border-white/5 shadow-black'}`}>
          <div className={`p-10 text-white flex justify-between items-center ${isClientMode ? 'bg-gradient-to-br from-[#8EBCD6] to-[#005A8C]' : 'bg-blue-700'}`}>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1">Certificato di Sanificazione</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-90">Protocollo {calcs.productName}</p>
            </div>
            <div className="text-right bg-white/20 px-5 py-2 rounded-2xl border border-white/30 backdrop-blur-md font-black text-xs">
              ID-{inputVal}
            </div>
          </div>
          
          <div className="p-8 md:p-12 space-y-10 text-inherit text-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-inherit">
              <div className={`p-10 rounded-[48px] border-2 text-center transition-all ${isClientMode ? 'bg-slate-50 border-slate-100 shadow-inner' : 'bg-black border-white/5 text-white'}`}>
                <span className="text-[10px] font-black uppercase block mb-2 tracking-widest opacity-40">Valore dell'Intervento</span>
                <span className="text-2xl line-through opacity-30 block mb-1">€ {calcs.prezzoPieno.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <span className="text-6xl font-black block tracking-tighter">€ {calcs.prezzoScontato.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <div className={`mt-4 inline-block bg-emerald-600 text-white text-[11px] font-black px-6 py-2 rounded-full uppercase`}>
                  Risparmio: {calcs.scontoApplicato}%
                </div>
              </div>
              <div className={`p-10 rounded-[48px] text-white text-center shadow-2xl flex flex-col justify-center transform hover:scale-[1.03] transition-all bg-gradient-to-br ${isClientMode ? 'from-[#005A8C] to-indigo-900' : 'from-emerald-500 to-teal-600'}`}>
                <span className="text-[11px] font-black opacity-90 uppercase block mb-2 tracking-widest">Investimento Netto Reale</span>
                <span className="text-6xl font-black tracking-tighter">€ {calcs.costoNettoCliente.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <p className="text-[10px] mt-4 font-black opacity-80 uppercase tracking-widest bg-white/20 py-2 rounded-full px-4 text-white">Bonus Fiscale 50% Incluso</p>
              </div>
            </div>

            {/* BOX METRICHE SPECIFICHE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className={`p-6 rounded-[32px] border transition-all text-center ${isClientMode ? 'bg-white border-slate-100' : 'bg-white/5 border-white/10'}`}>
                {calcs.isIndoor ? <Wind className="w-8 h-8 mx-auto mb-3 text-blue-500" /> : <BarChart3 className="w-8 h-8 mx-auto mb-3 text-blue-500" />}
                <span className="text-2xl font-black block">{calcs.isIndoor ? '99.9%' : '12 MESI'}</span>
                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">{calcs.isIndoor ? 'Purezza Aria' : 'Break-Even'}</span>
              </div>
              <div className={`p-6 rounded-[32px] border transition-all text-center ${isClientMode ? 'bg-white border-slate-100' : 'bg-white/5 border-white/10'}`}>
                <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-orange-500" />
                <span className="text-2xl font-black block">H24/7</span>
                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">Protezione Attiva</span>
              </div>
              <div className={`p-6 rounded-[32px] border transition-all text-center ${isClientMode ? 'bg-white border-slate-100' : 'bg-white/5 border-white/10'}`}>
                <Leaf className="w-8 h-8 mx-auto mb-3 text-emerald-500" />
                <span className="text-2xl font-black block">{calcs.alberi}</span>
                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">Impatto ESG</span>
              </div>
            </div>
          </div>
        </div>

        {/* GESTIONALE PARTNER (ONLY IN DARK MODE) */}
        {!isClientMode && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
            <section className="bg-slate-900 p-10 rounded-[56px] border border-white/10 shadow-inner text-white">
              <h2 className="text-[11px] font-black uppercase opacity-50 mb-10 flex items-center gap-4 text-blue-400 tracking-[0.4em] font-black"><Percent className="w-6 h-6" /> Analisi Costi Operativi</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col justify-between shadow-2xl">
                  <div>
                    <div className="flex items-center gap-3 mb-4"><Truck className="w-6 h-6 text-blue-400" /><span className="text-[10px] font-black opacity-50 uppercase text-white">Prodotti ReAir</span></div>
                    <p className="text-4xl font-black">€ {calcs.costoProdottoNetto.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] opacity-40 uppercase font-bold mt-4 tracking-wider">Quantità: {calcs.litri}L</span>
                </div>
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col justify-between shadow-2xl">
                  <div>
                    <div className="flex items-center gap-3 mb-4"><HardHat className="w-6 h-6 text-orange-400" /><span className="text-[10px] font-black opacity-50 uppercase text-white">Squadra Posa</span></div>
                    <p className="text-4xl font-black">€ {calcs.costoPosa.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] opacity-40 uppercase font-bold mt-4 tracking-wider">Lavorazione mq: {calcs.mqTotali.toLocaleString()}</span>
                </div>
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col justify-between shadow-2xl text-white">
                  <div>
                    <div className="flex items-center gap-3 mb-4"><Wallet className="w-6 h-6 text-emerald-400" /><span className="text-[10px] font-black opacity-50 uppercase text-white">Provvigione</span></div>
                    <p className="text-4xl font-black">€ {calcs.provvigioneValore.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] opacity-40 uppercase font-bold mt-4 tracking-wider">Quota 7% Protetta</span>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 text-white p-14 rounded-[64px] border border-white/5 shadow-2xl relative overflow-hidden text-center">
               <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 blur-[120px]"></div>
               <h2 className="text-[11px] font-black uppercase opacity-50 mb-12 tracking-widest"><Briefcase className="w-6 h-6 inline mr-3" /> Utile Netto Società</h2>
               <div className="text-8xl font-black text-emerald-400 mb-14 tracking-tighter">€ {calcs.utileTotale.toLocaleString()} <span className="text-sm opacity-50 font-black ml-6 uppercase text-white tracking-widest">(40% NET)</span></div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-white">
                 <div className="bg-white/5 p-10 rounded-[48px] border border-white/10">
                   <span className="text-[11px] opacity-40 block uppercase mb-3 font-black tracking-widest text-slate-300">Socio A (50%)</span>
                   <span className="text-4xl font-black text-white">€ {calcs.utileSocio.toLocaleString()}</span>
                 </div>
                 <div className="bg-white/5 p-10 rounded-[48px] border border-white/10">
                   <span className="text-[11px] opacity-40 block uppercase mb-3 font-black tracking-widest text-slate-300">Socio B (50%)</span>
                   <span className="text-4xl font-black text-white">€ {calcs.utileSocio.toLocaleString()}</span>
                 </div>
               </div>
            </section>
          </div>
        )}

        <div className="text-center pt-12 pb-16">
          <button onClick={() => window.location.reload(true)} className={`text-[10px] font-black uppercase tracking-[0.3em] border px-10 py-4 rounded-3xl transition-all ${isClientMode ? 'text-slate-400 border-slate-200 hover:bg-slate-100' : 'text-slate-50 border-white/10 hover:bg-white/5'}`}>
            Sync ReAir Engine 2026
          </button>
        </div>
      </main>

      <footer className={`text-center py-16 text-[10px] font-black tracking-[0.6em] uppercase transition-all ${isClientMode ? 'text-slate-400' : 'text-slate-600'}`}>
        ReAir S.R.L. | Milano 2026 | Nanotechnology Business Unit
      </footer>
    </div>
  );
};

export default App;
