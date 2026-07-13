import React, { useState } from 'react';
import { fmtCOP, csrf, hoy } from './nominaUtils';

/**
 * Registra un descuento (abono) contra una o varias deudas pendientes de un trabajador.
 * `deudas`: array de deudas con saldo > 0. Si trae más de una, se muestra selector.
 */
export default function ModalAbono({ deudas, fechaDefault, onGuardar, onCerrar }) {
    const lista = Array.isArray(deudas) ? deudas : [deudas];
    const [deudaId, setDeudaId] = useState(lista[0]?.id ?? '');
    const [montoMiles, setMontoMiles] = useState('');
    const [fecha, setFecha] = useState(fechaDefault ?? hoy());
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const deuda = lista.find((d) => String(d.id) === String(deudaId)) ?? lista[0];
    const saldoMiles = (deuda?.saldo ?? 0) / 1000;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const monto = parseFloat(montoMiles);
        if (montoMiles === '' || isNaN(monto) || monto <= 0) { setError('Ingresa un monto válido'); return; }
        if (monto > saldoMiles) { setError(`El monto excede el saldo pendiente (${fmtCOP(deuda.saldo)})`); return; }

        setGuardando(true);
        try {
            const res = await fetch(`/api/deudas/${deuda.id}/abonos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ monto: Math.round(monto * 1000), fecha }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.errors?.monto?.[0] || '');
            }
            onGuardar();
        } catch (err) {
            setError(err.message || 'Error al registrar el abono');
        } finally {
            setGuardando(false);
        }
    };

    if (!deuda) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Registrar descuento</h3>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    {lista.length > 1 ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deuda</label>
                            <select
                                value={deudaId}
                                onChange={(e) => { setDeudaId(e.target.value); setError(''); }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {lista.map((d) => (
                                    <option key={d.id} value={d.id}>{d.concepto} · saldo {fmtCOP(d.saldo)}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            {deuda.concepto} · Saldo pendiente: <span className="font-semibold text-gray-900">{fmtCOP(deuda.saldo)}</span>
                        </p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monto a descontar</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={montoMiles}
                                    onChange={(e) => { setMontoMiles(e.target.value); setError(''); }}
                                    autoFocus
                                    className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semana / fecha</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onCerrar} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={guardando} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors">
                            {guardando ? 'Guardando...' : 'Descontar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
