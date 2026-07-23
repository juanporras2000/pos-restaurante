import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { invalidarCacheConfiguracion } from '../../hooks/useImprimir';
import Spinner from '../shared/Spinner';

export default function AjustesGenerales() {
    const [recargoDomicilio, setRecargoDomicilio] = useState('');
    const [horaCierre, setHoraCierre] = useState('5');
    const [nombreNegocio, setNombreNegocio] = useState('');
    const [telefonoNegocio, setTelefonoNegocio] = useState('');
    const [direccionNegocio, setDireccionNegocio] = useState('');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        fetch('/api/configuraciones')
            .then((r) => r.json())
            .then((data) => {
                const cfg = Object.fromEntries(data.map((c) => [c.clave, c.valor]));
                setRecargoDomicilio(cfg.recargo_domicilio ? String(parseFloat(cfg.recargo_domicilio) / 1000) : '0');
                setHoraCierre(cfg.hora_cierre ?? '5');
                setNombreNegocio(cfg.nombre_negocio ?? '');
                setTelefonoNegocio(cfg.telefono_negocio ?? '');
                setDireccionNegocio(cfg.direccion_negocio ?? '');
            })
            .finally(() => setCargando(false));
    }, []);

    const validar = () => {
        const e = {};
        if (!nombreNegocio.trim()) e.nombreNegocio = 'El nombre del negocio es obligatorio';
        if (!telefonoNegocio.trim()) e.telefonoNegocio = 'El teléfono es obligatorio';
        if (!direccionNegocio.trim()) e.direccionNegocio = 'La dirección es obligatoria';
        if (recargoDomicilio === '' || isNaN(parseFloat(recargoDomicilio)) || parseFloat(recargoDomicilio) < 0) {
            e.recargoDomicilio = 'Ingresa un valor válido (mínimo 0)';
        }
        return e;
    };

    const guardar = async (e) => {
        e.preventDefault();

        const nuevosErrores = validar();
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
        setErrores({});
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
                    recargo_domicilio: (parseFloat(recargoDomicilio) || 0) * 1000,
                    hora_cierre: parseInt(horaCierre),
                    nombre_negocio: nombreNegocio.trim(),
                    telefono_negocio: telefonoNegocio.trim(),
                    direccion_negocio: direccionNegocio.trim(),
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
            <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="card p-4 sm:p-6 w-full min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Ajustes generales</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Configuraciones globales que aplican a todo el sistema.</p>

            <form onSubmit={guardar} className="space-y-5">

                {/* ── Información del negocio (aparece en recibos) ─────────── */}
                <div className="space-y-4 pb-5 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                            <svg className="h-4 w-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9V2h12v7"></path>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                            Información del negocio
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Estos datos aparecen en la cabecera de cada recibo impreso.
                        </p>
                    </div>

                    <div>
                        <label className="form-label">
                            Nombre del negocio <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            maxLength={120}
                            value={nombreNegocio}
                            onChange={(e) => { setNombreNegocio(e.target.value); setErrores((p) => ({ ...p, nombreNegocio: '' })); }}
                            placeholder="Mi Restaurante"
                            enterKeyHint="next"
                            className={`form-input ${errores.nombreNegocio ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {errores.nombreNegocio && <p className="form-error">{errores.nombreNegocio}</p>}
                    </div>

                    {/* Cambiado a stack vertical en móvil y grid de 2 columnas en sm: */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">
                                Teléfono <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                maxLength={30}
                                value={telefonoNegocio}
                                onChange={(e) => { setTelefonoNegocio(e.target.value); setErrores((p) => ({ ...p, telefonoNegocio: '' })); }}
                                placeholder="300 123 4567"
                                enterKeyHint="next"
                                className={`form-input ${errores.telefonoNegocio ? 'border-red-500 bg-red-50' : ''}`}
                            />
                            {errores.telefonoNegocio && <p className="form-error">{errores.telefonoNegocio}</p>}
                        </div>
                        <div>
                            <label className="form-label">
                                Dirección <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                maxLength={255}
                                value={direccionNegocio}
                                onChange={(e) => { setDireccionNegocio(e.target.value); setErrores((p) => ({ ...p, direccionNegocio: '' })); }}
                                placeholder="Cra 5 # 10-20, Ciudad"
                                enterKeyHint="done"
                                className={`form-input ${errores.direccionNegocio ? 'border-red-500 bg-red-50' : ''}`}
                            />
                            {errores.direccionNegocio && <p className="form-error">{errores.direccionNegocio}</p>}
                        </div>
                    </div>
                </div>

                {/* ── Recargo domicilio ─────────────────────────────────────── */}
                <div>
                    <label className="form-label">
                        Recargo fijo por domicilio
                    </label>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                        Se suma al costo de <strong>todos</strong> los productos marcados como domicilio.
                        Úsalo para reflejar el costo del servicio de entrega.
                    </p>
                    <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            min="0"
                            step="0.001"
                            inputMode="decimal"
                            value={recargoDomicilio}
                            onChange={(e) => { setRecargoDomicilio(e.target.value); setErrores((p) => ({ ...p, recargoDomicilio: '' })); }}
                            className={`form-input pl-7 ${errores.recargoDomicilio ? 'border-red-500 bg-red-50' : ''}`}
                        />
                    </div>
                    {errores.recargoDomicilio && <p className="form-error">{errores.recargoDomicilio}</p>}
                    {!errores.recargoDomicilio && recargoDomicilio !== '' && !isNaN(parseFloat(recargoDomicilio)) && (
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-mono">
                            = ${(parseFloat(recargoDomicilio) * 1000).toLocaleString('es-CO')}
                        </p>
                    )}
                </div>

                {/* ── Hora de reinicio ──────────────────────────────────────── */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                    <label className="form-label">
                        Hora de reinicio de pedidos
                    </label>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                        A qué hora de la madrugada quieres que el contador de pedidos (Pedido #1) vuelva a empezar.
                    </p>
                    <select
                        value={horaCierre}
                        onChange={(e) => setHoraCierre(e.target.value)}
                        className="form-input h-10"
                    >
                        {[...Array(13).keys()].map(h => (
                            <option key={h} value={h}>{h === 0 ? '12:00 AM (Medianoche)' : `${h}:00 AM`}</option>
                        ))}
                    </select>
                </div>

                {/* Botonera adaptativa: Ancho completo en móvil con área táctil cómoda (`py-3`) */}
                <div className="pt-3 flex sm:justify-end">
                    <button
                        type="submit"
                        disabled={guardando}
                        className="btn-primary px-6 w-full sm:w-auto"
                    >
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}
