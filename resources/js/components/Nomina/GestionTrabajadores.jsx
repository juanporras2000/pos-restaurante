import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const PAGO_MIN = 0;

function fmtCOP(pesos) {
    return `$${Number(pesos).toLocaleString('es-CO')}`;
}

function ModalTrabajador({ trabajador, onGuardar, onCerrar }) {
    const esEdicion = !!trabajador?.id;
    const [nombre, setNombre] = useState(trabajador?.nombre ?? '');
    const [cargo, setCargo] = useState(trabajador?.cargo ?? '');
    const [pagoMiles, setPagoMiles] = useState(
        trabajador?.pago_por_turno ? String(trabajador.pago_por_turno / 1000) : ''
    );
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    const validar = () => {
        const e = {};
        if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
        const pago = parseFloat(pagoMiles);
        if (pagoMiles === '' || isNaN(pago) || pago < PAGO_MIN) {
            e.pago = 'Ingresa un pago válido (mínimo 0)';
        }
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = validar();
        if (Object.keys(e2).length) { setErrores(e2); return; }

        setGuardando(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        const url    = esEdicion ? `/api/trabajadores/${trabajador.id}` : '/api/trabajadores';
        const method = esEdicion ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({
                    nombre:          nombre.trim(),
                    cargo:           cargo.trim(),
                    pago_por_turno:  Math.round(parseFloat(pagoMiles) * 1000),
                }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            onGuardar(data);
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
                    <h3 className="font-semibold text-gray-900">
                        {esEdicion ? 'Editar trabajador' : 'Nuevo trabajador'}
                    </h3>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => { setNombre(e.target.value); setErrores((p) => ({ ...p, nombre: undefined })); }}
                            placeholder="Ej: Juan García"
                            autoFocus
                            maxLength={120}
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errores.nombre ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errores.nombre && <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>}
                    </div>

                    {/* Cargo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                        <input
                            type="text"
                            value={cargo}
                            onChange={(e) => setCargo(e.target.value)}
                            placeholder="Ej: Jefe de cocina, Ayudante..."
                            maxLength={80}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Pago por turno */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pago por turno/día <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.001"
                                value={pagoMiles}
                                onChange={(e) => { setPagoMiles(e.target.value); setErrores((p) => ({ ...p, pago: undefined })); }}
                                placeholder="Ej: 50 = $50.000"
                                className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errores.pago ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            />
                        </div>
                        {errores.pago
                            ? <p className="mt-1 text-xs text-red-600">{errores.pago}</p>
                            : pagoMiles !== '' && !isNaN(parseFloat(pagoMiles)) && (
                                <p className="mt-0.5 text-xs text-gray-400">= {fmtCOP(Math.round(parseFloat(pagoMiles) * 1000))} por día</p>
                            )
                        }
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onCerrar} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={guardando} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors">
                            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear trabajador'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function GestionTrabajadores() {
    const [trabajadores, setTrabajadores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [trabajadorEditar, setTrabajadorEditar] = useState(null);

    const cargar = () => {
        setCargando(true);
        fetch('/api/trabajadores')
            .then((r) => r.json())
            .then(setTrabajadores)
            .catch(() => {})
            .finally(() => setCargando(false));
    };

    useEffect(() => { cargar(); }, []);

    const abrirNuevo = () => { setTrabajadorEditar(null); setModalAbierto(true); };
    const abrirEditar = (t) => { setTrabajadorEditar(t); setModalAbierto(true); };

    const handleGuardado = () => {
        setModalAbierto(false);
        Swal.fire({ icon: 'success', title: trabajadorEditar ? 'Trabajador actualizado' : 'Trabajador creado', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
        cargar();
    };

    const toggleActivo = async (t) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await fetch(`/api/trabajadores/${t.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ activo: !t.activo }),
            });
            if (!res.ok) throw new Error();
            setTrabajadores((prev) => prev.map((w) => w.id === t.id ? { ...w, activo: !w.activo } : w));
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al actualizar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        }
    };

    const eliminar = async (t) => {
        const { isConfirmed } = await Swal.fire({
            title: `¿Eliminar a "${t.nombre}"?`,
            text: 'Se eliminarán también sus registros de asistencia. Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
        });
        if (!isConfirmed) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await fetch(`/api/trabajadores/${t.id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrfToken } });
            if (!res.ok) throw new Error();
            Swal.fire({ icon: 'success', title: 'Trabajador eliminado', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
            setTrabajadores((prev) => prev.filter((w) => w.id !== t.id));
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al eliminar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Trabajadores</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Configura el equipo y su pago por turno.</p>
                </div>
                <button type="button" onClick={abrirNuevo} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo trabajador
                </button>
            </div>

            {/* Lista */}
            {cargando ? (
                <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            ) : trabajadores.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                    </svg>
                    <p className="text-sm text-gray-500">No hay trabajadores. Agrega el primero.</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {trabajadores.map((t) => (
                        <li key={t.id} className="flex items-center justify-between py-3.5 px-1 gap-3">
                            {/* Avatar + info */}
                            <div className="flex items-center gap-3 min-w-0">
                                <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase flex-shrink-0 ${t.activo ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {t.nombre.charAt(0)}
                                </span>
                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${t.activo ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{t.nombre}</p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {t.cargo || 'Sin cargo'} · {fmtCOP(t.pago_por_turno)}/día
                                    </p>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Toggle activo */}
                                <button
                                    type="button"
                                    onClick={() => toggleActivo(t)}
                                    title={t.activo ? 'Desactivar' : 'Activar'}
                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${t.activo ? 'bg-blue-500' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${t.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <button type="button" onClick={() => abrirEditar(t)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button type="button" onClick={() => eliminar(t)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {modalAbierto && (
                <ModalTrabajador
                    trabajador={trabajadorEditar}
                    onGuardar={handleGuardado}
                    onCerrar={() => setModalAbierto(false)}
                />
            )}
        </div>
    );
}
