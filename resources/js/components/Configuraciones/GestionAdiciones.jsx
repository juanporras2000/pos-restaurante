import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { fmtCOP } from '../../utils/format';

function ModalAdicion({ adicion, onGuardar, onCerrar }) {
    const [nombre, setNombre] = useState(adicion?.nombre ?? '');
    const [precio, setPrecio] = useState(adicion?.precio != null ? adicion.precio / 1000 : '');
    const [guardando, setGuardando] = useState(false);

    const esEdicion = !!adicion?.id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        if (precio === '' || isNaN(parseFloat(precio)) || parseFloat(precio) < 0) return;

        setGuardando(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        const url = esEdicion ? `/api/adiciones/${adicion.id}` : '/api/adiciones';
        const method = esEdicion ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ nombre: nombre.trim(), precio: parseFloat(precio) * 1000 }),
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
                        {esEdicion ? 'Editar adición' : 'Nueva adición'}
                    </h3>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Queso extra, Salsa picante..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.001"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                placeholder="Ej: 2"
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        {precio !== '' && !isNaN(parseFloat(precio)) && (
                            <p className="mt-0.5 text-xs text-gray-400">= ${(parseFloat(precio) * 1000).toLocaleString('es-CO')}</p>
                        )}
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Agregar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function GestionAdiciones() {
    const [adiciones, setAdiciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [adicionEditar, setAdicionEditar] = useState(null);

    const cargar = () => {
        setCargando(true);
        fetch('/api/adiciones?todas=1')
            .then((r) => r.json())
            .then(setAdiciones)
            .catch(() => { })
            .finally(() => setCargando(false));
    };

    useEffect(() => { cargar(); }, []);

    const abrirNueva = () => { setAdicionEditar(null); setModalAbierto(true); };
    const abrirEditar = (adicion) => { setAdicionEditar(adicion); setModalAbierto(true); };

    const handleGuardado = (adicionGuardada) => {
        setModalAbierto(false);
        Swal.fire({ icon: 'success', title: adicionEditar ? 'Adición actualizada' : 'Adición creada', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
        cargar();
    };

    const toggleActivo = async (adicion) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await fetch(`/api/adiciones/${adicion.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ activo: !adicion.activo }),
            });
            if (!res.ok) throw new Error();
            setAdiciones((prev) =>
                prev.map((a) => (a.id === adicion.id ? { ...a, activo: !a.activo } : a))
            );
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al actualizar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        }
    };

    const eliminar = async (adicion) => {
        const { isConfirmed } = await Swal.fire({
            title: `¿Eliminar "${adicion.nombre}"?`,
            text: 'Esta acción no se puede deshacer.',
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
            const res = await fetch(`/api/adiciones/${adicion.id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            if (!res.ok) throw new Error();
            Swal.fire({ icon: 'success', title: 'Adición eliminada', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
            setAdiciones((prev) => prev.filter((a) => a.id !== adicion.id));
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al eliminar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 w-full min-w-0">
            {/* Cabecera Adaptativa */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="h-5 w-5 text-purple-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Adiciones
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Extras y complementos disponibles al crear pedidos.</p>
                </div>
                <button
                    type="button"
                    onClick={abrirNueva}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva adición
                </button>
            </div>

            {/* Lista de Adiciones */}
            {cargando ? (
                <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            ) : adiciones.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-sm">Aún no hay adiciones creadas.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100 border-t border-gray-50">
                    {adiciones.map((adicion) => (
                        <div key={adicion.id} className="flex items-center justify-between py-3.5 px-1 gap-2">

                            {/* Sección Izquierda: Toggle + Nombre */}
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Toggle optimizado para mejor respuesta táctil en móviles */}
                                <button
                                    type="button"
                                    onClick={() => toggleActivo(adicion)}
                                    title={adicion.activo ? 'Desactivar' : 'Activar'}
                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 touch-manipulation ${adicion.activo ? 'bg-purple-500' : 'bg-gray-200'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${adicion.activo ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>

                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate transition-all ${adicion.activo ? 'text-gray-900' : 'text-gray-400 line-through'
                                        }`}>
                                        {adicion.nombre}
                                    </p>
                                </div>
                            </div>

                            {/* Sección Derecha: Precio + Acciones */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                                <span className={`text-sm font-semibold ${adicion.activo ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {fmtCOP(adicion.precio)}
                                </span>

                                <div className="flex items-center gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => abrirEditar(adicion)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
                                        title="Editar"
                                    >
                                        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => eliminar(adicion)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                                        title="Eliminar"
                                    >
                                        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Ventana Modal */}
            {modalAbierto && (
                <ModalAdicion
                    adicion={adicionEditar}
                    onGuardar={handleGuardado}
                    onCerrar={() => setModalAbierto(false)}
                />
            )}
        </div>
    );
}
