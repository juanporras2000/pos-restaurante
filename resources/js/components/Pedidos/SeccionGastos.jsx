import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { fmtCOP } from '../../utils/format';
import { TIPOS_GASTO } from './historialUtils';

export default function SeccionGastos({ gastos }) {
    const [expandida, setExpandida] = useState(false);
    const totalGastos = gastos.reduce((acc, g) => acc + Number.parseFloat(g.monto || 0), 0);

    if (gastos.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-red-100">

            {/* ── Cabecera clicable ── */}
            <button
                type="button"
                onClick={() => setExpandida((v) => !v)}
                className="w-full text-left p-4 flex items-center justify-between gap-3"
            >
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 text-red-600">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    </span>
                    <div>
                        <p className="font-semibold text-gray-900">Gastos del día</p>
                        <p className="text-sm text-gray-500">{gastos.length} gasto{gastos.length !== 1 ? 's' : ''} registrado{gastos.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-red-600">−{fmtCOP(totalGastos)}</span>
                    <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandida ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* ── Lista expandible ── */}
            {expandida && (
                <div className="border-t border-red-100 px-4 pb-4 pt-3 space-y-2">
                    {gastos.map((g) => {
                        const tipo = TIPOS_GASTO[g.tipo] ?? { label: g.tipo, color: 'bg-gray-100 text-gray-600' };
                        return (
                            <div key={g.id} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <span className={`mt-0.5 shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${tipo.color}`}>
                                        {tipo.label}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{g.descripcion}</p>
                                        {g.created_at && (
                                            <p className="text-xs text-gray-400">{new Date(g.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                                        )}
                                    </div>
                                </div>
                                <span className="shrink-0 text-sm font-bold text-red-600 ml-3">{fmtCOP(Number.parseFloat(g.monto))}</span>
                            </div>
                        );
                    })}

                    <div className="flex justify-between items-center pt-2 border-t border-red-100 font-semibold">
                        <span className="text-gray-700">Total gastos</span>
                        <span className="text-red-600">{fmtCOP(totalGastos)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
