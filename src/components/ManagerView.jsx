             <div className="overflow-x-auto mt-6">
               <table className="w-full text-left text-sm border-collapse">
                 <thead className="opacity-40 uppercase font-black border-b border-white/10 text-white">
                   <tr>
                     <th className="pb-4 pl-4">Soluzione</th>
                     <th className="pb-4">Incasso</th>
                     <th className="pb-4 text-right pr-4 text-orange-500">Utile Soci</th>
                   </tr>
                 </thead>
                 <tbody className="font-bold text-white">
                   {totals.filter(p => p.cat === customer.type).map(p => {
                     const isActive = activeProducts.includes(p.id);
                     return (
                       <tr 
                         key={p.id} 
                         onClick={() => toggleProduct(p.id)}
                         className={`cursor-pointer transition-all border-b border-white/5 hover:bg-white/5 ${
                           isActive 
                             ? 'bg-blue-900/30 border-l-4 border-l-blue-500' 
                             : 'opacity-50 grayscale'
                         }`}
                       >
                         <td className="py-5 pl-4">
                           <div className="flex items-center gap-4 text-left">
                             <div className={`p-1 rounded-md transition-all ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white/10 text-slate-500'}`}>
                               {isActive ? <CheckCircle2 className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                             </div>
                             <span className={`text-lg font-black ${isActive ? 'text-blue-300' : 'text-slate-400'}`}>
                               {p.name}
                             </span>
                           </div>
                         </td>
                         <td className="py-5 text-slate-300">
                           € {p.clientPrice.toLocaleString(undefined, {maximumFractionDigits:0})}
                         </td>
                         <td className={`py-5 text-right text-2xl tracking-tighter italic pr-4 ${isActive ? 'text-orange-400' : 'text-slate-500'}`}>
                           € {p.profit.toLocaleString(undefined, {maximumFractionDigits:0})}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
