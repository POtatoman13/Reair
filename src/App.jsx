import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Calculator, Leaf, BarChart3, Sparkles, Loader2, MessageSquare, 
  Shield, Briefcase, CheckCircle2, HardHat, Truck, Percent,
  Wind, School, Building2, Beaker, UserPlus, FileText,
  Clock, Zap, ShieldCheck, CheckSquare, Square, ChevronDown, SearchCheck,
  Users2, Landmark, Wallet, Layers, ArrowRight
} from 'lucide-react';

// --- CONFIGURAZIONE MODELLO AI ---
const AI_MODEL_ID = "gemini-2.5-flash-preview-09-2025"; 

// --- COMPONENTE LOGO REAIR ---
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
  const [inputVal, setInputVal] = useState(100); 
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
      
      // Se partner, costo applicazione assorbito (0). Se ReAir, +10€/mq. Indoor Partner sconta a 6.
      const applicationRate = laborType === 'reair' ? 10 : (p.category === 'outdoor' ? 0 : 6);
      const applicationCostSingle = mq * applicationRate;
      
      const posaTotaleSingle = cleaningCostSingle + applicationCostSingle;
      const costiViviSingle = matCostSingle + posaTotaleSingle;
      
      const multiplier = cycleMonths === 48 ? 2 : 1;
      
      // MARGINALITÀ 50% + 5% SEGNALATORE = Divisore 0.45
      let finalPrice = (costiViviSingle / 0.45) * multiplier; 

      if (cycleMonths === 48) finalPrice = finalPrice * (1 - SCONTO_ANTICIPO_48M);
      
      const margineLordoTotale = finalPrice - (costiViviSingle * multiplier);
      const provvSegnalatore = finalPrice * PROVVIGIONE_SEGNALATORE;
      const nettoPartner = margineLordoTotale - provvSegnalatore;
      
      return {
        ...p, mq, litri: litriSingle * multiplier,
        matCost: matCostSingle * multiplier, 
        labCost: posaTotaleSingle * multiplier, 
        cleaningRate, applicationRate, 
        finalPrice, margineLordoTotale, provvSegnalatore, nettoPartner,
        netPrice: finalPrice * 0.50,
        nox: (mq * 0.06 * multiplier).toFixed(1), 
        trees: Math.round(mq * 0.06 * multiplier * 2.4)
      };
    });
  }, [inputVal, cycleMonths, laborType, selectedCategory]);

  return (
    <div className={`min-h-screen transition-all duration-700 overflow-x-hidden ${isClientMode ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}`}>
      
      {/* CSS OTTIMIZZATO PER "SALVA PDF" GOOGLE CON DESIGN ARANCIO/AZZURRO */}
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm 12mm; }
          nav, .no-print, .config-panel, footer { display: none !important; }
          body { background: white !important; color: #0f172a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; overflow: visible !important; }
          .print-container { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; border: none !important; }
          
          .print-doc-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-bottom: 4px solid #005A8C !important;
            padding-bottom: 8mm !important;
            margin-bottom: 12mm !important;
          }

          .quote-card {
            display: block !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 2px solid #f1f5f9 !important;
            margin-bottom: 12mm !important;
            padding: 25px !important;
            border-radius: 20px !important;
            background: #ffffff !important;
          }

          .price-summary-box {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            padding: 20px !important;
            border-radius: 15px !important;
            margin-top: 20px !important;
          }

          .net-box {
            background-color: #f97316 !important;
            color: white !important;
            padding: 15px !important;
            border-radius: 12px !important;
            text-align: center !important;
          }

          h3 { font-size: 24pt !important; color: #005A8C !important; font-weight: 900 !important; margin-bottom: 5px !important; }
          .highlight-blue { color: #005A8C !important; font-weight: 900 !important; }
        }
        .print-doc-header { display: none; }
      `}</style>

      {/* NAVBAR */}
      <nav className={`no-print sticky top-0 z-50 border-b p-4 flex justify-between items-center transition-all ${isClientMode ? 'bg-white/95 border-slate-200 backdrop-blur-md shadow-sm' : 'bg-slate-950/90 border-white/10 backdrop-blur-xl'}`}>
        <LogoReAir isClientMode={isClientMode} />
        <div className="flex gap-4 items-center">
          <button onClick={() => setIsClientMode(!isClientMode)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase shadow-lg transition-all active:scale-95 border-2 ${isClientMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-white'}`}>
            {isClientMode ? 'GESTIONALE SOCI' : 'VISTA CLIENTE'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-10 space-y-10 pb-32 print-container text-inherit">
        
        {/* PDF HEADER */}
        <div className="print-doc-header">
          <LogoReAir isClientMode={true} />
          <div className="text-right text-[#0f172a]">
            <p className="font-black text-xl uppercase tracking-tighter text-[#005A8C]">Proposta Tecnica ReAir</p>
            <p className="text-xs font-bold opacity-60 italic">Data emissione: {new Date().toLocaleDateString('it-IT')}</p>
          </div>
        </div>

        {/* PANNELLO CONFIGURAZIONE */}
        {!isClientMode && (
          <section className="no-print config-panel p-8 rounded-[40px] border bg-slate-900 border-white/10 shadow-2xl space-y-12 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase opacity-40 flex items-center gap-2 tracking-widest text-inherit"><UserPlus className="w-4 h-4 text-blue-400"/> Ragione Sociale Cliente</label>
                  <input type="text" placeholder="Nome Azienda..." value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-transparent border-b-2 border-white/10 py-2 text-xl font-black outline-none focus:border-blue-500 transition-all text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase opacity-40 block mb-4 tracking-widest">Squadra Operativa:</span>
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => setLaborType('reair')} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${laborType === 'reair' ? 'border-blue-500 bg-blue-500/20' : 'border-white/5 opacity-40'}`}>
                      <div className="text-left"><span className="text-[10px] font-black block uppercase text-inherit">Team ReAir</span><span className="text-[9px] opacity-60 text-inherit">+10€/mq Application</span></div>
                      <HardHat className={laborType === 'reair' ? 'text-blue-400' : 'text-white'} />
                    </button>
                    <button onClick={() => setLaborType('partner')} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${laborType === 'partner' ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/5 opacity-40'}`}>
                      <div className="text-left"><span className="text-[10px] font-black block uppercase italic text-inherit">Partner Advantage</span><span className="text-[9px] opacity-60 text-inherit">Costo ottimizzato</span></div>
                      <Users2 className={laborType === 'partner' ? 'text-emerald-400' : 'text-white'} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[11px] font-black uppercase opacity-40 block tracking-widest text-inherit">Dimensioni Intervento</label>
                <div className="flex gap-2">
                  <button onClick={() => {setSelectedCategory('outdoor'); setActiveProducts(['rm20', 'pa_plus']);}} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedCategory === 'outdoor' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-white/5 opacity-30 text-white'}`}>Outdoor (kWp)</button>
                  <button onClick={() => {setSelectedCategory('indoor'); setActiveProducts(['wall', 'air']);}} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedCategory === 'indoor' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-white/5 opacity-30 text-white'}`}>Indoor (mq)</button>
                </div>
                <div className="pt-4">
                  <input type="number" value={inputVal} onChange={(e) => setInputVal(Number(e.target.value))} className="w-full bg-transparent border-b-2 border-blue-500 py-2 text-6xl font-black outline-none text-white" />
                  <p className="text-[10px] font-bold opacity-30 uppercase mt-4 text-white">
                    {selectedCategory === 'outdoor' ? `Proporzione reale: ~${inputVal * MQ_PER_KW}mq` : `Superficie pareti/soffitti`}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase opacity-40 block tracking-widest text-inherit">Prodotti Attivi</label>
                <div className="grid grid-cols-1 gap-2">
                  {PRODUCTS_DATA.filter(p => p.category === selectedCategory).map(p => (
                    <button key={p.id} onClick={() => toggleProduct(p.id)} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${activeProducts.includes(p.id) ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/5 opacity-30 text-slate-500'}`}>
                      <span className="text-[10px] font-black uppercase text-inherit">{p.name}</span>
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
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#005A8C] leading-none italic">{customerName || "Davide Salvadeo"}</h2>
            </div>
            <div className="bg-[#005A8C] text-white px-10 py-6 rounded-[24px] shadow-2xl border border-white/20 text-center min-w-[200px]">
              <span className="text-[10px] font-black uppercase opacity-60 block mb-1">Ciclo del Protocollo</span>
              <p className="text-3xl md:text-4xl font-black">{cycleMonths} MESI</p>
            </div>
          </div>
        </div>

        {/* ELENCO PRODOTTI PREVENTIVO */}
        <div className="space-y-16 text-inherit">
          {calcs.filter(p => activeProducts.includes(p.id)).map((p) => (
            <div key={p.id} className="quote-card group transition-all duration-500 hover:border-[#8EBCD6] border-2 border-slate-100 p-12 rounded-[64px] bg-white">
              <div className="flex flex-col lg:flex-row gap-12 items-start justify-between text-inherit">
                
                {/* PARTE TECNICA */}
                <div className="flex-1 text-inherit">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#005A8C] text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest leading-none">Nanotecnologia Attiva</span>
                    <span className="text-[#8EBCD6] font-black text-[10px] uppercase tracking-widest">{p.category} Business Unit</span>
                  </div>
                  <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#005A8C] leading-none mb-6 italic">{p.name}</h3>
                  
                  <div className="p-6 rounded-2xl flex items-center gap-6 border border-blue-100 bg-blue-50/50 text-[#005A8C] mb-8 shadow-sm">
                    <SearchCheck className="w-12 h-12 shrink-0 text-[#f97316]" />
                    <div className="text-inherit">
                      <p className="text-sm font-black leading-none uppercase tracking-tighter text-inherit">Sopralluogo Tecnico Annuo Incluso</p>
                      <p className="text-[10px] font-medium opacity-70 mt-1 italic text-inherit">Verifica dell'efficacia molecolare al 12° mese con report tecnico certificato.</p>
                    </div>
                  </div>

                  <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-600 text-justify mb-8">
                    {p.tech} Il protocollo ReAir trasforma molecolarmente le superfici preservando la resa energetica e riducendo drasticamente i costi di manutenzione ordinaria.
                  </p>

                  <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100 text-inherit">
                    <div className="flex items-center gap-4 text-inherit">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner text-inherit"><Leaf className="w-6 h-6" /></div>
                      <div className="flex flex-col text-inherit"><span className="text-2xl font-black text-slate-900 leading-none text-inherit">{p.trees}</span><span className="text-[10px] font-black uppercase text-slate-400 text-inherit">Alberi Equivalenti</span></div>
                    </div>
                    <div className="flex items-center gap-4 text-inherit">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner text-inherit"><Wind className="w-6 h-6" /></div>
                      <div className="flex flex-col text-inherit"><span className="text-2xl font-black text-slate-900 leading-none text-inherit">{p.nox}kg</span><span className="text-[10px] font-black uppercase text-slate-400 text-inherit">NOx Abbattuti</span></div>
                    </div>
                  </div>
                </div>

                {/* PARTE ECONOMICA */}
                <div className="w-full lg:w-[450px] shrink-0 text-inherit">
                  <div className="bg-white rounded-[32px] border-4 border-[#005A8C] p-8 shadow-2xl relative overflow-hidden text-inherit">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-inherit"><TrendingUp className="w-24 h-24 text-[#005A8C]" /></div>
                    
                    <div className="space-y-6 text-inherit">
                      <div className="text-center text-inherit">
                        <span className="text-[11px] font-black uppercase opacity-40 block mb-1 tracking-widest text-slate-500 text-inherit">Valore del Protocollo ({cycleMonths}m)</span>
                        <span className="text-4xl md:text-5xl font-black text-[#005A8C] italic leading-none text-inherit">€ {p.finalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100 text-inherit">
                        <span className="text-[10px] font-black text-slate-400 uppercase text-inherit">Agevolazione Fiscale 50%</span>
                        <span className="text-xl font-black text-[#005A8C] text-inherit">- € {p.netPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                      </div>

                      <div className="bg-[#f97316] p-8 rounded-[24px] text-white shadow-xl text-center transform hover:scale-[1.02] transition-transform text-inherit">
                        <span className="text-[12px] font-black uppercase opacity-80 block mb-2 tracking-widest text-white text-inherit">Investimento Netto d'Impresa Reale</span>
                        <div className="flex items-center justify-center gap-2 text-inherit">
                           <span className="text-6xl font-black leading-none text-white text-inherit">€ {p.netPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                        </div>
                        <p className="text-[10px] mt-4 font-bold opacity-90 uppercase tracking-widest border-t border-white/20 pt-4 text-white text-inherit">
                           Recupero totale garantito in 14-16 mesi
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3 px-4 text-inherit">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 text-inherit" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-tight text-inherit">
                      Proposta conforme ai parametri di efficientamento energetico e sanificazione ambientale 2026.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DASHBOARD PARTNER (SOLO SOCI) */}
        {!isClientMode && (
          <section className="no-print bg-slate-900 p-12 rounded-[64px] border border-white/10 shadow-2xl space-y-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[150px] -z-10 text-inherit text-inherit"></div>
            <div className="flex justify-between items-center border-b border-white/5 pb-8 text-inherit">
              <h2 className="text-[18px] font-black uppercase text-blue-400 tracking-[0.5em] flex items-center gap-6 text-inherit"><Calculator className="w-10 h-10 text-inherit" /> Profit Analysis V39.5</h2>
              <div className="text-right text-inherit"><span className="text-3xl font-black text-[#f97316] text-inherit">MARGINE 50% + 5% FEE</span></div>
            </div>
            <div className="overflow-x-auto text-inherit text-inherit">
              <table className="w-full text-left text-[14px] text-inherit">
                <thead className="opacity-40 uppercase font-black text-white border-b border-white/5 text-inherit">
                  <tr>
                    <th className="pb-8 text-inherit">Prodotto</th>
                    <th className="pb-8 text-inherit">1. Incasso Cliente</th>
                    <th className="pb-8 text-orange-200 text-inherit">2. Costi Vivi</th>
                    <th className="pb-8 text-blue-200 text-inherit">3. Provv. Segnalatore</th>
                    <th className="pb-8 text-right text-emerald-400 text-inherit">4. Netto Partner</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-white text-inherit">
                  {calcs.map(p => (
                    <tr key={p.id} className={`border-t border-white/5 transition-colors ${!activeProducts.includes(p.id) ? 'opacity-10' : ''} text-inherit`}>
                      <td className="py-8 text-blue-400 font-black text-xl text-inherit text-inherit">{p.name}</td>
                      <td className="py-8 text-inherit text-inherit">€ {p.finalPrice.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      <td className="py-8 text-orange-200 text-inherit">€ {p.labCost.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="opacity-40">Sq.</span></td>
                      <td className="py-8 text-blue-200 text-inherit">€ {p.provvSegnalatore.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="opacity-40">5%</span></td>
                      <td className="py-8 text-emerald-400 text-right text-3xl font-black text-inherit">€ {p.nettoPartner.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <footer className={`no-print text-center py-24 text-[10px] font-black opacity-30 uppercase tracking-[1em] border-t border-current border-opacity-5 ${isClientMode ? 'text-slate-400 border-slate-200' : 'text-slate-600 border-white/10'}`}>
        ReAir S.R.L. | Milano Headquarters | Maintenance Protocol 2026
      </footer>
    </div>
  );
};

export default App;
