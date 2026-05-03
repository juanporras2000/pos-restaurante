import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function ModalAdicion({ adicion, onGuardar, onCerrar }) {
    const [nombre, setNombre] = useState(adicion?.nombre ?? '');
    const [precio, setPrecio] = useState(adicion?.precio ?? '');
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
                body: JSON.stringify({ nombre: nombre.trim(), precio: parseFloat(precio) }),
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
                                step="0.01"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
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
            .catch(() => {})
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Cabecera */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Adiciones
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Extras y complementos disponibles al crear pedidos.</p>
                </div>
                <button
                    type="button"
                    onClick={abrirNueva}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva adición
                </button>
            </div>

            {/* Lista */}
            {cargando ? (
                <div className="py-8 text-center text-gray-400 text-sm">Cargando...</div>
            ) : adiciones.length === 0 ? (
                <div className="py-10 text-center">
                    <svg className="h-10 w-10 text-gray-200 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">Aún no hay adiciones creadas.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {adiciones.map((adicion) => (
                        <div key={adicion.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Toggle activo */}
                                <button
                                    type="button"
                                    onClick={() => toggleActivo(adicion)}
                                    title={adicion.activo ? 'Desactivar' : 'Activar'}
                                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                                        adicion.activo ? 'bg-purple-500' : 'bg-gray-200'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                                        adicion.activo ? 'translate-x-4' : 'translate-x-0.5'
                                    }`} />
                                </button>
                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${adicion.activo ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                                        {adicion.nombre}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                                <span className="text-sm font-semibold text-gray-700">
                                    ${parseFloat(adicion.precio).toFixed(2)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => abrirEditar(adicion)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Editar"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => eliminar(adicion)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Eliminar"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
