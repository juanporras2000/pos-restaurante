import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import TablaProductos from './TablaProductos';
import ModalProducto from './ModalProducto';

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
        fetch('/api/categorias')
            .then((r) => r.json())
            .then(setCategorias)
            .catch(() => {});
        fetch('/api/insumos')
            .then((r) => r.json())
            .then(setInsumos)
            .catch(() => {});
    }, []);

    // Cargar productos cuando cambia búsqueda o página
    const cargarProductos = useCallback(() => {
        setCargando(true);
        const params = new URLSearchParams({ page: paginaActual });
        if (buscar.trim()) params.append('buscar', buscar.trim());

        fetch(`/api/productos?${params}`)
            .then((r) => r.json())
            .then((data) => {
                setProductos(data.data ?? []);
                setPaginacion(data);
            })
            .catch(() => {
                Swal.fire('Error', 'No se pudo cargar los productos', 'error');
            })
            .finally(() => setCargando(false));
    }, [buscar, paginaActual]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPaginaActual(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [buscar]);

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
        
        // Imagen desde la variable global temporal
        if (window._tmp_img) {
            formData.append('imagen_producto', window._tmp_img);
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
        const url = esEdicion ? `/api/productos/${productoActual.id}` : '/api/productos';

        if (esEdicion) {
            formData.append('_method', 'PUT');
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken },
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                if (res.status === 422) {
                    throw err; // React Hook Form manejará esto
                }
                throw new Error(err.message ?? 'Error al guardar');
            }

            delete window._tmp_img;
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
        } catch (err) {
            if (err.errors) throw err;
            Swal.fire('Error', err.message ?? 'No se pudo guardar el producto', 'error');
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
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        try {
            const res = await fetch(`/api/productos/${id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' },
            });

            if (res.status === 409) {
                const data = await res.json();
                Swal.fire('No se puede eliminar', data.error, 'warning');
                return;
            }

            if (!res.ok) throw new Error();

            cargarProductos();
            Swal.fire({ icon: 'success', title: 'Producto eliminado', timer: 1500, showConfirmButton: false });
        } catch {
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
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            Gestión de Productos
                        </h1>
                        <p className="text-gray-600 mt-1">Administra el catálogo de productos</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={buscar}
                            onChange={(e) => setBuscar(e.target.value)}
                            placeholder="Buscar productos..."
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={abrirCrear}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 4v16m8-8H4"></path>
                            </svg>
                            Nuevo Producto
                        </button>
                    </div>
                </div>
            </div>

            {/* Spinner */}
            {cargando && (
                <div className="text-center py-10 text-gray-500">Cargando...</div>
            )}

            {/* Grid de productos */}
            {!cargando && (
                <TablaProductos
                    productos={productos}
                    onEditar={abrirEditar}
                    onEliminar={eliminar}
                />
            )}

            {/* Paginación */}
            {paginacion && paginacion.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                        onClick={() => irAPagina(paginacion.prev_page_url)}
                        disabled={!paginacion.prev_page_url}
                        className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
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
                                className={`px-3 py-1 rounded border text-sm transition-colors ${
                                    link.active
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}

                    <button
                        onClick={() => irAPagina(paginacion.next_page_url)}
                        disabled={!paginacion.next_page_url}
                        className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
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
