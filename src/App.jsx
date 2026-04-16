// src/App.jsx
import React, { useState, useMemo } from 'react';
import { calculateTotals } from './logic/finance';
import { ManagerView } from './components/ManagerView';
import { ClientView } from './components/ClientView';

// --- FONTE DATI PRODOTTI ---
// In futuro, questo array potrà essere popolato tramite una chiamata API dal backend
const PRODUCTS = [
  { 
    id: 'rm20', 
    name: 'RM 20 Outdoor', 
    cat: 'outdoor', 
    yield: 40, 
    price: 399, 
    disc: 0.30, 
    tech: 'Nanotecnologia TiO2 anatasio. Vetrificazione covalente autopulente e fotocatalisi estrema per l\'abbattimento di smog e polveri sottili.' 
  },
  { 
    id: 'pa_plus', 
    name: 'PhotoActive Plus', 
    cat: 'outdoor', 
    yield: 60, 
    price: 195, 
    disc: 0.00, 
    tech: 'Catalizzatore antistatico fotovoltaico industriale. Prevenzione soiling e mantenimento resa energetica stabile al 100%.' 
  },
  { 
    id: 'wall', 
    name: 'Wall Indoor', 
    cat: 'indoor', 
    yield: 50, 
    price: 245, 
    disc: 0.35, 
    tech: 'Ioni d’argento Active. Sanificazione H24 certificata ISO 22196 contro batteri e virus in ambienti chiusi.' 
  },
  { 
    id: 'air', 
    name: 'PhotoActive Air', 
    cat: 'indoor', 
    yield: 45, 
    price: 280, 
    disc: 0.30, 
    tech: 'Nanostruttura porosa avanzata per la decomposizione molecolare di inquinanti gassosi VOC, formaldeide e NOx indoor.' 
  }
];

export default function App() {
  // --- STATI GLOBALI ---
  
  // 1. Navigazione: gestisce lo switch tra le due pagine
  const [view, setView] = useState('manager'); // 'manager' (Socio) o 'client' (Preventivo)
  
  // 2. Dati Cliente: centralizzati per facilitare il futuro salvataggio al backend
  const [customer, setCustomer] = useState({ 
    name: "", 
    kwp: 100, 
    mq: 500, 
    type: 'outdoor' 
  });

  // 3. Selezione: quali prodotti il socio decide di includere nel preventivo
  const [activeProducts, setActiveProducts] = useState(['rm20', 'pa_plus']);

  // 4. Configurazione: parametri operativi della commessa
  const [settings, setSettings] = useState({ 
    cycle: 24, 
    labor: 'partner' 
  });

  // --- CALCOLO TOTALI ---
  // Memoizzato: ricalcola i prezzi e il ROI solo se cambiano i parametri di input.
  // Utilizza la logica esportata dal file src/logic/finance.js
  const totals = useMemo(() => 
    calculateTotals(PRODUCTS, customer, settings), 
    [customer, settings]
  );

  return (
    <div className="antialiased font-sans bg-slate-950 min-h-screen">
      {/* LOGICA DI ROUTING:
        Se siamo in 'manager', mostra il gestionale socio.
        Altrimenti mostra il documento ufficiale per il cliente.
      */}
      {view === 'manager' ? (
        <ManagerView 
          setView={setView} 
          customer={customer} 
          setCustomer={setCustomer} 
          activeProducts={activeProducts} 
          setActiveProducts={setActiveProducts} 
          settings={settings} 
          setSettings={setSettings} 
          totals={totals} 
        />
      ) : (
        <ClientView 
          setView={setView} 
          customer={customer} 
          settings={settings} 
          setSettings={setSettings} 
          totals={totals} 
          activeProducts={activeProducts} 
        />
      )}
    </div>
  );
}
