import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { fmtCOP } from '../../utils/format';
import { DANGER, NEUTRAL } from '../../utils/colors';
import Spinner from '../shared/Spinner';
import Modal from '../shared/Modal';
import IconButton from '../shared/IconButton';
import axios from '../../services/axios';

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

        const url = esEdicion ? `/adiciones/${adicion.id}` : '/adiciones';
        const method = esEdicion ? 'put' : 'post';

        try {
            const res = await axios[method](url, {
                nombre: nombre.trim(),
                precio: parseFloat(precio) * 1000
            });

            // Axios ya parsea el JSON y lo entrega en res.data
            onGuardar(res.data);
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error al guardar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal abierto onCerrar={onCerrar}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {esEdicion ? 'Editar adición' : 'Nueva adición'}
                    </h3>
                    <IconButton aria-label="Cerrar" variant="default" onClick={onCerrar}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </IconButton>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    <div>
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Queso extra, Salsa picante..."
                            className="form-input"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="form-label">Precio</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.001"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                placeholder="Ej: 2"
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        {precio !== '' && !isNaN(parseFloat(precio)) && (
                            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">= ${(parseFloat(precio) * 1000).toLocaleString('es-CO')}</p>
                        )}
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onCerrar} className="btn-secondary flex-1">
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
        </Modal>
    );
}

export default function GestionAdiciones() {
    const [adiciones, setAdiciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [adicionEditar, setAdicionEditar] = useState(null);
    const [eliminandoId, setEliminandoId] = useState(null);



    const cargar = () => {
        setCargando(true);
        axios.get('/adiciones?todas=1')
            .then((respuesta) => {
                // Se usa respuesta.data para acceder al JSON que devuelve Laravel
                setAdiciones(respuesta.data.data);
            })
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
        try {
            // Axios se encarga de la baseURL, headers y parseo de JSON automáticamente
            await axios.put(`/adiciones/${adicion.id}`, {
                activo: !adicion.activo
            });

            setAdiciones((prev) =>
                prev.map((a) => (a.id === adicion.id ? { ...a, activo: !a.activo } : a))
            );
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
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
            confirmButtonColor: DANGER,
            cancelButtonColor: NEUTRAL,
        });
        if (!isConfirmed) return;

        setEliminandoId(adicion.id);
        try {
            // Axios usa .delete y maneja la baseURL y los headers automáticamente
            await axios.delete(`/adiciones/${adicion.id}`);

            Swal.fire({ icon: 'success', title: 'Adición eliminada', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
            setAdiciones((prev) => prev.filter((a) => a.id !== adicion.id));
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error al eliminar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        } finally {
            setEliminandoId(null);
        }
    };

    return (
        <div className="card p-4 sm:p-6 w-full min-w-0">
            {/* Cabecera Adaptativa */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <svg className="h-5 w-5 text-purple-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Adiciones
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Extras y complementos disponibles al crear pedidos.</p>
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
                    <Spinner size="md" className="text-purple-500 dark:text-purple-400" />
                </div>
            ) : adiciones.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-sm">Aún no hay adiciones creadas.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700 border-t border-gray-50 dark:border-gray-800">
                    {adiciones.map((adicion) => (
                        <div key={adicion.id} className="flex items-center justify-between py-3.5 px-1 gap-2">

                            {/* Sección Izquierda: Toggle + Nombre */}
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Toggle optimizado para mejor respuesta táctil en móviles */}
                                <button
                                    type="button"
                                    onClick={() => toggleActivo(adicion)}
                                    title={adicion.activo ? 'Desactivar' : 'Activar'}
                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 touch-manipulation ${adicion.activo ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-600'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${adicion.activo ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>

                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate transition-all ${adicion.activo ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 line-through'
                                        }`}>
                                        {adicion.nombre}
                                    </p>
                                </div>
                            </div>

                            {/* Sección Derecha: Precio + Acciones */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                                <span className={`text-sm font-semibold ${adicion.activo ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {fmtCOP(adicion.precio)}
                                </span>

                                <div className="flex items-center gap-0.5">
                                    <IconButton
                                        onClick={() => abrirEditar(adicion)}
                                        variant="primary"
                                        aria-label="Editar adición"
                                        className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </IconButton>
                                    <IconButton
                                        onClick={() => eliminar(adicion)}
                                        variant="danger"
                                        aria-label="Eliminar adición"
                                        disabled={eliminandoId === adicion.id}
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </IconButton>
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
