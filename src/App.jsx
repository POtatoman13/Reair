// src/App.jsx
import React, { useState, useMemo } from 'react';
import { calculateTotals } from './logic/finance.js';
import { ManagerView } from './components/ManagerView.jsx';
import { ClientView } from './components/ClientView.jsx';

// --- DATABASE PRODOTTI (ESTRAIBILE IN FUTURO DA UN BACKEND) ---
const PRODUCTS = [
  { 
    id: 'rm20', 
    name: 'RM 20 Outdoor', 
    cat: 'outdoor', 
    yield: 40, 
    price: 399, 
    disc: 0.30, 
    tech: 'Nanotecnologia TiO2 anatasio. Vetrificazione covalente autopulente e fotocatalisi estrema.' 
  },
  { 
    id: 'pa_plus', 
    name: 'PhotoActive Plus', 
    cat: 'outdoor', 
    yield: 60, 
    price: 195, 
    disc: 0.00, 
    tech: 'Catalizzatore antistatico fotovoltaico industriale. Prevenzione soiling e mantenimento resa.' 
  },
  { 
    id: 'wall', 
    name: 'Wall Indoor', 
    cat: 'indoor', 
    yield: 50, 
    price: 245, 
    disc: 0.35, 
    tech: 'Ioni d’argento Active. Sanificazione H24 certificata ISO 22196 contro batteri e virus.' 
  },
  { 
    id: 'air', 
    name: 'PhotoActive Air', 
    cat: 'indoor', 
    yield: 45, 
    price: 280, 
    disc: 0.30, 
    tech: 'Nanostruttura porosa avanzata per la decomposizione molecolare di VOC e NOx.' 
  }
];

export default function App() {
  // --- 1. GESTIONE DELLA NAVIGAZIONE ---
  // Decidiamo se mostrare la vista socio ('manager') o quella cliente ('client')
  const [view, setView] = useState('manager'); 
  
  // --- 2. STATO DEI DATI (IL "CUORE" DEL PREVENTIVO) ---
  const [customer, setCustomer] = useState({ 
    name: "", 
    kwp: 100, 
    mq: 500, 
    type: 'outdoor' 
  });

  const [activeProducts, setActiveProducts] = useState(['rm20', 'pa_plus']);

  const [settings, setSettings] = useState({ 
    cycle: 24, 
    labor: 'partner' 
  });

  // --- 3. MOTORE DI CALCOLO ---
  // Usiamo useMemo per ricalcolare i prezzi solo quando cambiano i dati del cliente
  // Questo rende l'app velocissima e fluida durante la digitazione
  const totals = useMemo(() => 
    calculateTotals(PRODUCTS, customer, settings), 
    [customer, settings]
  );

  return (
    <div className="antialiased font-sans bg-slate-950 min-h-screen selection:bg-orange-500/30">
      {/* ROUTING LOGICO:
          Se lo stato 'view' è 'manager', montiamo il Gestionale Socio.
          Se lo stato 'view' è 'client', montiamo il Documento Cliente.
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
