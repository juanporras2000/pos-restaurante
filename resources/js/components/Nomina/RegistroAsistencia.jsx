import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import Spinner from '../shared/Spinner';
import { DANGER } from '../../utils/colors';

function hoy() {
    return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD en timezone local
}

function desplazarDia(fecha, dias) {
    const d = new Date(fecha + 'T00:00:00');
    d.setDate(d.getDate() + dias);
    return d.toLocaleDateString('en-CA');
}

function formatearFechaLabel(fechaStr) {
    const d = new Date(fechaStr + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function RegistroAsistencia() {
    const [fecha, setFecha] = useState(hoy);
    const [trabajadores, setTrabajadores] = useState([]);
    const [asistencias, setAsistencias] = useState({}); // { trabajador_id: asistencia_id }
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(new Set());
    const [marcandoTodos, setMarcandoTodos] = useState(false);

    const cargarTrabajadores = useCallback(() => {
        return fetch('/api/v1/trabajadores')
            .then((r) => r.json())
            .then((data) => setTrabajadores(data.filter((t) => t.activo)));
    }, []);

    const cargarAsistencias = useCallback((f) => {
        return fetch(`/api/v1/asistencias?fecha=${f}`)
            .then((r) => r.json())
            .then((data) => {
                const mapa = {};
                data.forEach((a) => { mapa[a.trabajador_id] = a.id; });
                setAsistencias(mapa);
            });
    }, []);

    useEffect(() => {
        setCargando(true);
        Promise.all([cargarTrabajadores(), cargarAsistencias(fecha)])
            .finally(() => setCargando(false));
    }, [cargarTrabajadores]); // eslint-disable-line

    useEffect(() => {
        setCargando(true);
        cargarAsistencias(fecha).finally(() => setCargando(false));
    }, [fecha, cargarAsistencias]);

    const toggleAsistencia = async (trabajadorId) => {
        if (procesando.has(trabajadorId)) return;
        setProcesando((p) => new Set([...p, trabajadorId]));

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        const yaAsistio = !!asistencias[trabajadorId];

        if (yaAsistio) {
            const { isConfirmed } = await Swal.fire({
                title: '¿Quitar asistencia?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Quitar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: DANGER,
            });
            if (!isConfirmed) {
                setProcesando((p) => { const next = new Set(p); next.delete(trabajadorId); return next; });
                return;
            }
        }

        try {
            if (yaAsistio) {
                const res = await fetch(`/api/v1/asistencias/${asistencias[trabajadorId]}`, {
                    method: 'DELETE',
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                });
                if (!res.ok) throw new Error();
                setAsistencias((p) => { const next = { ...p }; delete next[trabajadorId]; return next; });
            } else {
                const res = await fetch('/api/v1/asistencias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ trabajador_id: trabajadorId, fecha }),
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                setAsistencias((p) => ({ ...p, [trabajadorId]: data.id }));
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al registrar asistencia', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        } finally {
            setProcesando((p) => { const next = new Set(p); next.delete(trabajadorId); return next; });
        }
    };

    const marcarTodos = async () => {
        const sinMarcar = trabajadores.filter((t) => !asistencias[t.id]);
        if (sinMarcar.length === 0) return;

        setMarcandoTodos(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        let fallos = 0;
        try {
            for (const t of sinMarcar) {
                try {
                    const res = await fetch('/api/v1/asistencias', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                        body: JSON.stringify({ trabajador_id: t.id, fecha }),
                    });
                    if (!res.ok) throw new Error();
                    const data = await res.json();
                    setAsistencias((p) => ({ ...p, [t.id]: data.id }));
                } catch {
                    fallos++;
                }
            }
        } finally {
            setMarcandoTodos(false);
            if (fallos > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: `${fallos} no se pudieron registrar`,
                    timer: 2500,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                });
            }
        }
    };

    const presentes = Object.keys(asistencias).length;
    const total = trabajadores.length;
    const esHoy = fecha === hoy();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Registro de asistencia</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 capitalize">{formatearFechaLabel(fecha)}</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Navegación de fecha */}
                    <button type="button" onClick={() => setFecha((f) => desplazarDia(f, -1))} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" title="Día anterior">
                        <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button type="button" onClick={() => setFecha((f) => desplazarDia(f, 1))} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" title="Día siguiente">
                        <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                    {!esHoy && (
                        <button type="button" onClick={() => setFecha(hoy())} className="px-3 py-2 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                            Hoy
                        </button>
                    )}
                </div>
            </div>

            {/* Contador + Marcar todos */}
            {!cargando && total > 0 && (
                <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{presentes}</span> de {total} presentes
                    </span>
                    {presentes < total && (
                        <button
                            type="button"
                            onClick={marcarTodos}
                            disabled={marcandoTodos}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {marcandoTodos ? 'Marcando...' : 'Marcar todos presentes'}
                        </button>
                    )}
                </div>
            )}

            {/* Lista */}
            {cargando ? (
                <div className="flex items-center justify-center py-12">
                    <Spinner size="md" />
                </div>
            ) : trabajadores.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay trabajadores activos.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Agrega trabajadores en la pestaña "Trabajadores".</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {trabajadores.map((t) => {
                        const presente = !!asistencias[t.id];
                        const cargandoEste = procesando.has(t.id);

                        return (
                            <li
                                key={t.id}
                                onClick={() => !cargandoEste && toggleAsistencia(t.id)}
                                className={`flex items-center justify-between py-4 px-3 rounded-lg cursor-pointer transition-all select-none ${presente ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase flex-shrink-0 transition-colors ${presente ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:text-gray-400'}`}>
                                        {t.nombre.charAt(0)}
                                    </span>
                                    <div>
                                        <p className={`text-sm font-medium ${presente ? 'text-green-800 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>{t.nombre}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{t.cargo || 'Sin cargo'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {cargandoEste ? (
                                        <Spinner size="sm" />
                                    ) : presente ? (
                                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full">
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                            Presente
                                        </span>
                                    ) : (
                                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Ausente</span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
