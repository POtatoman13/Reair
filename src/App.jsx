import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, BarChart3, Sparkles, Loader2, MessageSquare, 
  Shield, Briefcase, CheckCircle2, HardHat, Truck, Percent,
  Wind, School, Building2, Beaker, Printer, UserPlus, FileText,
  Clock, Zap, ShieldCheck, CheckSquare, Square, ChevronDown, SearchCheck,
  Users2, Wallet, ArrowRightLeft
} from 'lucide-react';

// --- CONFIGURAZIONE MODELLO AI ---
const AI_MODEL_ID = "gemini-2.5-flash-preview-09-2025"; 

// --- COMPONENTE LOGO REAIR ---
const LogoReAir = ({ isClientMode }) => (
  <div className="flex items-center gap-3">
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="45" fill="#8EBCD6" />
      <path d="M50 25C50 25 30 45 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 45 50 25 50 25Z" fill="white" />
      <path d="M50 80V35" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 65L65 55" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 55L35 45" stroke="#8EBCD6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <div className="flex flex-col leading-none text-left text-inherit">
      <span className={`text-2xl font-black tracking-tighter ${isClientMode ? 'text-[#005A8C]' : 'text-white'}`}>
        RE<span className="font-light italic">air</span>
      </span>
      <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${isClientMode ? 'text-slate-400' : 'text-blue-300/60'}`}>
        air-health technology
      </span>
    </div>
  </div>
);

const App = () => {
  const apiKey = ""; 

  const PRODUCTS_DATA = [
    { 
      id: 'rm20', name: 'Clean Coating RM 20', category: 'outdoor', yield: 40, price: 399, discount: 0.30, 
      tech: 'Nanotecnologia TiO2 anatasio. Legame covalente silanico per superfici autopulenti.'
    },
    { 
      id: 'pa_plus', name: 'PhotoActive Plus', category: 'outdoor', yield: 60, price: 195, discount: 0.00, 
      tech: 'Catalizzatore fotocatalitico antistatico per la prevenzione del soiling fotovoltaico industriale.'
    },
    { 
      id: 'wall', name: 'ReAir Wall Indoor', category: 'indoor', yield: 50, price: 245, discount: 0.35, 
      tech: 'Ioni d’argento + semiconduttori LED active. Efficacia sanificante certificata ISO 22196.'
    },
    { 
      id: 'air', name: 'PhotoActive Air', category: 'indoor', yield: 45, price: 280, discount: 0.30, 
      tech: 'Nanostruttura porosa avanzata per la decomposizione molecolare di inquinanti gassosi VOC.'
    }
  ];

  const [inputVal, setInputVal] = useState(100);
  const [customerName, setCustomerName] = useState("");
  const [isClientMode, setIsClientMode] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('outdoor'); 
  const [activeProducts, setActiveProducts] = useState(['pa_plus']);
  const [cycleMonths, setCycleMonths] = useState(24);
  const [laborType, setLaborType] = useState('partner'); 

  // --- COSTANTI DA TUO SCHEMA ---
  const PROVVIGIONE_SEGNALATORE = 0.05; // 5% come da tuo esempio
  const MQ_PER_KW = 5.0; // 500mq / 100kW = 5mq/kW
  const SCONTO_ANTICIPO_48M = 0.15;

  const toggleProduct = (id) => {
    setActiveProducts(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const getCleaningLaborRate = (val) => {
    if (val <= 50) return 18;
    if (val <= 100) return 15;
    if (val <= 300) return 10;
    return 8;
  };

  const calcs = useMemo(() => {
    return PRODUCTS_DATA.map(p => {
      const mq = p.category === 'outdoor' ? inputVal * MQ_PER_KW : inputVal;
      const litriSingle = Math.ceil(mq / p.yield);
      const matCostSingle = litriSingle * (p.price * (1 - p.discount));
      
      const cleaningRate = p.category === 'outdoor' ? getCleaningLaborRate(inputVal) : 0;
      const cleaningCostSingle = inputVal * cleaningRate;
      
      // LOGICA PUNTO DI INCONTRO: Se partner, il costo applicazione è incluso nella pulizia (0€ extra)
      const applicationRate = laborType === 'reair' ? 10 : 0;
      const applicationCostSingle = mq * applicationRate;
      
      const posaTotaleSingle = cleaningCostSingle + applicationCostSingle;
      const costiViviSingle = matCostSingle + posaTotaleSingle;
      
      const multiplier = cycleMonths === 48 ? 2 : 1;
      
      // Calcolo Prezzo Finale per mantenere Margine Lordo ~45.7% (Divisore 0.543)
      // Incasso = Costi / 0.543
      let finalPrice = (costiViviSingle / 0.543) * multiplier;

      if (cycleMonths === 48) finalPrice = finalPrice * (1 - SCONTO_ANTICIPO_48M);
      
      const margineLordo = finalPrice - (costiViviSingle * multiplier);
      const provvSegnalatore = finalPrice * PROVVIGIONE_SEGNALATORE;
      const nettoPartner = margineLordo - provvSegnalatore;
      
      return {
        ...p, mq, litri: litriSingle * multiplier,
        matCost: matCostSingle * multiplier, 
        labCost: posaTotaleSingle * multiplier, 
        cleaningRate, applicationRate, 
        finalPrice, 
        margineLordo,
        provvSegnalatore,
        nettoPartner,
        netPrice: finalPrice * 0.50, // Per vista cliente
        nox: (mq * 0.06 * multiplier).toFixed(1), 
        trees: Math.round(mq * 0.06 * multiplier * 2.4)
      };
    });
  }, [inputVal, cycleMonths, laborType]);

  const generateAI = async (mode) => {
    setIsLoading(true); setAiResponse("");
    const selectedList = calcs.filter(p => activeProducts.includes(p.id));
    const prompt = `Direttore ReAir. Fornisci un ${mode} professionale per: ${selectedList.map(p => p.name).join(", ")}. Nota: Margine Partner garantito, detrazione 50%.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL_ID}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "Errore AI.");
    } catch (e) { setAiResponse("Errore connessione."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 overflow-x-hidden ${isClientMode ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}`}>
      
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          nav, .no-print, button, footer { display: none !important; }
          body { background: white !important; color: #0f172a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; overflow: visible !important; }
          .print-container { padding: 0 !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
          .quote-card { 
            display: flex !important; flex-direction: row !important; align-items: flex-start !important; justify-content: space-between !important;
            gap: 30px !important; border: 2px solid #f1f5f9 !important; break-inside: avoid !important; page-break-inside: avoid !important;
            margin-bottom: 30px !important; background: white !important; border-radius: 30px !important; padding: 30px !important; width: 100% !important;
          }
          .quote-card-main { flex: 1 !important; }
          .quote-card-prices { width: 340px !important; flex-shrink: 0 !important; }
          .print-header-top { display: flex !important; justify-content: space-between; align-items: center; border-bottom: 3px solid #005A8C !important; padding-bottom: 15px; margin-bottom: 30px; }
          .client-box { border: 2px dashed #005A8C !important; background: #f8fafc !important; color: #0f172a !important; margin-bottom: 30px !important; }
          .bg-[#005A8C] { background-color: #005A8C !important; color: white !important; }
          .text-[#005A8C] { color: #005A8C !important; }
          h3, h2 { color: #005A8C !important; }
        }
        .print-header-top { display: none; }
      `}</style>

      {/* HEADER APP */}
      <div className="no-print text-white text-[9px] font-black text-center py-1.5 uppercase tracking-[0.5em] flex items-center justify-center gap-2 bg-[#005A8C] border-b border-white/10">
        <ShieldCheck className="w-3 h-3" /> ReAir Quote Engine V36.0 - Partner Profit Sync
      </div>

      <nav className={`no-print sticky top-0 z-50 border-b p-4 flex justify-between items-center transition-all ${isClientMode ? 'bg-white/90 border-slate-200 backdrop-blur-md shadow-sm' : 'bg-slate-950/80 border-white/10 backdrop-blur-xl'}`}>
        <LogoReAir isClientMode={isClientMode} />
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-lg hover:bg-emerald-700 transition-all">
            <Printer className="w-4 h-4" /> PDF PREVENTIVO
          </button>
          <button onClick={() => setIsClientMode(!isClientMode)} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase shadow-lg transition-all active:scale-95 border-2 ${isClientMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-white'}`}>
            {isClientMode ? 'ACCEDI AL GESTIONALE' : 'VISTA CLIENTE'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 pb-32 print-container text-inherit">
        
        {/* PDF HEADER */}
        <div className="print-header-top">
           <LogoReAir isClientMode={true} />
           <div className="text-right">
             <h1 className="font-black text-2xl text-[#005A8C] uppercase m-0 tracking-tighter">Proposta Tecnica ReAir</h1>
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Dipartimento Nanotecnologie 2026</p>
             <p className="text-[11px] font-black text-slate-900 mt-1 text-inherit">Data: {new Date().toLocaleDateString('it-IT')}</p>
           </div>
        </div>

        {/* CONFIGURAZIONE (Admin Only) */}
        {!isClientMode && (
          <section className="no-print p-8 rounded-[48px] border bg-slate-900 border-white/10 shadow-2xl space-y-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-inherit">
              <div className="space-y-8 text-inherit">
                <div>
                  <label className="text-[11px] font-black uppercase opacity-40 flex items-center gap-2 tracking-widest mb-4">
                    <UserPlus className="w-4 h-4 text-blue-400"/> Ragione Sociale Cliente
                  </label>
                  <input type="text" placeholder="Nome Azienda..." value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-transparent border-b-2 border-white/10 py-3 text-2xl font-black outline-none focus:border-blue-500 text-white placeholder:opacity-20" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase opacity-40 block mb-4 tracking-widest">Squadra & Posa:</span>
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => setLaborType('reair')} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${laborType === 'reair' ? 'border-blue-500 bg-blue-500/20' : 'border-white/5 opacity-40'}`}>
                      <div className="text-left">
                        <span className="text-[10px] font-black block uppercase">Esperti ReAir</span>
                        <span className="text-[9px] opacity-60">kWp + 10€/mq Application</span>
                      </div>
                      <HardHat className={laborType === 'reair' ? 'text-blue-400' : 'text-white'} />
                    </button>
                    <button onClick={() => setLaborType('partner')} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${laborType === 'partner' ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/5 opacity-40'}`}>
                      <div className="text-left">
                        <span className="text-[10px] font-black block uppercase italic">Partner Advantage</span>
                        <span className="text-[9px] opacity-60">Solo Tariffa kWp (Tutto Incl.)</span>
                      </div>
                      <Users2 className={laborType === 'partner' ? 'text-emerald-400' : 'text-white'} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                 <label className="text-[11px] font-black uppercase opacity-40 flex items-center gap-2 tracking-widest mb-5">
                  <CheckSquare className="w-4 h-4 text-emerald-400"/> Tecnologie nel Preventivo
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {PRODUCTS_DATA.map(p => (
                    <button key={p.id} onClick={() => toggleProduct(p.id)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${activeProducts.includes(p.id) ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/5 opacity-30 text-slate-500'}`}>
                      <span className="text-[11px] font-black uppercase tracking-tight">{p.name}</span>
                      {activeProducts.includes(p.id) ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <Square className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <label className="text-[11px] font-black uppercase opacity-40 block tracking-widest mb-4">Dimensione Progetto</label>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedCategory('outdoor')} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedCategory === 'outdoor' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-white/5 opacity-30 text-white'}`}>Outdoor (kWp)</button>
                  <button onClick={() => setSelectedCategory('indoor')} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedCategory === 'indoor' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-white/5 opacity-30 text-white'}`}>Indoor (mq)</button>
                </div>
                <div className="pt-4">
                  <input type="number" value={inputVal} onChange={(e) => setInputVal(Number(e.target.value))} className="w-full bg-transparent border-b-2 border-blue-500 py-2 text-6xl font-black outline-none text-white" />
                  <p className="text-[9px] font-bold opacity-30 uppercase mt-4 text-white">Area Stimata: ~{MQ_PER_KW * inputVal}mq | Pulizia: {getCleaningLaborRate(inputVal)}€/kWp</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BOX CLIENTE HEADER */}
        <div className={`client-box p-10 rounded-[40px] border-2 border-dashed transition-all ${isClientMode ? 'border-slate-200 bg-slate-50 text-slate-900 shadow-sm' : 'border-white/10 bg-white/5 text-white'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex-1">
              <span className="text-[11px] font-black uppercase opacity-40 block tracking-[0.3em] mb-3 text-inherit">Documentazione predisposta per:</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-inherit leading-none">{customerName || "Gentile Cliente"}</h2>
            </div>
            <div className="bg-[#005A8C] text-white px-10 py-6 rounded-[32px] shadow-2xl border border-white/20 text-center min-w-[220px]">
              <span className="text-[10px] font-black uppercase opacity-60 block mb-1 tracking-widest text-white">Protocollo ReAir</span>
              <p className="text-3xl md:text-4xl font-black text-white">{cycleMonths} MESI</p>
            </div>
          </div>
        </div>

        {/* SCHEDE PREVENTIVO */}
        <div className="grid grid-cols-1 gap-12 text-inherit">
          {calcs.filter(p => activeProducts.includes(p.id)).map(p => (
            <div key={p.id} className={`quote-card p-12 rounded-[64px] border transition-all shadow-2xl flex flex-col md:flex-row gap-16 items-start overflow-hidden relative ${isClientMode ? 'bg-white border-slate-100 text-slate-900 shadow-sm' : 'bg-white/5 border-white/10 text-white'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8EBCD6]/10 rounded-bl-full -z-10 opacity-50 text-inherit"></div>
              
              <div className="quote-card-main flex-1 space-y-8 text-inherit">
                <div className="text-inherit">
                  <h3 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter ${isClientMode ? 'text-[#005A8C]' : 'text-blue-400'}`}>{p.name}</h3>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.5em] mt-3 tracking-widest text-inherit italic">Protocollo di Mantenimento Certificato 2026</p>
                </div>
                
                <div className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${isClientMode ? 'bg-blue-50 border-blue-200 text-[#005A8C]' : 'bg-blue-900/20 border-blue-500/30 text-blue-300'}`}>
                  <SearchCheck className="w-8 h-8 shrink-0 text-inherit" />
                  <div className="text-inherit">
                    <p className="text-sm font-bold text-inherit leading-none">Sopralluogo Tecnico Incluso (12° Mese)</p>
                    <p className="text-[10px] font-medium opacity-60 mt-1 text-inherit italic text-inherit">Verifica molecolare e report di efficienza post-applicazione.</p>
                  </div>
                </div>

                <p className="text-lg md:text-xl font-medium leading-relaxed opacity-80 text-inherit">
                  {p.tech} Il trattamento trasforma molecolarmente le superfici. Il protocollo prevede un intervento di mantenimento periodico ogni 24 mesi per preservare le prestazioni ai massimi livelli di efficacia testata.
                </p>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-current border-opacity-10 text-inherit">
                   <div className="flex items-center gap-3 text-inherit">
                     <Leaf className="w-6 h-6 text-emerald-500" />
                     <span className="text-sm font-black uppercase tracking-tight text-inherit text-inherit">{p.trees} Alberi Equivalenti</span>
                   </div>
                   <div className="flex items-center gap-3 text-inherit">
                     <Zap className="w-6 h-6 text-blue-500" />
                     <span className="text-sm font-black uppercase tracking-tight text-inherit text-inherit">Abbattimento NOx: {p.nox}kg</span>
                   </div>
                </div>
              </div>

              <div className="quote-card-prices w-full md:w-[420px] space-y-6 flex-shrink-0 text-inherit">
                <div className={`p-8 rounded-[36px] border text-center transition-all ${isClientMode ? 'bg-slate-50 border-slate-100 shadow-inner' : 'bg-black/40 border-white/5'}`}>
                   <span className="text-[11px] font-black uppercase opacity-40 block mb-2 tracking-[0.3em] text-inherit">Valore Protocollo ({cycleMonths} mesi)</span>
                   <span className="text-5xl font-black text-inherit leading-none italic">€ {p.finalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                </div>
                <div className={`p-10 rounded-[40px] text-white shadow-2xl text-center transform bg-gradient-to-br ${p.category === 'outdoor' ? 'from-[#005A8C] to-[#003A6C]' : 'from-emerald-600 to-teal-800'}`}>
                   <span className="text-[11px] font-black uppercase opacity-70 block mb-2 tracking-widest text-white/90">Investimento Netto d'Impresa Reale</span>
                   <span className="text-6xl font-black text-white leading-none">€ {p.netPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                   <p className="text-[10px] mt-6 font-bold opacity-90 uppercase tracking-widest text-white/80 border-t border-white/20 pt-4">Agevolazione Fiscale 50% Inclusa</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DASHBOARD SINTESI GESTIONE SOCIO (Solo Partner) */}
        {!isClientMode && (
          <section className="no-print bg-slate-900 p-12 rounded-[64px] border border-white/10 shadow-2xl space-y-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[150px] -z-10"></div>
            <div className="flex justify-between items-center border-b border-white/5 pb-12 text-inherit">
              <h2 className="text-[18px] font-black uppercase text-blue-400 tracking-[0.5em] flex items-center gap-6 text-inherit"><Calculator className="w-10 h-10" /> Sintesi Gestione Commessa V36</h2>
              <div className="text-right text-inherit">
                <span className="text-[11px] font-black opacity-30 uppercase block text-white tracking-widest mb-1">Fee Segnalazione</span>
                <span className="text-3xl font-black text-orange-400">{(PROVVIGIONE_SEGNALATORE*100).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="overflow-x-auto text-inherit">
              <table className="w-full text-left text-[14px] text-inherit">
                <thead className="opacity-40 uppercase font-black text-white tracking-[0.3em] border-b border-white/5 text-inherit">
                  <tr>
                    <th className="pb-12 text-inherit">Tecnologia</th>
                    <th className="pb-12 text-inherit">1. Incasso Cliente</th>
                    <th className="pb-12 text-inherit">2. Uscita Squadra</th>
                    <th className="pb-12 text-inherit">3. Uscita Prodotto</th>
                    <th className="pb-12 text-right text-inherit">Margine Netto Partner</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-white text-inherit">
                  {calcs.map(p => (
                    <tr key={p.id} className={`border-t border-white/5 group hover:bg-white/5 transition-colors ${!activeProducts.includes(p.id) ? 'opacity-10' : ''}`}>
                      <td className="py-12 text-blue-400 font-black text-2xl tracking-tighter text-inherit">{p.name}</td>
                      <td className="py-12 text-xl font-black text-inherit">€ {p.finalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      <td className="py-12 text-xl font-black text-inherit text-orange-200">
                        € {p.labCost.toLocaleString(undefined, {maximumFractionDigits:0})}
                        <div className="text-[10px] font-bold opacity-30 mt-1 uppercase text-inherit">Fascia: {p.cleaningRate}€/kW</div>
                      </td>
                      <td className="py-12 text-xl font-black text-inherit text-blue-200">
                        € {p.matCost.toLocaleString(undefined, {maximumFractionDigits:0})}
                        <div className="text-[10px] font-bold opacity-30 mt-1 uppercase text-inherit">Litri: {p.litri}L (~{p.mq.toFixed(0)}mq)</div>
                      </td>
                      <td className="py-12 text-emerald-400 text-right text-4xl font-black tracking-tighter text-inherit">
                        € {p.nettoPartner.toLocaleString(undefined, {maximumFractionDigits:0})}
                        <div className="text-[10px] font-bold opacity-50 uppercase text-inherit tracking-widest mt-1">Margine Lordo: €{p.margineLordo.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 text-inherit">
               <p className="text-xs font-medium opacity-60 italic leading-relaxed text-inherit">
                 *Il Margine Netto Partner è calcolato sottraendo dal Margine Lordo la fee del segnalatore ({PROVVIGIONE_SEGNALATORE*100}%). 
                 La logica "Partner Advantage" azzera il costo di applicazione al mq, lasciando solo la tariffa a kWp concordata con la squadra di pulizia.
               </p>
            </div>
          </section>
        )}
      </main>

      <footer className={`no-print text-center py-24 text-[11px] font-black opacity-30 uppercase tracking-[1em] border-t border-current border-opacity-5 ${isClientMode ? 'text-slate-400 border-slate-200' : 'text-slate-600 border-white/10'}`}>
        ReAir S.R.L. | Milano HQ | Maintenance Protocol 2026
      </footer>
    </div>
  );
};

export default App;
