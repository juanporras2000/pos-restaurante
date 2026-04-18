import React, { useState } from 'react';

const fmtQ = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);

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
    const total_ingreso  = sorted.reduce((s, r) => s + (+r.ingreso_total || 0), 0);

    function ThBtn({ col, children }) {
        const active = orden.col === col;
        return (
            <button
                onClick={() => toggleOrden(col)}
                className={`flex items-center gap-1 font-semibold uppercase text-xs tracking-wide transition-colors ${
                    active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {children}
                <span className="opacity-60">{active ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
            </button>
        );
    }

    return (
        <div className="space-y-3">
            {/* Buscador */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar producto…"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>
                <span className="text-xs text-gray-400">{sorted.length} producto{sorted.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
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
                        {sorted.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-400">
                                    {emptyMsg}
                                </td>
                            </tr>
                        ) : (
                            sorted.map((p, i) => {
                                const pct = total_ingreso > 0
                                    ? ((+p.ingreso_total / total_ingreso) * 100).toFixed(1)
                                    : 0;
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
                                            {fmtQ(p.ingreso_total)}
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
                            })
                        )}
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
                                    {fmtQ(total_ingreso)}
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
