import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import TablaProductos from './TablaProductos';
import ModalProducto from './ModalProducto';
import PillsCategorias from '../shared/PillsCategorias';
import Spinner from '../shared/Spinner';
import { DANGER } from '../../utils/colors';

const PRODUCTO_VACIO = {
    id: null,
    nombre: '',
    precio: '',
    categoria_id: '',
    imagen: null,
};

const RECETA_VACIA = [];

export default function Productos() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [buscar, setBuscar] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [paginacion, setPaginacion] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [insumos, setInsumos] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [productoActual, setProductoActual] = useState(PRODUCTO_VACIO);
    const [receta, setReceta] = useState(RECETA_VACIA);
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(false);

    // Cargar categorías e insumos al montar
    useEffect(() => {
        axios.get('/categorias')
            .then((r) => setCategorias(r.data))
            .catch(() => { });

        axios.get('/insumos')
            .then((r) => setInsumos(r.data))
            .catch(() => { });
    }, []);

    // Cargar productos cuando cambia búsqueda, categoría o página
    const cargarProductos = useCallback(() => {
        setCargando(true);

        // Construimos el objeto de parámetros de forma dinámica
        const params = { page: paginaActual };
        if (buscar.trim()) params.buscar = buscar.trim();
        if (categoriaFiltro) params.categoria_id = categoriaFiltro;

        axios.get('/productos', { params })
            .then((r) => {
                const data = r.data;
                setProductos(data.data ?? []);
                setPaginacion(data);
            })
            .catch(() => {
                Swal.fire('Error', 'No se pudo cargar los productos', 'error');
            })
            .finally(() => setCargando(false));
    }, [buscar, categoriaFiltro, paginaActual]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPaginaActual(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [buscar, categoriaFiltro]);

    useEffect(() => {
        cargarProductos();
    }, [cargarProductos]);

    // Abrir modal para crear
    const abrirCrear = () => {
        setProductoActual(PRODUCTO_VACIO);
        setReceta(RECETA_VACIA);
        setModalAbierto(true);
    };

    // Abrir modal para editar
    const abrirEditar = (producto) => {
        setProductoActual(producto);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setProductoActual(PRODUCTO_VACIO);
        setReceta(RECETA_VACIA);
    };

    const handleCampo = (campo, valor) => {
        setProductoActual((prev) => ({ ...prev, [campo]: valor }));
    };

    // Guardar (crear o actualizar)
    const guardar = async (data) => {
        setGuardando(true);

        const formData = new FormData();
        formData.append('nombre', data.nombre);
        formData.append('precio', data.precio);
        formData.append('categoria_id', data.categoria_id);
        formData.append('es_domicilio', data.es_domicilio ? '1' : '0');

        // Imagen recibida como parte del objeto de datos del formulario
        if (data.imagen) {
            formData.append('imagen_producto', data.imagen);
        }

        // Receta como JSON string para compatibilidad con FormData
        formData.append('receta', JSON.stringify(
            (data.receta ?? []).map((r) => ({ insumo_id: r.insumo_id, cantidad: r.cantidad }))
        ));

        // Insumos adicionales para domicilio
        formData.append('receta_domicilio', JSON.stringify(
            (data.receta_domicilio ?? []).map((r) => ({ insumo_id: r.insumo_id, cantidad: r.cantidad }))
        ));

        const esEdicion = Boolean(productoActual.id);
        const url = esEdicion ? `/productos/${productoActual.id}` : '/productos';

        if (esEdicion) {
            formData.append('_method', 'PUT');
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        try {
            await axios.post(url, formData, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });

            cerrarModal();
            cargarProductos();
            Swal.fire({
                icon: 'success',
                title: esEdicion ? 'Producto actualizado' : 'Producto creado',
                timer: 1800,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (error) {
            if (error.response) {
                const err = error.response.data;
                if (error.response.status === 422) {
                    throw err; // React Hook Form manejará esto
                }
                Swal.fire('Error', err.message ?? 'No se pudo guardar el producto', 'error');
                return;
            }
            Swal.fire('Error', 'No se pudo guardar el producto', 'error');
        } finally {
            setGuardando(false);
        }
    };

    // Eliminar con confirmación SweetAlert2
    const eliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: DANGER,
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        try {
            await axios.delete(`/productos/${id}`, {
                headers: { 'X-CSRF-TOKEN': csrfToken }
            });

            cargarProductos();
            Swal.fire({ icon: 'success', title: 'Producto eliminado', timer: 1500, showConfirmButton: false });
        } catch (error) {
            if (error.response) {
                // Manejo del estado 409 (Conflicto / Producto en uso)
                if (error.response.status === 409) {
                    const data = error.response.data;
                    Swal.fire('No se puede eliminar', data.error || 'El producto está en uso', 'warning');
                    return;
                }
            }

            Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
        }
    };

    // Paginación
    const irAPagina = (url) => {
        if (!url) return;
        const u = new URL(url, window.location.origin);
        const pagina = u.searchParams.get('page');
        if (pagina) setPaginaActual(Number(pagina));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div>
                        <h1 className="text-lg sm:xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center lg:justify-normal gap-3">
                            <svg className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            Gestión de Productos
                        </h1>
                        <p className="text-gray-600 lg:mt-1 text-sm lg:text-md">Administra el catálogo de productos</p>
                    </div>
                    <div className="flex items-center justify-center flex-col-reverse gap-2 md:flex-row md:gap-4 mt-4 lg:mt-0">
                        <div className="relative w-full md:w-auto">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                placeholder="Buscar productos..."
                                className="form-input pl-9"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={abrirCrear}
                            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 4v16m8-8H4"></path>
                            </svg>
                            Nuevo Producto
                        </button>
                    </div>
                </div>

                {/* Pills de categoría */}
                <div className="mt-4">
                    <PillsCategorias
                        categorias={categorias}
                        activa={categoriaFiltro}
                        onChange={(id) => setCategoriaFiltro(id ? String(id) : '')}
                        size="md"
                    />
                </div>
            </div>

            {/* Spinner */}
            {cargando && (
                <div className="flex items-center justify-center py-16">
                    <Spinner size="lg" />
                </div>
            )}

            {/* Grid de productos */}
            {!cargando && (
                <>
                    {paginacion && paginacion.total > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {paginacion.total} producto{paginacion.total !== 1 ? 's' : ''}
                        </p>
                    )}
                    <TablaProductos
                        productos={productos}
                        onEditar={abrirEditar}
                        onEliminar={eliminar}
                    />
                </>
            )}

            {/* Paginación */}
            {paginacion && paginacion.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1.5">
                    <button
                        onClick={() => irAPagina(paginacion.prev_page_url)}
                        disabled={!paginacion.prev_page_url}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                        &laquo; Anterior
                    </button>

                    {paginacion.links
                        .filter((l) => !l.label.includes('&laquo;') && !l.label.includes('&raquo;'))
                        .map((link, i) => (
                            <button
                                key={i}
                                onClick={() => irAPagina(link.url)}
                                disabled={!link.url || link.active}
                                className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
                                    link.active
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-40'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}

                    <button
                        onClick={() => irAPagina(paginacion.next_page_url)}
                        disabled={!paginacion.next_page_url}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                        Siguiente &raquo;
                    </button>
                </div>
            )}

            {/* Modal */}
            <ModalProducto
                abierto={modalAbierto}
                producto={productoActual}
                categorias={categorias}
                insumos={insumos}
                onGuardar={guardar}
                onCerrar={cerrarModal}
                guardando={guardando}
            />
        </div>
    );
}
