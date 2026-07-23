import React from 'react';
import { fmtCOP } from '../../utils/format';
import { METODO_ETIQUETA, METODO_COLOR, calcularVentasPorMetodo } from './historialUtils';

export default function ResumenDia({ pedidos, gastos, apertura }) {
    const totalVentas   = pedidos.reduce((acc, p) => acc + Number.parseFloat(p.total || 0), 0);
    const totalGastos   = gastos.reduce((acc, g) => acc + Number.parseFloat(g.monto || 0), 0);
    const montoApertura = Number.parseFloat(apertura?.monto || 0);
    const resultadoNeto = totalVentas - totalGastos;

    const porMetodo       = calcularVentasPorMetodo(pedidos);
    const ventasEfectivo  = porMetodo['efectivo'] ?? 0;
    const ventasDigitales = totalVentas - ventasEfectivo;
    const saldoCajaFisica = montoApertura + ventasEfectivo - totalGastos;

    return (
        <div className="space-y-4 mb-6">

            {/* ── Fila 1: métricas globales ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 shadow-sm p-4 ${montoApertura > 0 ? 'border-green-200' : 'border-gray-200 dark:border-gray-700'}`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide mb-1">Base de apertura</p>
                    <p className="text-2xl font-bold text-green-600">{fmtCOP(montoApertura)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Dinero inicial en caja</p>
                    {apertura?.nota && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate italic">"{apertura.nota}"</p>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide mb-1">Total ventas</p>
                    <p className="text-2xl font-bold text-green-600">{fmtCOP(totalVentas)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} cerrado{pedidos.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 ${totalGastos > 0 ? 'border border-red-100' : 'border border-gray-200 dark:border-gray-700'}`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide mb-1">Total gastos</p>
                    <p className={`text-2xl font-bold ${totalGastos > 0 ? 'text-red-600' : 'text-gray-400 dark:text-gray-500'}`}>
                        {totalGastos > 0 ? `-${fmtCOP(totalGastos)}` : fmtCOP(0)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {gastos.length} gasto{gastos.length !== 1 ? 's' : ''} registrado{gastos.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 shadow-sm p-4 ${resultadoNeto >= 0 ? 'border-blue-200' : 'border-red-300'}`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide mb-1">Resultado neto</p>
                    <p className={`text-2xl font-bold ${resultadoNeto >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                        {fmtCOP(resultadoNeto)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Ventas − Gastos</p>
                </div>
            </div>

            {/* ── Fila 2: desglose por método + saldo físico ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Ingresos por método de pago */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide mb-3">
                        Ingresos por método de pago
                    </p>
                    <div className="space-y-2">
                        {Object.entries(porMetodo).map(([metodo, monto]) => {
                            const c = METODO_COLOR[metodo] ?? { dot: 'bg-gray-400', text: 'text-gray-700 dark:text-gray-300', badge: 'bg-gray-50 border-gray-200 dark:border-gray-700' };
                            return (
                                <div key={metodo} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${c.badge}`}>
                                    <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
                                        <span className="font-medium">{METODO_ETIQUETA[metodo] ?? metodo}</span>
                                        {metodo !== 'efectivo' && (
                                            <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">— no entra a caja física</span>
                                        )}
                                    </span>
                                    <span className={`font-bold ${c.text}`}>{fmtCOP(monto)}</span>
                                </div>
                            );
                        })}
                        {Object.keys(porMetodo).length === 0 && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic">Sin ventas registradas</p>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800 text-sm">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Total recaudado</span>
                            <span className="font-bold text-green-700">{fmtCOP(totalVentas)}</span>
                        </div>
                    </div>
                </div>

                {/* Saldo físico en caja */}
                <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 shadow-sm p-4 ${saldoCajaFisica >= 0 ? 'border-green-300' : 'border-red-300'}`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide mb-1">Saldo en caja</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Solo dinero físico (efectivo)</p>
                    <p className={`text-3xl font-bold mb-4 ${saldoCajaFisica >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {fmtCOP(saldoCajaFisica)}
                    </p>
                    <div className="space-y-1.5 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Base de apertura</span>
                            <span className="text-green-600 font-medium">+{fmtCOP(montoApertura)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Ventas en efectivo</span>
                            <span className="text-green-600 font-medium">+{fmtCOP(ventasEfectivo)}</span>
                        </div>
                        {totalGastos > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Gastos pagados</span>
                                <span className="text-red-500 font-medium">−{fmtCOP(totalGastos)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-1.5 border-t border-gray-100 dark:border-gray-800 font-semibold text-gray-800">
                            <span>= Efectivo en caja</span>
                            <span className={saldoCajaFisica >= 0 ? 'text-green-700' : 'text-red-600'}>
                                {fmtCOP(saldoCajaFisica)}
                            </span>
                        </div>
                        {ventasDigitales > 0 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 pt-1 italic">
                                Los pagos por tarjeta/transferencia ({fmtCOP(ventasDigitales)}) no se cuentan
                                aquí porque no entran a la caja física.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
