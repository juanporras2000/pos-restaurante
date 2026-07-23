import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { DANGER, NEUTRAL } from '../../utils/colors';
import Spinner from '../shared/Spinner';
import Modal from '../shared/Modal';
import IconButton from '../shared/IconButton';
import axios from '../../services/axios'

function ModalCategoria({ categoria, onGuardar, onCerrar }) {
    const [nombre, setNombre] = useState(categoria?.nombre ?? '');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const esEdicion = !!categoria?.id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        setError('');
        setGuardando(true);

        const url = esEdicion ? `/categorias/${categoria.id}` : '/categorias';
        const method = esEdicion ? 'put' : 'post';

        try {
            const res = await axios[method](url, {
                nombre: nombre.trim()
            });

            onGuardar(res.data);
        } catch (error) {
            // Axios maneja los códigos de estado de error (como el 422) en el bloque catch
            if (error.response && error.response.status === 422) {
                const data = error.response.data;
                const msg = Object.values(data.errors ?? {}).flat()[0] ?? 'Error de validación';
                setError(msg);
                return;
            }

            Swal.fire({ icon: 'error', title: 'Error al guardar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal abierto onCerrar={onCerrar}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {esEdicion ? 'Editar categoría' : 'Nueva categoría'}
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
                            onChange={(e) => { setNombre(e.target.value); setError(''); }}
                            placeholder="Ej: Bebidas, Salchipapas, Picadas..."
                            className={`form-input ${error ? 'border-red-500 bg-red-50' : ''}`}
                            required
                            autoFocus
                            maxLength={100}
                        />
                        {error && <p className="form-error">{error}</p>}
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onCerrar} className="btn-secondary flex-1">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando || !nombre.trim()}
                            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear categoría'}
                        </button>
                    </div>
                </form>
        </Modal>
    );
}

export default function GestionCategorias() {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [categoriaEditar, setCategoriaEditar] = useState(null);
    const [eliminandoId, setEliminandoId] = useState(null);

    const cargar = () => {
        setCargando(true);
        axios.get('/categorias')
            .then((respuesta) => {
                setCategorias(respuesta.data);
            })
            .catch(() => { })
            .finally(() => setCargando(false));
    };

    useEffect(() => { cargar(); }, []);

    const abrirNueva = () => { setCategoriaEditar(null); setModalAbierto(true); };
    const abrirEditar = (cat) => { setCategoriaEditar(cat); setModalAbierto(true); };

    const handleGuardado = () => {
        setModalAbierto(false);
        Swal.fire({
            icon: 'success',
            title: categoriaEditar ? 'Categoría actualizada' : 'Categoría creada',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
        });
        cargar();
    };

    const eliminar = async (cat) => {
        const { isConfirmed } = await Swal.fire({
            title: `¿Eliminar "${cat.nombre}"?`,
            text: cat.productos_count > 0
                ? `Tiene ${cat.productos_count} producto(s) asignado(s). No se puede eliminar.`
                : 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: cat.productos_count === 0,
            confirmButtonText: cat.productos_count > 0 ? 'Entendido' : 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: cat.productos_count > 0 ? NEUTRAL : DANGER,
            cancelButtonColor: NEUTRAL,
        });

        if (!isConfirmed || cat.productos_count > 0) return;

        setEliminandoId(cat.id);
        try {
            // Pasamos a usar la instancia de axios con la URL limpia
            await axios.delete(`/categorias/${cat.id}`);

            Swal.fire({ icon: 'success', title: 'Categoría eliminada', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
            setCategorias((prev) => prev.filter((c) => c.id !== cat.id));
        } catch (error) {
            // Capturamos el error 409 de conflicto enviado por Laravel
            if (error.response && error.response.status === 409) {
                const data = error.response.data;
                Swal.fire({ icon: 'warning', title: 'No se puede eliminar', text: data.error, confirmButtonColor: NEUTRAL });
                return;
            }

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
                        <svg className="h-5 w-5 text-orange-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6h16M4 10h16M4 14h8M4 18h8" />
                        </svg>
                        Categorías
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Organiza los productos por categorías.</p>
                </div>
                <button
                    type="button"
                    onClick={abrirNueva}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva categoría
                </button>
            </div>

            {/* Lista */}
            {cargando ? (
                <div className="flex items-center justify-center py-12">
                    <Spinner size="md" className="text-orange-500" />
                </div>
            ) : categorias.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 6h16M4 10h16M4 14h8M4 18h8" />
                    </svg>
                    <p className="text-sm">No hay categorías. Crea la primera.</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100 border-t border-gray-50">
                    {categorias.map((cat) => (
                        <li key={cat.id} className="flex items-center justify-between py-3 px-1 group">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
                                    {cat.nombre ? cat.nombre.charAt(0) : '?'}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{cat.nombre}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        {cat.productos_count === 0
                                            ? 'Sin productos'
                                            : `${cat.productos_count} producto${cat.productos_count !== 1 ? 's' : ''}`}
                                    </p>
                                </div>
                            </div>

                            {/* Botones de acción optimizados:
                        - Siempre visibles en smartphones para permitir el toque directo.
                        - Ocultos por defecto (`md:opacity-0`) y visibles en hover (`md:group-hover:opacity-100`) solo en pantallas grandes con mouse. */}
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                <IconButton
                                    onClick={() => abrirEditar(cat)}
                                    variant="primary"
                                    aria-label="Editar categoría"
                                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                >
                                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </IconButton>
                                <IconButton
                                    onClick={() => eliminar(cat)}
                                    variant="danger"
                                    aria-label="Eliminar categoría"
                                    disabled={eliminandoId === cat.id}
                                >
                                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                        <path d="M10 11v6M14 11v6" />
                                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                    </svg>
                                </IconButton>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {
                modalAbierto && (
                    <ModalCategoria
                        categoria={categoriaEditar}
                        onGuardar={handleGuardado}
                        onCerrar={() => setModalAbierto(false)}
                    />
                )
            }
        </div>
    );
}


