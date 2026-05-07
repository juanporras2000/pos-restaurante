import React from 'react';
import { tipoInfo, fmt } from './constants';

function FilaGasto({ gasto, esHoy, onEditar, onEliminar }) {
    const tipo = tipoInfo(gasto.tipo);
    const hora = new Date(gasto.created_at).toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota',
    });

    return (
        <tr className="hover:bg-gray-50 group">
            <td className="px-4 py-3 font-medium text-gray-900">{gasto.concepto}</td>
            <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipo.color}`}>{tipo.label}</span>
            </td>
            <td className="px-4 py-3 text-right font-semibold text-red-600">{fmt(gasto.monto)}</td>
            <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell max-w-xs truncate">{gasto.nota || '—'}</td>
            <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{hora}</td>
            <td className="px-4 py-3">
                {esHoy && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                            type="button"
                            onClick={() => onEditar(gasto)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => onEliminar(gasto)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}

export default function TablaGastos({ gastos, filtroTipo, cargando, esHoy, onEditar, onEliminar }) {
    const totalFiltrado = gastos.reduce((s, g) => s + parseFloat(g.monto), 0);

    if (cargando) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center py-16">
                <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
            </div>
        );
    }

    if (gastos.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16 text-gray-400">
                <svg className="mx-auto h-12 w-12 text-gray-200 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                <p className="text-sm">
                    No hay gastos registrados{filtroTipo !== 'todos' ? ' en esta categoría' : ' para esta fecha'}.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Concepto</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Nota</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Hora</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {gastos.map((g) => (
                        <FilaGasto
                            key={g.id}
                            gasto={g}
                            esHoy={esHoy}
                            onEditar={onEditar}
                            onEliminar={onEliminar}
                        />
                    ))}
                </tbody>
                {gastos.length > 1 && (
                    <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                        <tr>
                            <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">
                                {filtroTipo !== 'todos' ? `Subtotal ${tipoInfo(filtroTipo).label}` : 'Total del día'}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-red-600">{fmt(totalFiltrado)}</td>
                            <td colSpan={3} />
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}
