// src/App.jsx
import React, { useState, useMemo } from 'react';
import { calculateTotals } from './logic/finance.js';

// Import basati esattamente sui nomi dei tuoi file nello screenshot
// NOTA: 'Managerview' e 'ClientView' sono importati dai rispettivi file
import { Managerview } from './components/Managerview'; 
import { ClientView } from './components/ClientView.jsx';

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
    tech: 'Catalizzatore antistatico fotovoltaico industriale. Prevenzione soiling e resa stabile.' 
  },
  { 
    id: 'wall', 
    name: 'Wall Indoor', 
    cat: 'indoor', 
    yield: 50, 
    price: 245, 
    disc: 0.35, 
    tech: 'Ioni d’argento Active. Sanificazione H24 certificata ISO 22196.' 
  },
  { 
    id: 'air', 
    name: 'PhotoActive Air', 
    cat: 'indoor', 
    yield: 45, 
    price: 280, 
    disc: 0.30, 
    tech: 'Nanostruttura porosa avanzata per decomposizione VOC e NOx indoor.' 
  }
];

export default function App() {
  const [view, setView] = useState('manager');
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

  const totals = useMemo(() => 
    calculateTotals(PRODUCTS, customer, settings), 
    [customer, settings]
  );

  return (
    <div className="antialiased font-sans bg-slate-950 min-h-screen">
      {view === 'manager' ? (
        <Managerview 
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
