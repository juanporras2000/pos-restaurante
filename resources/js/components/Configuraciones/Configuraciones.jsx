import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import GestionAdiciones from './GestionAdiciones';

export default function Configuraciones() {
    const [recargoDomicilio, setRecargoDomicilio] = useState('');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        fetch('/api/configuraciones')
            .then((r) => r.json())
            .then((data) => {
                const entry = data.find((c) => c.clave === 'recargo_domicilio');
                setRecargoDomicilio(entry ? String(parseFloat(entry.valor) / 1000) : '0');
            })
            .finally(() => setCargando(false));
    }, []);

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        try {
            const res = await fetch('/api/configuraciones', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ recargo_domicilio: (parseFloat(recargoDomicilio) || 0) * 1000 }),
            });

            if (!res.ok) throw new Error('Error al guardar');

            Swal.fire({
                icon: 'success',
                title: 'Configuración guardada',
                toast: true,
                position: 'top-end',
                timer: 1800,
                showConfirmButton: false,
            });
        } catch {
            Swal.fire('Error', 'No se pudo guardar la configuración', 'error');
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-500">
                Cargando configuraciones...
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Ajustes del sistema
                </h2>
                <p className="text-sm text-gray-500 mb-6">Configuraciones globales que aplican a todo el sistema.</p>

                <form onSubmit={guardar} className="space-y-5">
                    {/* Recargo domicilio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recargo fijo por domicilio
                        </label>
                        <p className="text-xs text-gray-400 mb-2">
                            Se suma al costo de <strong>todos</strong> los productos marcados como domicilio.
                            Úsalo para reflejar el costo del servicio de entrega.
                        </p>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.001"
                                value={recargoDomicilio}
                                onChange={(e) => setRecargoDomicilio(e.target.value)}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        {recargoDomicilio !== '' && !isNaN(parseFloat(recargoDomicilio)) && (
                            <p className="mt-0.5 text-xs text-gray-400">= ${(parseFloat(recargoDomicilio) * 1000).toLocaleString('es-CO')}</p>
                        )}
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={guardando}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                        >
                            {guardando ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>

            <GestionAdiciones />
        </div>
    );
}
