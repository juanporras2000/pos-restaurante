import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { TIPOS, fmtCOP, csrf, hoy } from './nominaUtils';

function ModalNuevaDeuda({ trabajadores, trabajadorId, onGuardar, onCerrar }) {
    const [idTrabajador, setIdTrabajador] = useState(trabajadorId ?? '');
    const [tipo, setTipo] = useState('prestamo');
    const [concepto, setConcepto] = useState('');
    const [montoMiles, setMontoMiles] = useState('');
    const [fecha, setFecha] = useState(hoy());
    const [observaciones, setObservaciones] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    const validar = () => {
        const e = {};
        if (!idTrabajador) e.trabajador = 'Selecciona un trabajador';
        if (!concepto.trim()) e.concepto = 'Describe el concepto';
        const monto = parseFloat(montoMiles);
        if (montoMiles === '' || isNaN(monto) || monto <= 0) e.monto = 'Ingresa un monto válido';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = validar();
        if (Object.keys(e2).length) { setErrores(e2); return; }

        setGuardando(true);
        try {
            const res = await fetch('/api/deudas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({
                    trabajador_id: idTrabajador,
                    tipo,
                    concepto: concepto.trim(),
                    monto_total: Math.round(parseFloat(montoMiles) * 1000),
                    fecha,
                    observaciones: observaciones.trim() || null,
                }),
            });
            if (!res.ok) throw new Error();
            onGuardar(await res.json());
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al guardar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Nueva deuda / descuento</h3>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trabajador <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={idTrabajador}
                            onChange={(e) => { setIdTrabajador(e.target.value); setErrores((p) => ({ ...p, trabajador: undefined })); }}
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errores.trabajador ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        >
                            <option value="">Selecciona...</option>
                            {trabajadores.map((t) => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                        </select>
                        {errores.trabajador && <p className="mt-1 text-xs text-red-600">{errores.trabajador}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Concepto <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={concepto}
                            onChange={(e) => { setConcepto(e.target.value); setErrores((p) => ({ ...p, concepto: undefined })); }}
                            placeholder="Ej: Préstamo personal, almuerzo..."
                            maxLength={150}
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errores.concepto ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errores.concepto && <p className="mt-1 text-xs text-red-600">{errores.concepto}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Monto total <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={montoMiles}
                                    onChange={(e) => { setMontoMiles(e.target.value); setErrores((p) => ({ ...p, monto: undefined })); }}
                                    placeholder="Ej: 100 = $100.000"
                                    className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errores.monto ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                            </div>
                            {errores.monto && <p className="mt-1 text-xs text-red-600">{errores.monto}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onCerrar} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={guardando} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors">
                            {guardando ? 'Guardando...' : 'Crear deuda'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FilaDeuda({ deuda, onCambio }) {
    const [expandido, setExpandido] = useState(false);
    const pagada = deuda.estado === 'pagada';

    const eliminarDeuda = async () => {
        const { isConfirmed } = await Swal.fire({
            title: `¿Eliminar deuda "${deuda.concepto}"?`,
            text: 'Se eliminarán también los descuentos ya registrados para esta deuda. Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
        });
        if (!isConfirmed) return;

        try {
            const res = await fetch(`/api/deudas/${deuda.id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrf() } });
            if (!res.ok) throw new Error();
            onCambio();
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al eliminar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        }
    };

    const eliminarAbono = async (abono) => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Eliminar este descuento?',
            text: 'El monto se sumará de vuelta al saldo pendiente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
        });
        if (!isConfirmed) return;

        try {
            const res = await fetch(`/api/deuda-abonos/${abono.id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrf() } });
            if (!res.ok) throw new Error();
            onCambio();
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al eliminar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        }
    };

    return (
        <li className="py-3.5 px-1">
            <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => setExpandido((v) => !v)} className="flex-1 flex items-center gap-3 min-w-0 text-left">
                    <svg className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${expandido ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{TIPOS[deuda.tipo]}</span>
                            <p className="text-sm font-medium text-gray-900 truncate">{deuda.concepto}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {fmtCOP(deuda.monto_total)} total · {new Date(deuda.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </button>

                <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${pagada ? 'text-green-600' : 'text-amber-600'}`}>
                        {pagada ? 'Pagada' : fmtCOP(deuda.saldo)}
                    </p>
                    {!pagada && <p className="text-xs text-gray-400">saldo pendiente</p>}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={eliminarDeuda} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar deuda">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {expandido && (
                <div className="mt-3 ml-7 pl-4 border-l-2 border-gray-100">
                    {deuda.observaciones && (
                        <p className="text-xs text-gray-500 italic mb-2">{deuda.observaciones}</p>
                    )}
                    {(deuda.abonos ?? []).length === 0 ? (
                        <p className="text-xs text-gray-400">Sin descuentos aplicados aún.</p>
                    ) : (
                        <ul className="space-y-1.5">
                            {deuda.abonos.map((a) => (
                                <li key={a.id} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">
                                        {new Date(a.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {a.origen === 'manual' && <span className="ml-1.5 text-gray-400">(manual)</span>}
                                    </span>
                                    <span className="font-medium text-gray-900">{fmtCOP(a.monto)}</span>
                                    <button type="button" onClick={() => eliminarAbono(a)} className="text-gray-300 hover:text-red-600 transition-colors" title="Deshacer este descuento">
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </li>
    );
}

export default function Descuentos() {
    const [trabajadores, setTrabajadores] = useState([]);
    const [deudas, setDeudas] = useState([]);
    const [filtroTrabajador, setFiltroTrabajador] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('pendiente');
    const [cargando, setCargando] = useState(true);
    const [modalNueva, setModalNueva] = useState(false);

    const cargarDeudas = () => {
        setCargando(true);
        const params = new URLSearchParams();
        if (filtroTrabajador) params.set('trabajador_id', filtroTrabajador);
        if (filtroEstado) params.set('estado', filtroEstado);
        fetch(`/api/deudas?${params.toString()}`)
            .then((r) => r.json())
            .then(setDeudas)
            .catch(() => {})
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        fetch('/api/trabajadores').then((r) => r.json()).then(setTrabajadores).catch(() => {});
    }, []);

    useEffect(cargarDeudas, [filtroTrabajador, filtroEstado]); // eslint-disable-line

    const totalPendiente = useMemo(() => deudas.reduce((s, d) => s + d.saldo, 0), [deudas]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Descuentos y préstamos</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Lleva la cuenta de préstamos, compras u otros descuentos por trabajador.</p>
                </div>
                <button type="button" onClick={() => setModalNueva(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva deuda
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <select
                    value={filtroTrabajador}
                    onChange={(e) => setFiltroTrabajador(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Todos los trabajadores</option>
                    {trabajadores.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                </select>
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="pendiente">Pendientes</option>
                    <option value="pagada">Pagadas</option>
                    <option value="">Todas</option>
                </select>
            </div>

            {cargando ? (
                <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            ) : deudas.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2" />
                        <circle cx="12" cy="12" r="9" />
                    </svg>
                    <p className="text-sm text-gray-500">No hay deudas registradas.</p>
                </div>
            ) : (
                <>
                    <ul className="divide-y divide-gray-100">
                        {deudas.map((d) => (
                            <FilaDeuda key={d.id} deuda={d} onCambio={cargarDeudas} />
                        ))}
                    </ul>

                    {filtroEstado === 'pendiente' && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center px-1">
                            <p className="text-sm text-gray-500">Total pendiente por descontar</p>
                            <p className="text-xl font-bold text-amber-600">{fmtCOP(totalPendiente)}</p>
                        </div>
                    )}
                </>
            )}

            {modalNueva && (
                <ModalNuevaDeuda
                    trabajadores={trabajadores}
                    trabajadorId={filtroTrabajador}
                    onCerrar={() => setModalNueva(false)}
                    onGuardar={() => { setModalNueva(false); cargarDeudas(); }}
                />
            )}
        </div>
    );
}
