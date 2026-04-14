import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, Sun, Sparkles, Loader2, 
  MessageSquare, Shield, Clock, Briefcase, Eye, EyeOff, Compass, RefreshCw
} from 'lucide-react';

const App = () => {
  // --- CONFIGURAZIONE GEMINI API ---
  const apiKey = "AIzaSyBhaSB7be2AZmzk-EjjzRaH4VDUZd5V3So"; 
  const MODEL_NAME = "gemini-1.5-flash";

  // --- PARAMETRI BUSINESS ---
  const MQ_PER_KW = 6.5; 
  const COSTO_POSA_MQ = 10; 
  const BONUS_FEDELTA_MESI = 48; // Rinominato da "vincolo"
  const CICLO_PROTEZIONE = 24;   // Rinominato da "durata"

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
    
    // Margine Soci 40% + Agente 7% (Divisore 0.53)
    const prezzoScontato = costiVivi / 0.53;
    const utileTotale = prezzoScontato - costiVivi - (prezzoScontato * 0.07);
    
    // Logica Sconti Commerciali (Visibili al cliente)
    const scontoFirmaPerc = bonusFirma ? 0.05 : 0;
    const scontoFedeltaPerc = bonusFedeltaAttivo ? 0.02 : 0;
    const prezzoPieno = prezzoScontato / (1 - (scontoFirmaPerc + scontoFedeltaPerc));

    return {
      mq: mqTotali,
      prezzo: prezzoScontato,
      prezzoPieno: prezzoPieno,
      utile: utileTotale,
      nettoAlCliente: prezzoScontato * 0.50,
      nox: (kwp * 0.388).toFixed(1),
      alberi: Math.round(kwp * 0.388 * 2.4)
    };
  }, [kwp, selectedProductId, bonusFirma, bonusFedeltaAttivo]);

  const generateAI = async (type) => {
    if (!apiKey) { setAiContent("ERRORE: API Key non trovata."); return; }
    setIsAiLoading(true); setAiContent("");
    
    const prompt = type === 'pitch' 
      ? `Sei un esperto ReAir. Scrivi un pitch di vendita IRRESISTIBILE (2-3 righe) per un impianto da ${kwp}kWp. Usa parole come "Bonus", "Opportunità", "Vantaggio fiscale". Il trattamento garantisce 24 mesi di extra-resa. Prezzo netto: €${calcs.nettoAlCliente.toLocaleString()}.`
      : `Dati ambientali: ${calcs.nox}kg NOx abbattuti e ${calcs.alberi} alberi equivalenti. Scrivi un report ESG che faccia sentire il cliente un eroe dell'ambiente.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Errore Google");
      setAiContent(data.candidates?.[0]?.content?.parts?.[0]?.text || "Riprova.");
    } catch (e) {
      setAiContent(`Diagnostica: ${e.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-all ${isClientMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* BOLLINO VIOLA V12 */}
      <div className="bg-violet-700 text-white text-[10px] font-black text-center py-1 uppercase tracking-widest flex items-center justify-center gap-2">
        <RefreshCw className="w-3 h-3" /> 
        Versione 12.0 - Bonus Fedeltà Smart - Se non vedi il viola, non è aggiornato!
      </div>

      <nav className={`sticky top-0 z-30 border-b px-4 py-3 flex justify-between items-center ${isClientMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-2">
          <Sun className="text-violet-600 w-5 h-5" />
          <h1 className="text-sm font-black uppercase tracking-tighter text-inherit">ReAir <span className="text-violet-600">Strategy</span></h1>
        </div>
        <button onClick={() => setIsClientMode(!isClientMode)} className="bg-violet-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-lg shadow-violet-500/20 active:scale-95 transition-all">
          {isClientMode ? 'DASHBOARD PARTNER' : 'VISTA CLIENTE'}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
        
        {/* CONFIGURAZIONE */}
        <section className={`p-6 rounded-3xl border ${isClientMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="space-y-6 text-inherit">
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 mb-2 block tracking-widest text-inherit">Dimensione Progetto (kWp)</label>
              <input type="number" value={kwp} onChange={(e) => setKwp(Number(e.target.value))} className="w-full bg-transparent border-b-2 border-violet-600 py-2 text-3xl font-black outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.values(PRODUCTS).map(p => (
                <button key={p.id} onClick={() => setSelectedProductId(p.id)} className={`p-3 rounded-2xl border-2 text-left transition-all ${selectedProductId === p.id ? 'border-violet-600 bg-violet-600/10' : 'border-transparent bg-slate-100/50'}`}>
                  <span className="font-black text-[11px] block text-inherit">{p.name}</span>
                  <span className="text-[9px] opacity-60 uppercase font-bold text-inherit">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => setBonusFirma(!bonusFirma)} className={`p-3 rounded-xl border-2 font-black text-[9px] uppercase transition-all ${bonusFirma ? 'border-green-500 text-green-600 bg-green-500/5' : 'border-slate-200 opacity-40'}`}>
                🎁 Bonus Firma -5%
              </button>
              <button onClick={() => setBonusFedeltaAttivo(!bonusFedeltaAttivo)} className={`p-3 rounded-xl border-2 font-black text-[9px] uppercase transition-all ${bonusFedeltaAttivo ? 'border-violet-600 text-violet-600 bg-violet-600/5' : 'border-slate-200 opacity-40'}`}>
                ⭐ Bonus Fedeltà -2%
              </button>
            </div>
          </div>
        </section>

        {/* AI PANEL */}
        <section className={`p-6 rounded-3xl border-2 ${isClientMode ? 'bg-slate-900 border-violet-900' : 'bg-white border-violet-100'}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase text-violet-600 flex items-center gap-2"><Sparkles className="w-4 h-4 animate-pulse" /> ReAir Sales Assistant</span>
            <div className="flex gap-2">
              <button onClick={() => generateAI('pitch')} disabled={isAiLoading} className="bg-violet-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase flex items-center gap-2 shadow-md active:scale-95">
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Pitch'}
              </button>
              <button onClick={() => generateAI('esg')} disabled={isAiLoading} className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase shadow-md active:scale-95">Impact</button>
            </div>
          </div>
          {aiContent && <div className="p-4 bg-violet-500/5 rounded-2xl border border-violet-500/20 text-inherit text-sm italic">"{aiContent}"</div>}
        </section>

        {/* PROPOSTA CLIENTE */}
        <div className={`rounded-[40px] overflow-hidden border shadow-2xl ${isClientMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="p-8 bg-violet-700 text-white flex justify-between items-center">
            <div><h2 className="text-2xl font-black tracking-tighter uppercase">Soluzione ReAir</h2><p className="text-[10px] opacity-70 font-bold uppercase tracking-widest text-white">Programma Protezione {CICLO_PROTEZIONE} mesi</p></div>
            <div className="text-right bg-white/10 px-4 py-1 rounded-xl border border-white/20"><span className="text-[10px] font-black block">CONVENZIONE</span><span className="font-bold text-sm uppercase">{BONUS_FEDELTA_MESI} MESI</span></div>
          </div>
          
          <div className="p-8 space-y-8 text-inherit">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-3xl border-2 text-center ${isClientMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                <span className="text-[10px] font-black opacity-30 uppercase block mb-1">Costo Chiavi in Mano</span>
                <span className="text-lg line-through opacity-20 block">€ {calcs.prezzoPieno.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <span className={`text-4xl font-black block ${isClientMode ? 'text-white' : 'text-slate-900'}`}>€ {calcs.prezzo.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
              <div className="p-8 bg-emerald-600 rounded-[32px] text-white text-center shadow-xl flex flex-col justify-center transform hover:scale-[1.02] transition-transform">
                <span className="text-[10px] font-black opacity-70 uppercase block mb-1">Investimento Netto Reale</span>
                <span className="text-5xl font-black tracking-tighter">€ {calcs.nettoAlCliente.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                <p className="text-[9px] mt-2 font-black opacity-60 uppercase tracking-[0.2em]">Post-Detrazione Fiscale 50%</p>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border ${isClientMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase opacity-40">Analisi Recupero Investimento</span>
                <span className="text-violet-600 font-black text-xs uppercase tracking-tighter">Break-Even Stimato: 16 Mesi</span>
              </div>
              <div className="h-24 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                  <path d="M 0 190 L 200 150 L 400 110" fill="none" stroke="#7c3aed" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="200" cy="150" r="10" fill="#7c3aed" className="animate-pulse" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-violet-500/5 rounded-3xl border border-violet-500/10">
                <Leaf className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <span className="text-2xl font-black block text-inherit">{calcs.alberi}</span>
                <span className="text-[9px] opacity-40 uppercase font-black text-inherit">Alberi Equivalenti</span>
              </div>
              <div className="text-center p-5 bg-violet-500/5 rounded-3xl border border-violet-500/10">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                <span className="text-2xl font-black block text-inherit">+15%</span>
                <span className="text-[9px] opacity-40 uppercase font-black text-inherit">Extra Resa Stimata</span>
              </div>
            </div>
          </div>
        </div>

        {/* MARGINI PARTNER (RISERVATI) */}
        {!isClientMode && (
          <section className="bg-slate-900 text-white p-8 rounded-[40px] border border-white/5 shadow-2xl">
            <h2 className="text-[10px] font-black uppercase opacity-50 mb-6 flex items-center gap-2 text-violet-400"><Briefcase className="w-4 h-4" /> Partner Margin Analysis</h2>
            <div className="text-5xl font-black text-emerald-400 mb-8 tracking-tighter">€ {calcs.utile.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-xs opacity-50 font-black ml-2 uppercase text-white">Profitto Netto Società (40%)</span></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5"><span className="text-[9px] opacity-40 block uppercase mb-1 font-black">Socio A (50%)</span><span className="text-xl font-black text-white">€ {(calcs.utile/2).toLocaleString(undefined, {maximumFractionDigits:0})}</span></div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5"><span className="text-[9px] opacity-40 block uppercase mb-1 font-black">Socio B (50%)</span><span className="text-xl font-black text-white">€ {(calcs.utile/2).toLocaleString(undefined, {maximumFractionDigits:0})}</span></div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-black opacity-30 uppercase tracking-[0.1em]">
               <div>Sconto mat. 30% | Posa 10€/mq | Agente 7%</div>
               <div className="text-violet-400 font-bold">RE-STRATEGY-V12</div>
            </div>
          </section>
        )}
      </main>

      <footer className="text-center py-10 text-[9px] font-black tracking-[0.4em] opacity-20 uppercase text-inherit">
        ReAir S.R.L. | Milano 2026 | Nanotechnology Business Unit
      </footer>
    </div>
  );
};

export default App;
