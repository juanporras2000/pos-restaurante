import React, { useState, useEffect } from 'react';

const TIPO_CLASE = {
    entrada: 'bg-green-100 text-green-700',
    salida: 'bg-red-100 text-red-700',
    ajuste: 'bg-blue-100 text-blue-700',
};
const TIPO_LABEL = { entrada: '+Entrada', salida: '-Salida', ajuste: '–Ajuste' };

export default function ModalHistorial({ abierto, insumo, onCerrar }) {
    const [movimientos, setMovimientos] = useState([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (!abierto || !insumo) return;
        setCargando(true);
        fetch(`/api/inventario/movimientos?insumo_id=${insumo.id}&per_page=30`)
            .then((r) => r.json())
            .then((d) => setMovimientos(d.data ?? []))
            .catch(() => {})
            .finally(() => setCargando(false));
    }, [abierto, insumo]);

    if (!abierto || !insumo) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <h2 className="text-base font-semibold text-gray-900">Historial — {insumo.nombre}</h2>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">
                    {cargando ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Cargando historial...</div>
                    ) : movimientos.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Sin movimientos registrados</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Antes</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Después</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Motivo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {movimientos.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                                            {new Date(m.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_CLASE[m.tipo]}`}>{TIPO_LABEL[m.tipo]}</span>
                                        </td>
                                        <td className="px-5 py-3 text-right font-medium text-gray-900">{parseFloat(m.cantidad).toFixed(2)}</td>
                                        <td className="px-5 py-3 text-right text-gray-500">{parseFloat(m.stock_antes).toFixed(2)}</td>
                                        <td className="px-5 py-3 text-right text-gray-700">{parseFloat(m.stock_despues).toFixed(2)}</td>
                                        <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{m.motivo ?? ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="px-5 py-4 border-t border-gray-200 flex justify-end shrink-0">
                    <button type="button" onClick={onCerrar} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Cerrar</button>
                </div>
            </div>
        </div>
    );
}
