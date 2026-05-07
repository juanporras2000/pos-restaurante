import React from 'react';
import { TIPOS, fmt } from './constants';

export default function ResumenTarjetas({ gastos, total, apertura }) {
    const montoApertura = apertura ? parseFloat(apertura.monto) : null;
    const totalGastos   = isNaN(parseFloat(total)) ? 0 : parseFloat(total);
    const disponible    = montoApertura != null ? montoApertura - totalGastos : null;

    const resumenPorTipo = TIPOS.map((t) => ({
        ...t,
        subtotal: gastos.filter((g) => g.tipo === t.value).reduce((s, g) => s + parseFloat(g.monto), 0),
    })).filter((t) => t.subtotal > 0);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total gastos */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm col-span-2 md:col-span-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total gastos</p>
                <p className="text-2xl font-bold text-red-600">{fmt(totalGastos)}</p>
                <p className="text-xs text-gray-400 mt-1">{gastos.length} gasto{gastos.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Disponible en caja (solo si hay apertura) */}
            {disponible != null && (
                <div className={`bg-white rounded-xl border-2 ${disponible >= 0 ? 'border-green-300' : 'border-red-300'} p-4 shadow-sm col-span-2 md:col-span-1`}>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Disponible en caja</p>
                    <p className={`text-2xl font-bold ${disponible >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fmt(disponible)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Base − Gastos</p>
                </div>
            )}

            {/* Subtotal por tipo */}
            {resumenPorTipo.map((t) => (
                <div key={t.value} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.label}</p>
                    <p className="text-xl font-bold text-gray-800">{fmt(t.subtotal)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${t.color}`}>{t.label}</span>
                </div>
            ))}
        </div>
    );
}
