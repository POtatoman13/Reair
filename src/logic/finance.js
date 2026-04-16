// src/logic/finance.js

// --- PARAMETRI FISSI DI BUSINESS ---
export const BUSINESS_LOGIC = {
  MQ_PER_KW: 5.0,              // Rapporto standard ReAir per pannelli 455Wp
  DIVISORE_MARGINALITA: 0.45,   // GARANTISCE: 50% Utile Soci + 5% Segnalatore
  FEE_SEGNALATORE: 0.05,       // 5% calcolato sull'incasso totale
  SCONTO_ANTICIPO_48M: 0.15,   // Sconto per chi paga 4 anni in anticipo
  LOSS_PRODUCTION_STIMATED: 0.15, // 15% di perdita causa sporco (senza ReAir)
  ENERGY_PRICE_KWH: 0.22,      // Valore commerciale medio dell'energia €/kWh
  KW_ANNUAL_YIELD: 1250        // Produzione media annua per ogni kWp installato
};

/**
 * Funzione core che calcola l'intera proposta commerciale
 */
export const calculateTotals = (products, customer, settings) => {
  return products.map(p => {
    // 1. Calcolo Superficie Reale
    const area = customer.type === 'outdoor' 
      ? customer.kwp * BUSINESS_LOGIC.MQ_PER_KW 
      : customer.mq;

    // 2. Calcolo Costi Materiale (Litri necessari)
    const liters = Math.ceil(area / p.yield);
    const productCost = liters * (p.price * (1 - p.disc));
    
    // 3. Calcolo Costi Posa (Pulizia + Applicazione)
    // Tariffe pulizia basate sulla tua tabella (18, 15, 10, 8 €/kW)
    const cleanRate = customer.type === 'outdoor' 
      ? (customer.kwp <= 50 ? 18 : customer.kwp <= 100 ? 15 : customer.kwp <= 300 ? 10 : 8) 
      : 0;
    const cleanCost = customer.type === 'outdoor' ? customer.kwp * cleanRate : 0;
    
    // Logica Applicazione: Partner = 0 extra (incluso in pulizia), ReAir = 10€/mq
    const appRate = settings.labor === 'reair' ? 10 : (p.cat === 'outdoor' ? 0 : 6);
    const laborCost = cleanCost + (area * appRate);
    
    // 4. Moltiplicatore Ciclo (24 o 48 mesi)
    const multiplier = settings.cycle === 48 ? 2 : 1;
    const totalBasicCosts = (productCost + laborCost) * multiplier;
    
    // 5. CALCOLO PREZZO FINALE (Target 50% Netto)
    let clientPrice = (totalBasicCosts / BUSINESS_LOGIC.DIVISORE_MARGINALITA);
    
    // Applica sconto finanziario se 48 mesi anticipati
    if (settings.cycle === 48) {
      clientPrice = clientPrice * (1 - BUSINESS_LOGIC.SCONTO_ANTICIPO_48M);
    }

    // 6. Ripartizione Margini
    const grossMargin = clientPrice - totalBasicCosts;
    const referralFee = clientPrice * BUSINESS_LOGIC.FEE_SEGNALATORE;
    const netProfitSoci = grossMargin - referralFee;

    // 7. CALCOLO ROI CLIENTE (Perché il cliente risparmia?)
    // Produzione annua persa (Euro) + Costo 2 pulizie evitate
    const annualEnergyValue = customer.kwp * BUSINESS_LOGIC.KW_ANNUAL_YIELD * BUSINESS_LOGIC.ENERGY_PRICE_KWH;
    const annualSavingProduction = annualEnergyValue * BUSINESS_LOGIC.LOSS_PRODUCTION_STIMATED;
    const annualSavingCleaning = cleanCost * 2;
    const totalAnnualSavings = annualSavingProduction + annualSavingCleaning;

    return {
      ...p,
      area,
      liters,
      productCost: productCost * multiplier,
      laborCost: laborCost * multiplier,
      clientPrice,
      netInvestment: clientPrice * 0.50, // Detrazione 50%
      profit: netProfitSoci,
      referralFee,
      totalAnnualSavings,
      paybackMonths: Math.round(((clientPrice * 0.50) / totalAnnualSavings) * 12),
      nox: (area * 0.06 * multiplier).toFixed(1),
      trees: Math.round(area * 0.06 * multiplier * 2.4)
    };
  });
};
