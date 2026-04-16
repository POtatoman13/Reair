import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, BarChart3, Sparkles, Loader2, MessageSquare, 
  Shield, Briefcase, CheckCircle2, HardHat, Truck, Percent,
  Wind, School, Building2, Beaker, UserPlus, FileText,
  Clock, Zap, ShieldCheck, CheckSquare, Square, ChevronDown, SearchCheck,
  Users2, Landmark, Wallet, Layers
} from 'lucide-react';

// --- CONFIGURAZIONE MODELLO AI ---
const AI_MODEL_ID = "gemini-2.5-flash-preview-09-2025"; 

const LogoReAir = ({ isClientMode }) => (
  <div className="flex items-center gap-3">
    <svg width="45" height="45" viewBox="0 0 100 100" fill="none">
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
      <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${isClientMode ? 'text-slate-400' : 'text-blue-300/60'}`}>
        air-health technology
      </span>
    </div>
  </div>
);

const App = () => {
  const apiKey = ""; 

  // --- CATALOGO PRODOTTI REAIR ---
  const PRODUCTS_DATA = [
    { 
      id: 'rm20', name: 'Clean Coating RM 20', category: 'outdoor', yield: 40, price: 399, discount: 0.30, 
      tech: 'Nanotecnologia TiO2 anatasio. Legame covalente silanico per superfici vetrate autopulenti e fotocatalisi estrema per l\'abbattimento di smog e polveri sottili.'
    },
    { 
      id: 'pa_plus', name: 'PhotoActive Plus', category: 'outdoor', yield: 60, price: 195, discount: 0.00, 
      tech: 'Catalizzatore fotocatalitico antistatico per la prevenzione del soiling fotovoltaico industriale. Mantiene stabile la resa energetica nel tempo.'
    },
    { 
      id: 'wall', name: 'ReAir Wall Indoor', category: 'indoor', yield: 50, price: 245, discount: 0.35, 
      tech: 'Ioni d’argento + semiconduttori LED active. Efficacia sanificante certificata ISO 22196 attiva H24 contro batteri e virus in ambienti chiusi.'
    },
    { 
      id: 'air', name: 'PhotoActive Air', category: 'indoor', yield: 45, price: 280, discount: 0.30, 
      tech: 'Nanostruttura porosa avanzata per la decomposizione molecolare di inquinanti gassosi VOC, formaldeide e NOx in ambito civile e industriale.'
    }
  ];

  // --- STATI ---
  const [inputVal, setInputVal] = useState(100); // kWp per outdoor o mq per indoor
  const [customerName, setCustomerName] = useState("");
  const [isClientMode, setIsClientMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('outdoor'); 
  const [activeProducts, setActiveProducts] = useState(['rm20', 'pa_plus']);
  const [cycleMonths, setCycleMonths] = useState(24);
  const [laborType, setLaborType] = useState('partner'); 

  // --- COSTANTI BUSINESS ---
  const PROVVIGIONE_SEGNALATORE = 0.05; 
  const MQ_PER_KW = 5.0; 
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

  // --- LOGICA CALCOLI ---
  const calcs = useMemo(() => {
    return PRODUCTS_DATA.map(p => {
      const mq = p.category === 'outdoor' ? inputVal * MQ_PER_KW : inputVal;
      const litriSingle = Math.ceil(mq / p.yield);
      const matCostSingle = litriSingle * (p.price * (1 - p.discount));
      
      const cleaningRate = p.category === 'outdoor' ? getCleaningLaborRate(inputVal) : 0;
      const cleaningCostSingle = p.category === 'outdoor' ? inputVal * cleaningRate : 0;
      
      const applicationRate = laborType === 'reair' ? 10 : (p.category === 'outdoor' ? 0 : 6);
      const applicationCostSingle = mq * applicationRate;
      
      const posaTotaleSingle = cleaningCostSingle + applicationCostSingle;
      const costiViviSingle = matCostSingle + posaTotaleSingle;
      
      const multiplier = cycleMonths === 48 ? 2 : 1;
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
        finalPrice, margineLordo, provvSegnalatore, nettoPartner,
        netPrice: finalPrice * 0.50,
        nox: (mq * 0.06 * multiplier).toFixed(1), 
        trees: Math.round(mq * 0.06 * multiplier * 2.4)
      };
    });
  }, [inputVal, cycleMonths, laborType, selectedCategory]);

  return (
    <div className={`min-h-screen transition-all duration-700 ${isClientMode ? 'bg-white' : 'bg-slate-950 text-white'}`}>
      
      {/* CSS OTTIMIZZATO PER "STAMPA / SALVA PDF" GOOGLE */}
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm 12mm; }
          nav, .no-print, .config-panel, footer { display: none !important; }
          body { background: white !important; color: #000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; overflow: visible !important; }
          .print-container { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; border: none !important; }
          
          .print-doc-header {
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #005A8C;
            padding-bottom: 8mm;
            margin-bottom: 10mm;
          }

          .quote-card {
            display: block !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: none !important;
            border-bottom: 1px solid #e2e8f0 !important;
            margin-bottom: 12mm !important;
            padding-bottom: 8mm !important;
          }

          .price-table-pdf {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 5mm !important;
          }
          .price-table-pdf td { padding: 10px !important; border: 1px solid #e2e8f0 !important; }
          .price-table-pdf .label { background-color: #f8fafc !important; font-weight: 700 !important; font-size: 8pt !important; text-transform: uppercase; }
          .price-table-pdf .value { text-align: right !important; font-weight: 800 !important; font-size: 13pt !important; }
          .price-table-pdf .netto { background-color: #005A8C !important; color: white !important; }
          
          .esg-grid-print { display: flex !important; gap: 20px !important; margin-top: 10px !important; }
          h3 { font-size: 22pt !important; color: #005A8C !important; font-weight: 900 !important; }
        }
        .print-doc-header { display: none; }
      `}</style>

      {/* NAVBAR */}
      <nav className={`no-print sticky top-0 z-50 border-b p-4 flex justify-between items-center transition-all ${isClientMode ? 'bg-white/95 border-slate-200 backdrop-blur-md shadow-sm' : 'bg-slate-950/90 border-white/10 backdrop-blur-xl'}`}>
        <LogoReAir isClientMode={isClientMode} />
        <div className="flex gap-4 items-center">
          <p className={`text-[10px] font-bold uppercase tracking-widest hidden md:block ${isClientMode ? 'text-slate-400' : 'text-blue-300'}`}>
            Usa la funzione "Stampa" per il preventivo
          </p>
          <button onClick={() => setIsClientMode(!isClientMode)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase shadow-lg transition-all active:scale-95 border-2 ${isClientMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-white'}`}>
            {isClientMode ? 'TORNA AL GESTIONALE' : 'VISTA CLIENTE'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-10 space-y-10 pb-32 print-container text-inherit">
        
        {/* HEADER PDF */}
        <div className="print-doc-header">
          <LogoReAir isClientMode={true} />
          <div className="text-right text-[#0f172a]">
            <p className="font-black text-xl uppercase tracking-tighter">Proposta Tecnica ReAir</p>
            <p className="text-sm font-bold opacity-60">Rif: RE-{inputVal}-2026</p>
            <p className="text-sm font-bold opacity-60">Data: {new Date().toLocaleDateString('it-IT')}</p>
          </div>
        </div>

        {/* PANNELLO CONFIGURAZIONE (Partner Only) */}
        {!isClientMode && (
          <section className="no-print config-panel p-8 rounded-[40px] border bg-slate-900 border-white/10 shadow-2xl space-y-12 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Colonna 1: Cliente e Squadra */}
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase opacity-40 flex items-center gap-2 tracking-widest text-inherit"><UserPlus className="w-4 h-4 text-blue-400"/> Nome Cliente</label>
                  <input type="text" placeholder="Ragione sociale..." value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-transparent border-b-2 border-white/10 py-2 text-xl font-black outline-none focus:border-blue-500" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase opacity-40 block mb-4 tracking-widest">Squadra Applicativa:</span>
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => setLaborType('reair')} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${laborType === 'reair' ? 'border-blue-500 bg-blue-500/20' : 'border-white/5 opacity-40'}`}>
                      <div className="text-left"><span className="text-[10px] font-black block uppercase tracking-tighter">Team ReAir</span><span className="text-[9px] opacity-60">10€/mq Applicazione</span></div>
                      <HardHat className={laborType === 'reair' ? 'text-blue-400' : 'text-white'} />
                    </button>
                    <button onClick={() => setLaborType('partner')} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${laborType === 'partner' ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/5 opacity-40'}`}>
                      <div className="text-left"><span className="text-[10px] font-black block uppercase italic">Squadra Partner</span><span className="text-[9px] opacity-60">Costo ottimizzato</span></div>
                      <Users2 className={laborType === 'partner' ? 'text-emerald-400' : 'text-white'} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Colonna 2: Dimensionamento */}
              <div className="space-y-6">
                <label className="text-[11px] font-black uppercase opacity-40 block tracking-widest text-inherit">Parametri Progetto</label>
                <div className="flex gap-2">
                  <button onClick={() => {setSelectedCategory('outdoor'); setActiveProducts(['rm20', 'pa_plus']);}} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedCategory === 'outdoor' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 opacity-30'}`}>Outdoor (kWp)</button>
                  <button onClick={() => {setSelectedCategory('indoor'); setActiveProducts(['wall', 'air']);}} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedCategory === 'indoor' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 opacity-30'}`}>Indoor (mq)</button>
                </div>
                <div className="pt-4">
                  <input type="number" value={inputVal} onChange={(e) => setInputVal(Number(e.target.value))} className="w-full bg-transparent border-b-2 border-blue-500 py-2 text-6xl font-black outline-none text-white" />
                  <p className="text-[10px] font-bold opacity-30 uppercase mt-4">
                    {selectedCategory === 'outdoor' ? `Calcolato su ~${inputVal * MQ_PER_KW}mq complessivi` : `Superficie pareti/soffitti totale`}
                  </p>
                </div>
              </div>

              {/* Colonna 3: Prodotti */}
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase opacity-40 block tracking-widest text-inherit text-inherit">Selezione Catalogo</label>
                <div className="grid grid-cols-1 gap-2">
                  {PRODUCTS_DATA.filter(p => p.category === selectedCategory).map(p => (
                    <button key={p.id} onClick={() => toggleProduct(p.id)} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${activeProducts.includes(p.id) ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 opacity-30'}`}>
                      <span className="text-[10px] font-black uppercase">{p.name}</span>
                      {activeProducts.includes(p.id) ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BOX DESTINATARIO */}
        <div className={`p-10 rounded-[40px] border-2 border-dashed transition-all ${isClientMode ? 'border-slate-200 bg-slate-50 shadow-sm text-slate-900' : 'border-white/10 bg-white/5 text-white'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex-1">
              <span className="text-[11px] font-black uppercase opacity-40 block mb-2 tracking-[0.3em] text-inherit">Documentazione predisposta per:</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#005A8C] leading-none">{customerName || "Davide Salvadeo"}</h2>
            </div>
            <div className="bg-[#005A8C] text-white px-10 py-6 rounded-[24px] text-center min-w-[200px]">
              <span className="text-[10px] font-black uppercase opacity-60 block mb-1">Durata del Protocollo</span>
              <p className="text-3xl md:text-4xl font-black">{cycleMonths} MESI</p>
            </div>
          </div>
        </div>

        {/* ELENCO PRODOTTI PREVENTIVO */}
        <div className="space-y-20 text-inherit">
          {calcs.filter(p => activeProducts.includes(p.id)).map((p) => (
            <div key={p.id} className="quote-card text-inherit">
              <div className="flex flex-col md:flex-row gap-12 items-start justify-between text-inherit">
                <div className="flex-1 text-inherit">
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#005A8C] mb-2 text-inherit leading-none">{p.name}</h3>
                  <p className="text-[11px] font-bold opacity-40 uppercase tracking-[0.4em] mb-8 text-inherit">Maintenance & Sustainability Protocol 2026</p>
                  
                  <div className="p-5 rounded-2xl flex items-center gap-5 border border-blue-100 bg-blue-50 text-[#005A8C] mb-8 no-print md:flex">
                    <SearchCheck className="w-10 h-10 shrink-0" />
                    <div className="text-inherit">
                      <p className="text-sm font-black leading-none uppercase">Sopralluogo Tecnico Incluso (12° Mese)</p>
                      <p className="text-[10px] font-medium opacity-70 mt-1 italic text-inherit">Verifica molecolare e report di efficienza certificato post-applicazione.</p>
                    </div>
                  </div>

                  <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-600 text-inherit text-justify">
                    {p.tech} Il protocollo ReAir trasforma molecolarmente le superfici per preservare la pulizia e la resa dell'asset. Il ciclo prevede un richiamo periodico ogni 24 mesi per mantenere attiva l'efficacia fotocatalitica e microbiologica certificata.
                  </p>

                  <div className="esg-grid-print grid grid-cols-2 gap-8 py-8 border-t border-slate-100 mt-6 text-inherit no-print md:grid">
                    <div className="flex items-center gap-4 text-emerald-600 font-black uppercase text-xs text-inherit">
                      <Leaf className="w-8 h-8" /> {p.trees} Alberi Eq.
                    </div>
                    <div className="flex items-center gap-4 text-blue-600 font-black uppercase text-xs text-inherit">
                      <Zap className="w-8 h-8" /> {p.nox}kg NOx Abbattuti
                    </div>
                  </div>
                </div>

                {/* TABELLA PREZZI PDF (BLINDATA) */}
                <div className="w-full md:w-[420px] shrink-0 text-inherit">
                  <table className="price-table-pdf w-full text-inherit">
                    <tbody className="text-inherit">
                      <tr className="text-inherit">
                        <td className="label text-inherit">Valore Intervento ({cycleMonths}m)</td>
                        <td className="value text-[#005A8C] text-inherit font-black italic">€ {p.finalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      </tr>
                      <tr className="text-inherit">
                        <td className="label text-inherit">Agevolazione Fiscale d'impresa</td>
                        <td className="value text-emerald-600 text-inherit">- 50%</td>
                      </tr>
                      <tr className="text-inherit">
                        <td className="label netto text-inherit text-white font-bold">Investimento Netto Reale</td>
                        <td className="value netto text-white font-black text-2xl">€ {p.netPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl no-print md:block">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-tight">
                       *Il costo netto considera il recupero fiscale tramite credito d'imposta per efficientamento energetico o sanificazione.
                     </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DASHBOARD PARTNER (SOLO SOCI) */}
        {!isClientMode && (
          <section className="no-print bg-slate-900 p-12 rounded-[56px] border border-white/10 shadow-2xl space-y-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[150px] -z-10"></div>
            <div className="flex justify-between items-center border-b border-white/5 pb-8 text-inherit">
              <h2 className="text-[18px] font-black uppercase text-blue-400 tracking-[0.5em] flex items-center gap-6 text-inherit"><Calculator className="w-10 h-10 text-inherit" /> Profit Summary V38.0</h2>
              <div className="text-right text-inherit"><span className="text-3xl font-black text-orange-400 text-inherit">Margine Lordo 45.7%</span></div>
            </div>
            <div className="overflow-x-auto text-inherit">
              <table className="w-full text-left text-[13px] text-inherit">
                <thead className="opacity-40 uppercase font-black text-white border-b border-white/5 text-inherit">
                  <tr>
                    <th className="pb-8">Prodotto</th>
                    <th className="pb-8">1. Incasso Cliente</th>
                    <th className="pb-8 text-orange-200">2. Uscita Squadra</th>
                    <th className="pb-8 text-blue-200">3. Uscita Prodotto</th>
                    <th className="pb-8 text-right text-emerald-400">4. Netto Partner</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-white text-inherit">
                  {calcs.map(p => (
                    <tr key={p.id} className={`border-t border-white/5 transition-colors ${!activeProducts.includes(p.id) ? 'opacity-10' : ''} text-inherit`}>
                      <td className="py-8 text-blue-400 font-black text-xl text-inherit">{p.name}</td>
                      <td className="py-8 text-inherit">€ {p.finalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      <td className="py-8 text-orange-200 text-inherit">€ {p.labCost.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      <td className="py-8 text-blue-200 text-inherit">€ {p.matCost.toLocaleString(undefined, {maximumFractionDigits:0})} <div className="text-[9px] opacity-30 uppercase">{p.litri}L (~{p.mq.toFixed(0)}mq)</div></td>
                      <td className="py-8 text-emerald-400 text-right text-3xl font-black text-inherit">€ {p.nettoPartner.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <footer className={`no-print text-center py-20 text-[10px] font-black opacity-30 uppercase tracking-[1em] border-t border-current border-opacity-5 ${isClientMode ? 'text-slate-400 border-slate-200' : 'text-slate-600 border-white/10'}`}>
        ReAir S.R.L. | Milano HQ | Maintenance Protocol 2026
      </footer>
    </div>
  );
};

export default App;
