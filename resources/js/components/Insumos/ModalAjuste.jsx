import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function ModalAjuste({ abierto, insumo, onCerrar, onGuardado }) {
    const [tipo, setTipo] = useState('entrada');
    const [cantidad, setCantidad] = useState('');
    const [motivo, setMotivo] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (abierto) { setTipo('entrada'); setCantidad(''); setMotivo(''); }
    }, [abierto]);

    if (!abierto || !insumo) return null;

    const guardar = async () => {
        const cant = parseFloat(cantidad);
        if (isNaN(cant) || cant <= 0) { Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'error'); return; }
        setGuardando(true);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await fetch('/api/inventario/ajuste', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({ insumo_id: insumo.id, tipo, cantidad: cant, motivo: motivo.trim() || null }),
            });
            if (!res.ok) { const d = await res.json(); Swal.fire('Error', d.message ?? 'Error', 'error'); return; }
            Swal.fire({ icon: 'success', title: tipo === 'entrada' ? 'Stock agregado' : 'Stock ajustado', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
            onCerrar();
            onGuardado();
        } catch {
            Swal.fire('Error', 'No se pudo guardar', 'error');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">Ajustar stock — {insumo.nombre}</h2>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
                        <div className="flex gap-2">
                            {['entrada', 'ajuste'].map((t) => (
                                <button key={t} type="button" onClick={() => setTipo(t)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${tipo === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    {t === 'entrada' ? '+ Entrada' : '– Ajuste'}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {tipo === 'entrada' ? 'Suma la cantidad al stock actual' : 'Establece el stock al valor exacto indicado'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {tipo === 'entrada' ? 'Cantidad a agregar' : 'Nuevo stock'} <span className="text-gray-400">({insumo.unidad_medida})</span>
                        </label>
                        <input
                            autoFocus
                            type="number" step="0.01" min="0.01"
                            value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && guardar()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
                        <input
                            type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: Compra a proveedor"
                        />
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                        Stock actual: <strong>{parseFloat(insumo.stock_actual).toFixed(2)} {insumo.unidad_medida}</strong>
                    </div>
                </div>
                <div className="px-5 pb-5 flex justify-end gap-3">
                    <button type="button" onClick={onCerrar} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Cancelar</button>
                    <button type="button" onClick={guardar} disabled={guardando} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg text-sm">
                        {guardando ? 'Guardando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
