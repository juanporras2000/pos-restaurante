import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { TablaReportesPropTypes } from '../../propTypes';
import { fmtCOP } from '../../utils/format';

/**
 * TablaReportes
 * @param {Array}   rows         - Filas de datos
 * @param {string}  [emptyMsg]   - Mensaje cuando no hay datos
 */
export default function TablaReportes({ rows = [], emptyMsg = 'Sin datos para este período' }) {
    const [orden, setOrden] = useState({ col: 'cantidad_vendida', dir: 'desc' });
    const [busqueda, setBusqueda] = useState('');

    const toggleOrden = (col) => {
        setOrden((prev) =>
            prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'desc' }
        );
    };

    const sorted = [...rows]
        .filter((r) => r.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
        .sort((a, b) => {
            const va = a[orden.col] ?? 0;
            const vb = b[orden.col] ?? 0;
            return orden.dir === 'asc' ? va - vb : vb - va;
        });

    const total_unidades = sorted.reduce((s, r) => s + (+r.cantidad_vendida || 0), 0);
    const total_ingreso = sorted.reduce((s, r) => s + (+r.ingreso_total || 0), 0);

    function ThBtn({ col, children }) {
        const active = orden.col === col;
        return (
            <button
                onClick={() => toggleOrden(col)}
                className={`flex items-center gap-1 font-semibold uppercase text-xs tracking-wide transition-colors ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                {children}
                <span className="opacity-60">{active ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
            </button>
        );
    }

    return (
        <div className="space-y-3 w-full min-w-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar producto…"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>
                <span className="text-xs text-gray-400 self-end sm:self-center">
                    {sorted.length} producto{sorted.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="flex flex-col gap-2.5 sm:hidden">
                {sorted.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white border border-gray-200 rounded-xl shadow-sm text-sm">
                        {emptyMsg}
                    </div>
                ) : (
                    <>
                        {sorted.map((p, i) => {
                            const pct = total_ingreso > 0 ? ((+p.ingreso_total / total_ingreso) * 100).toFixed(1) : 0;
                            return (
                                <div key={p.id ?? i} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm space-y-2">
                                    {/* Fila superior: Índice y Nombre del Producto */}
                                    <div className="flex items-start gap-2 justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                                            <span className="font-bold text-gray-800 text-sm truncate">{p.nombre}</span>
                                        </div>
                                        <span className="font-semibold text-green-600 text-sm tabular-nums">
                                            {fmtCOP(p.ingreso_total)}
                                        </span>
                                    </div>

                                    {/* Fila intermedia: Unidades vendidas y barra de porcentaje */}
                                    <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-gray-50">
                                        <div className="text-xs text-gray-500">
                                            Vendidos: <span className="font-semibold text-gray-700 tabular-nums">{p.cantidad_vendida}</span>
                                        </div>


                                        <div className="flex items-center gap-2 flex-1 max-w-[140px] justify-end">
                                            <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="h-1.5 rounded-full bg-blue-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-[11px] text-gray-400 font-medium w-8 text-right tabular-nums">
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Resumen/Totales para móviles al final de la lista */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Totales del período</p>
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Unidades totales:</span>
                                <span className="font-bold text-gray-800 tabular-nums">{total_unidades}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-800 pt-1 border-t border-gray-200/60">
                                <span className="font-semibold">Ingreso Total:</span>
                                <span className="font-black text-green-600 tabular-nums">{fmtCOP(total_ingreso)}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm w-full min-w-0">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left w-8 text-gray-400 text-xs">#</th>
                            <th className="px-4 py-3 text-left">
                                <ThBtn col="nombre">Producto</ThBtn>
                            </th>
                            <th className="px-4 py-3 text-right">
                                <div className="flex justify-end">
                                    <ThBtn col="cantidad_vendida">Vendidos</ThBtn>
                                </div>
                            </th>
                            <th className="px-4 py-3 text-right">
                                <div className="flex justify-end">
                                    <ThBtn col="ingreso_total">Ingreso</ThBtn>
                                </div>
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                % del total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sorted.map((p, i) => {
                            const pct = total_ingreso > 0 ? ((+p.ingreso_total / total_ingreso) * 100).toFixed(1) : 0;
                            return (
                                <tr key={p.id ?? i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-gray-800">{p.nombre}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                                        {p.cantidad_vendida}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-600 tabular-nums">
                                        {fmtCOP(p.ingreso_total)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="h-1.5 rounded-full bg-blue-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 w-9 text-right tabular-nums">
                                                {pct}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    {sorted.length > 0 && (
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                            <tr>
                                <td colSpan={2} className="px-4 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide">
                                    Total
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-800 tabular-nums">
                                    {total_unidades}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-green-600 tabular-nums">
                                    {fmtCOP(total_ingreso)}
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-400">100%</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

TablaReportes.propTypes = TablaReportesPropTypes;

