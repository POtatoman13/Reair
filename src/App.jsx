import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, Sun, Sparkles, Loader2, 
  MessageSquare, Shield, Clock, Briefcase, Eye, EyeOff, Compass
} from 'lucide-react';

const App = () => {
  // --- CONFIGURAZIONE GEMINI API ---
  // Incolla la tua chiave API tra le virgolette qui sotto
  const apiKey = "AIzaSyBhaSB7be2AZmzk-EjjzRaH4VDUZd5V3So"; 
  
  // Modello standard più compatibile al mondo
  const MODEL_NAME = "gemini-1.5-flash";

  // --- PARAMETRI BUSINESS REAIR 2026 ---
  const MQ_PER_KW = 6.5; 

  const PRODUCTS = {
    rm20: { id: 'rm20', name: 'Clean Coating RM 20', listPrice: 399, yield_mq_l: 40, sconto: 0.30, dur: '96+ mesi' },
    pa_plus: { id: 'pa_plus', name: 'PhotoActive Plus', listPrice: 195, yield_mq_l: 60, sconto: 0.25, dur: '48+ mesi' }
  };

  const [kwp, setKwp] = useState(300);
  const [selectedProductId, setSelectedProductId] = useState('rm20');
  const [isClientMode, setIsClientMode] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const calcs = useMemo(() => {
    const p = PRODUCTS[selectedProductId];
    const mq = kwp * MQ_PER_KW;
    const litri = Math.ceil(mq / p.yield_mq_l);
    const costi = (litri * (p.listPrice * (1 - p.sconto))) + ((litri * 6) * 40);
    const prezzoScontato = costi / 0.53;
    const utile = prezzoScontato - costi - (prezzoScontato * 0.07);
    return {
      prezzo: prezzoScontato,
      prezzoPieno: prezzoScontato / 0.93,
      utile: utile,
      netto: prezzoScontato * 0.50,
      nox: (kwp * 0.388).toFixed(1),
      alberi: Math.round(kwp * 0.388 * 2.4)
    };
  }, [kwp, selectedProductId]);

  const generateAI = async (type) => {
    if (!apiKey) { setAiContent("ERRORE: Incolla la chiave API su GitHub!"); return; }
    setIsAiLoading(true); setAiContent("");
    
    const prompt = type === 'pitch' 
      ? `Sei un venditore ReAir. Scrivi 2 righe veloci per vendere un trattamento fotovoltaico da ${kwp}kWp a €${calcs.netto.toLocaleString()} (prezzo netto dopo detrazione 50%). Sii molto convincente.`
      : `Scrivi 2 righe sull'impatto ESG: abbattimento di ${calcs.nox}kg di NOx e ${calcs.alberi} alberi equivalenti grazie a ReAir.`;

    try {
      // Endpoint v1beta: il più "morbido" e compatibile per le chiavi AI Studio
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Errore Server Google");
      
      setAiContent(data.candidates?.[0]?.content?.parts?.[0]?.text || "Risposta vuota, riprova.");
    } catch (e) {
      setAiContent(`DIAGNOSTICA: ${e.message}. Se l'errore persiste, prova a generare una NUOVA chiave su Google AI Studio.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans ${isClientMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* BOLLINO VERDE DI SUCCESSO V8 */}
      <div className="bg-emerald-600 text-white text-[10px] font-black text-center py-1 uppercase tracking-widest">
        Versione 8.0 - Sistema Semplificato (Stabile)
      </div>

      <nav className={`sticky top-0 z-30 border-b px-4 py-3 flex justify-between items-center ${isClientMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <Sun className="text-blue-600 w-5 h-5" />
          <h1 className="text-sm font-black uppercase">ReAir <span className="text-blue-600">Field</span></h1>
        </div>
        <button onClick={() => setIsClientMode(!isClientMode)} className="bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase">
          {isClientMode ? 'TORNA AL GESTIONALE' : 'VISTA CLIENTE'}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* INPUTS */}
        <section className={`p-6 rounded-3xl border ${isClientMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="space-y-6 text-inherit">
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">Potenza (kWp)</label>
              <input type="number" value={kwp} onChange={(e) => setKwp(Number(e.target.value))} className="w-full bg-transparent border-b-2 border-blue-600 py-2 text-3xl font-black outline-none focus:border-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(PRODUCTS).map(p => (
                <button key={p.id} onClick={() => setSelectedProductId(p.id)} className={`p-3 rounded-2xl border-2 text-left transition-all ${selectedProductId === p.id ? 'border-blue-600 bg-blue-600/10' : 'border-transparent bg-slate-100/50'}`}>
                  <span className="font-black text-[11px] block text-inherit">{p.name}</span>
                  <span className="text-[9px] opacity-60 uppercase font-bold text-inherit">{p.dur}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* AI PANEL */}
        <section className={`p-6 rounded-3xl border-2 ${isClientMode ? 'bg-slate-900 border-blue-900' : 'bg-white border-blue-100'}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Generator</span>
            <div className="flex gap-2">
              <button onClick={() => generateAI('pitch')} disabled={isAiLoading} className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase flex items-center gap-2">
                {isAiLoading && <Loader2 className="w-3 h-3 animate-spin" />} Pitch
              </button>
              <button onClick={() => generateAI('esg')} disabled={isAiLoading} className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase">ESG</button>
            </div>
          </div>
          {aiContent && <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20 text-inherit"><p className="text-sm italic font-medium">"{aiContent}"</p></div>}
        </section>

        {/* PROPOSTA */}
        <div className={`rounded-[40px] overflow-hidden border shadow-2xl ${isClientMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
            <div><h2 className="text-2xl font-black tracking-tighter uppercase">Offerta ReAir</h2><p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Digital Protection Strategy</p></div>
            <div className="font-mono font-bold opacity-30">RE-{kwp}</div>
          </div>
          
          <div className="p-8 space-y-8 text-inherit">
            <div className="space-y-4">
              <div className={`p-6 rounded-3xl border-2 text-center ${isClientMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-[10px] font-black opacity-30 uppercase block mb-1">Prezzo di Listino</span>
                <span className="text-lg line-through opacity-20">€ {calcs.prezzoPieno.toLocaleString()}</span>
                <span className="text-4xl font-black block">€ {calcs.prezzo.toLocaleString()}</span>
              </div>
              <div className="p-8 bg-green-600 rounded-[32px] text-white text-center shadow-xl">
                <span className="text-[10px] font-black opacity-60 uppercase block mb-1">Investimento Netto Reale</span>
                <span className="text-5xl font-black tracking-tighter">€ {calcs.netto.toLocaleString()}</span>
                <p className="text-[10px] mt-2 font-bold opacity-80 uppercase tracking-widest">Fisco 50% Incluso</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                <Leaf className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <span className="text-2xl font-black block text-inherit">{calcs.alberi}</span>
                <span className="text-[9px] opacity-40 uppercase font-black">Alberi Equiv.</span>
              </div>
              <div className="text-center p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <span className="text-2xl font-black block text-inherit">+15%</span>
                <span className="text-[9px] opacity-40 uppercase font-black">Resa Energia</span>
              </div>
            </div>
          </div>
        </div>

        {/* MARGINI PARTNER */}
        {!isClientMode && (
          <section className="bg-slate-900 text-white p-8 rounded-[40px] border border-white/5">
            <h2 className="text-[10px] font-black uppercase opacity-50 mb-6 flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-400" /> Internal Margins</h2>
            <div className="text-4xl font-black text-green-400 mb-8">€ {calcs.utile.toLocaleString()} <span className="text-xs opacity-50 font-bold ml-2">UTILE SOCI</span></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-white"><span className="text-[9px] opacity-40 block uppercase">Socio A</span><span className="text-lg font-black text-white">€ {(calcs.utile/2).toLocaleString()}</span></div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-white"><span className="text-[9px] opacity-40 block uppercase">Socio B</span><span className="text-lg font-black text-white">€ {(calcs.utile/2).toLocaleString()}</span></div>
            </div>
          </section>
        )}
      </main>

      <footer className="text-center py-10 text-[9px] font-black tracking-widest opacity-20 uppercase">
        ReAir S.R.L. | Versione 8.0 Stabile
      </footer>
    </div>
  );
};

export default App;
