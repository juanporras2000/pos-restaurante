import React, { useState } from 'react';
import { ChevronDownIcon, BanknotesIcon, CreditCardIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { fmtCOP } from '../../utils/format';
import { calcularVentasPorMetodo, METODO_ETIQUETA } from './historialUtils';

export default function CierreCaja({ pedidos, gastos, apertura }) {
    const [expandido, setExpandido] = useState(false);

    const porMetodo       = calcularVentasPorMetodo(pedidos);
    const totalVentas     = pedidos.reduce((acc, p) => acc + Number.parseFloat(p.total || 0), 0);
    const totalGastos     = gastos.reduce((acc, g) => acc + Number.parseFloat(g.monto || 0), 0);
    const montoApertura   = Number.parseFloat(apertura?.monto || 0);
    const ventasEfectivo  = porMetodo['efectivo'] ?? 0;
    const ventasDigitales = totalVentas - ventasEfectivo;
    const saldoCajaFisica = montoApertura + ventasEfectivo - totalGastos;

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg text-white">

            {/* ── Cabecera clicable ── */}
            <button
                type="button"
                onClick={() => setExpandido((v) => !v)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
            >
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                        <CalculatorIcon className="h-5 w-5 text-white" />
                    </span>
                    <div>
                        <p className="font-bold text-lg leading-tight">Cierre de Caja</p>
                        <p className="text-sm text-slate-400">Resumen de efectivo y totales</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-green-400">{fmtCOP(saldoCajaFisica)}</p>
                    <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* ── Detalle expandible ── */}
            {expandido && (
                <div className="border-t border-white/10 px-5 pb-5 pt-4 space-y-5">

                    {/* Bloque: Caja física */}
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="flex items-center gap-2 text-xs text-gray-300 mb-3 font-semibold uppercase tracking-wide">
                            <BanknotesIcon className="h-4 w-4 text-green-400" />
                            Caja física (efectivo)
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-300">
                                <span>Base de apertura</span>
                                <span className="font-medium text-white">+{fmtCOP(montoApertura)}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Ventas en efectivo</span>
                                <span className="font-medium text-white">+{fmtCOP(ventasEfectivo)}</span>
                            </div>
                            {totalGastos > 0 && (
                                <div className="flex justify-between text-slate-300">
                                    <span>Gastos pagados</span>
                                    <span className="font-medium text-red-400">−{fmtCOP(totalGastos)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold">
                                <span className="text-white">= Total en caja</span>
                                <span className={`text-lg ${saldoCajaFisica >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {fmtCOP(saldoCajaFisica)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bloque: Dinero digital */}
                    {ventasDigitales > 0 && (
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="flex items-center gap-2 text-xs text-gray-300 mb-3 font-semibold uppercase tracking-wide">
                                <CreditCardIcon className="h-4 w-4 text-blue-400" />
                                Dinero digital (tarjeta / Nequi)
                            </p>
                            <div className="space-y-2 text-sm">
                                {Object.entries(porMetodo)
                                    .filter(([m]) => m !== 'efectivo')
                                    .map(([metodo, monto]) => (
                                        <div key={metodo} className="flex justify-between text-slate-300">
                                            <span>{METODO_ETIQUETA[metodo] ?? metodo}</span>
                                            <span className="font-medium text-white">{fmtCOP(monto)}</span>
                                        </div>
                                    ))}
                                <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold">
                                    <span className="text-white">= Total digital</span>
                                    <span className="text-lg text-blue-400">{fmtCOP(ventasDigitales)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resultado neto final */}
                    <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                        <p className="flex items-center gap-2 text-xs text-gray-300 mb-3 font-semibold uppercase tracking-wide">
                            <CalculatorIcon className="h-4 w-4 text-yellow-300" />
                            Resultado neto del día
                        </p>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-slate-300">
                                <span>
                                    Ventas efectivo
                                    {ventasDigitales > 0 && <span className="text-slate-400"> + digital</span>}
                                </span>
                                <span className="font-medium text-white">{fmtCOP(totalVentas)}</span>
                            </div>
                            {totalGastos > 0 && (
                                <div className="flex justify-between text-slate-300">
                                    <span>Gastos</span>
                                    <span className="font-medium text-red-400">−{fmtCOP(totalGastos)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-white/20 font-bold">
                                <span className="text-white">= Neto</span>
                                <span className={`text-2xl ${(totalVentas - totalGastos) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {fmtCOP(totalVentas - totalGastos)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
