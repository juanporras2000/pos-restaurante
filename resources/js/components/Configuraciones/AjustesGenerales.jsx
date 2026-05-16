import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { invalidarCacheConfiguracion } from '../../hooks/useImprimir';

export default function AjustesGenerales() {
    const [recargoDomicilio, setRecargoDomicilio] = useState('');
    const [horaCierre,       setHoraCierre]       = useState('5');
    const [nombreNegocio,    setNombreNegocio]    = useState('');
    const [telefonoNegocio,  setTelefonoNegocio]  = useState('');
    const [direccionNegocio, setDireccionNegocio] = useState('');
    const [cargando,  setCargando]  = useState(true);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        fetch('/api/configuraciones')
            .then((r) => r.json())
            .then((data) => {
                const cfg = Object.fromEntries(data.map((c) => [c.clave, c.valor]));
                setRecargoDomicilio(cfg.recargo_domicilio ? String(parseFloat(cfg.recargo_domicilio) / 1000) : '0');
                setHoraCierre(cfg.hora_cierre ?? '5');
                setNombreNegocio(cfg.nombre_negocio    ?? '');
                setTelefonoNegocio(cfg.telefono_negocio  ?? '');
                setDireccionNegocio(cfg.direccion_negocio ?? '');
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
                body: JSON.stringify({
                    recargo_domicilio:  (parseFloat(recargoDomicilio) || 0) * 1000,
                    hora_cierre:        parseInt(horaCierre),
                    nombre_negocio:     nombreNegocio.trim(),
                    telefono_negocio:   telefonoNegocio.trim(),
                    direccion_negocio:  direccionNegocio.trim(),
                }),
            });

            if (!res.ok) throw new Error('Error al guardar');

            // Invalidar caché para que el próximo recibo tome los nuevos datos
            invalidarCacheConfiguracion();

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
            <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
                Cargando...
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Ajustes generales</h2>
            <p className="text-sm text-gray-500 mb-6">Configuraciones globales que aplican a todo el sistema.</p>

            <form onSubmit={guardar} className="space-y-5">

                {/* ── Información del negocio (aparece en recibos) ─────────── */}
                <div className="space-y-4 pb-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9V2h12v7"></path>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                            Información del negocio
                        </h3>
                        <p className="text-xs text-gray-400 mb-3">
                            Estos datos aparecen en la cabecera de cada recibo impreso.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del negocio
                        </label>
                        <input
                            type="text"
                            maxLength={120}
                            value={nombreNegocio}
                            onChange={(e) => setNombreNegocio(e.target.value)}
                            placeholder="Mi Restaurante"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                maxLength={30}
                                value={telefonoNegocio}
                                onChange={(e) => setTelefonoNegocio(e.target.value)}
                                placeholder="300 123 4567"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección
                            </label>
                            <input
                                type="text"
                                maxLength={255}
                                value={direccionNegocio}
                                onChange={(e) => setDireccionNegocio(e.target.value)}
                                placeholder="Cra 5 # 10-20, Ciudad"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Recargo domicilio ─────────────────────────────────────── */}
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

                {/* ── Hora de reinicio ──────────────────────────────────────── */}
                <div className="border-t border-gray-100 pt-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de reinicio de pedidos
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                        A qué hora de la madrugada quieres que el contador de pedidos (Pedido #1) vuelva a empezar.
                    </p>
                    <select
                        value={horaCierre}
                        onChange={(e) => setHoraCierre(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        {[...Array(13).keys()].map(h => (
                            <option key={h} value={h}>{h === 0 ? '12:00 AM (Medianoche)' : `${h}:00 AM`}</option>
                        ))}
                    </select>
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
    );
}
