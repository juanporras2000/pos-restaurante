import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { fmt } from './constants';

export default function TarjetaApertura({ apertura, fecha, esHoy, onGuardado }) {
    const [editando, setEditando] = useState(!apertura);
    const [monto, setMonto] = useState(apertura ? String(Number.parseFloat(apertura.monto) / 1000) : '');
    const [nota, setNota] = useState(apertura?.nota ?? '');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        setEditando(!apertura);
        setMonto(apertura ? String(Number.parseFloat(apertura.monto) / 1000) : '');
        setNota(apertura?.nota ?? '');
    }, [apertura, fecha]);

    const guardar = async (e) => {
        e.preventDefault();
        const montoNum = Number.parseFloat(monto);
        if (Number.isNaN(montoNum) || montoNum < 0) return;

        setGuardando(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await axios.post('/caja-apertura', {
                fecha,
                monto: montoNum * 1000,
                nota: nota.trim() || null,
            }, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });

            setEditando(false);
            onGuardado(res.data);
            Swal.fire({ icon: 'success', title: 'Base de caja guardada', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al guardar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        } finally {
            setGuardando(false);
        }
    };

    const IconoCaja = () => (
        <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            <line x1="12" y1="12" x2="12" y2="16" />
            <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
    );

    // Solo lectura para fechas distintas a hoy
    if (!esHoy) {
        if (!apertura) return null;
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <IconoCaja />
                </div>
                <div>
                    <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Base de apertura de caja</p>
                    <p className="text-2xl font-bold text-green-700">{fmt(apertura.monto)}</p>
                    {apertura.nota && <p className="text-xs text-green-600 mt-0.5">{apertura.nota}</p>}
                </div>
            </div>
        );
    }

    // Modo visualización (hoy, ya guardada)
    if (!editando && apertura) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <IconoCaja />
                    </div>
                    <div>
                        <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Base de apertura de caja</p>
                        <p className="text-2xl font-bold text-green-700">{fmt(apertura.monto)}</p>
                        {apertura.nota && <p className="text-xs text-green-600 mt-0.5">{apertura.nota}</p>}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setEditando(true)}
                    className="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition-colors shrink-0"
                    title="Editar base de caja"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
            </div>
        );
    }

    // Modo formulario (hoy, sin guardar o editando)
    return (
        <div className="bg-white border-2 border-dashed border-green-300 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                    <line x1="10" y1="14" x2="14" y2="14" />
                </svg>
                {apertura ? 'Editar base de apertura de caja' : '¿Con cuánto inicia la caja hoy?'}
            </p>
            <form onSubmit={guardar} className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-36">
                    <label className="block text-xs text-gray-500 mb-1">Monto inicial</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            placeholder="Ej: 50"
                            autoFocus
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    {monto !== '' && !Number.isNaN(Number.parseFloat(monto)) && (
                        <p className="mt-0.5 text-xs text-gray-400">= ${(Number.parseFloat(monto) * 1000).toLocaleString('es-CO')}</p>
                    )}
                </div>
                <div className="flex-1 min-w-40">
                    <label className="block text-xs text-gray-500 mb-1">Nota (opcional)</label>
                    <input
                        type="text"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        placeholder="Ej: Vueltos de ayer..."
                        maxLength={200}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                <div className="flex gap-2">
                    {apertura && (
                        <button
                            type="button"
                            onClick={() => setEditando(false)}
                            className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={guardando || monto === '' || Number.isNaN(Number.parseFloat(monto))}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        {guardando ? 'Guardando...' : 'Guardar base'}
                    </button>
                </div>
            </form>
        </div>
    );
}
