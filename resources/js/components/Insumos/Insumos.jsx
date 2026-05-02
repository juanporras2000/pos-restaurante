import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import ModalInsumo from './ModalInsumo';
import ModalAjuste from './ModalAjuste';
import ModalHistorial from './ModalHistorial';

const INSUMO_VACIO = { id: null, nombre: '', unidad_medida: '', stock_actual: '', stock_minimo: '', costo_unitario: '' };


export default function Insumos() {
    const [insumos, setInsumos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [insumoActual, setInsumoActual] = useState(INSUMO_VACIO);
    const [guardando, setGuardando] = useState(false);
    const [buscar, setBuscar] = useState('');
    const [insumoAjuste, setInsumoAjuste] = useState(null);
    const [insumoHistorial, setInsumoHistorial] = useState(null);

    const cargar = useCallback(() => {
        setCargando(true);
        fetch('/api/insumos')
            .then((r) => r.json())
            .then(setInsumos)
            .catch(() => Swal.fire('Error', 'No se pudieron cargar los insumos', 'error'))
            .finally(() => setCargando(false));
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const abrirCrear = () => { setInsumoActual(INSUMO_VACIO); setModalAbierto(true); };
    const abrirEditar = (ins) => {
        setInsumoActual({
            id: ins.id,
            nombre: ins.nombre,
            unidad_medida: ins.unidad_medida,
            stock_actual: ins.stock_actual,
            stock_minimo: ins.stock_minimo,
            costo_unitario: ins.costo_unitario ?? 0,
        });
        setModalAbierto(true);
    };
    const cerrar = () => { setModalAbierto(false); setInsumoActual(INSUMO_VACIO); };

    const guardar = async (data) => {
        setGuardando(true);
        const esEdicion = Boolean(insumoActual.id);
        const url = esEdicion ? `/api/insumos/${insumoActual.id}` : '/api/insumos';
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        try {
            const res = await fetch(url, {
                method: esEdicion ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 422) {
                    throw errorData; // Devolver errores para que react-hook-form los maneje
                }
                throw new Error(errorData.message ?? 'Error al guardar');
            }

            cerrar();
            cargar();
            Swal.fire({ icon: 'success', title: esEdicion ? 'Insumo actualizado' : 'Insumo creado', timer: 1800, showConfirmButton: false, toast: true, position: 'top-end' });
        } catch (err) {
            if (err.errors) throw err; // Re-lanzar para el formulario
            Swal.fire('Error', err.message ?? 'No se pudo guardar el insumo', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const eliminar = async (ins) => {
        const result = await Swal.fire({
            title: `Eliminar "${ins.nombre}"?`,
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });
        if (!result.isConfirmed) return;

        const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await fetch(`/api/insumos/${ins.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
            });
            const data = await res.json();
            if (!res.ok) { Swal.fire('No se puede eliminar', data.error ?? 'Error', 'error'); return; }
            cargar();
            Swal.fire({ icon: 'success', title: 'Insumo eliminado', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
        } catch {
            Swal.fire('Error', 'No se pudo eliminar el insumo', 'error');
        }
    };

    const filtrados = insumos.filter((i) => i.nombre.toLowerCase().includes(buscar.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"></path>
                            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>
                        </svg>
                        Gestión de Insumos
                    </h1>
                    <p className="text-gray-600 mt-1">Administra la materia prima y su stock</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Buscar insumos..."
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        type="button"
                        onClick={abrirCrear}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 4v16m8-8H4"></path>
                        </svg>
                        Nuevo Insumo
                    </button>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {cargando ? (
                    <div className="p-12 text-center text-gray-500">Cargando insumos...</div>
                ) : filtrados.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="h-14 w-14 text-gray-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"></path>
                            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>
                        </svg>
                        <p className="text-gray-500 font-medium">{buscar ? 'Sin resultados para la busqueda' : 'No hay insumos registrados'}</p>
                        {!buscar && <p className="text-gray-400 text-sm mt-1">Crea el primero con el botón de arriba</p>}
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Unidad</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stock actual</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stock mínimo</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtrados.map((ins) => {
                                const bajo = parseFloat(ins.stock_actual) <= parseFloat(ins.stock_minimo) && parseFloat(ins.stock_minimo) > 0;
                                return (
                                    <tr key={ins.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{ins.nombre}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-mono">
                                                {ins.unidad_medida}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            {parseFloat(ins.stock_actual).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500">
                                            {parseFloat(ins.stock_minimo).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {bajo ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                                                    </svg>
                                                    Stock bajo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    OK
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => setInsumoHistorial(ins)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" title="Ver historial">
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                </button>
                                                <button type="button" onClick={() => setInsumoAjuste(ins)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Ajustar stock">
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 4v16m8-8H4"></path>
                                                    </svg>
                                                </button>
                                                <button type="button" onClick={() => abrirEditar(ins)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button type="button" onClick={() => eliminar(ins)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <ModalInsumo
                abierto={modalAbierto}
                insumo={insumoActual}
                onGuardar={guardar}
                onCerrar={cerrar}
                guardando={guardando}
            />

            <ModalAjuste
                abierto={insumoAjuste !== null}
                insumo={insumoAjuste}
                onCerrar={() => setInsumoAjuste(null)}
                onGuardado={cargar}
            />

            <ModalHistorial
                abierto={insumoHistorial !== null}
                insumo={insumoHistorial}
                onCerrar={() => setInsumoHistorial(null)}
            />
        </div>
    );
}

