import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import ListaProductos from './ListaProductos';
import Carrito from './Carrito';
import IconButton from '../shared/IconButton';
import { DANGER } from '../../utils/colors';
import { ModalNuevoPedidoPropTypes } from '../../propTypes';
import axios from '../../services/axios'

const PEDIDO_VACIO = {
    tipo: 'mesa',
    numero_mesa: '',
    direccion: '',
    nombre_cliente: '',
};

export default function ModalNuevoPedido({ abierto, productos, onCreado, onCerrar, pedidoEditar = null, setActualizado, actualizado }) {
    const esEdicion = Boolean(pedidoEditar);

    const [pedido, setPedido] = useState(PEDIDO_VACIO);
    const [carrito, setCarrito] = useState([]);
    const [adicionesDisponibles, setAdicionesDisponibles] = useState([]);
    const [configuraciones, setConfiguraciones] = useState([]);
    const [direccionError, setDireccionError] = useState('');
    const [enviando, setEnviando] = useState(false);

    // Cargar configuraciones y adiciones
    useEffect(() => {
        if (abierto) {
            axios.get('/configuraciones')
                .then((r) => setConfiguraciones(r.data))
                .catch(() => { });

            axios.get('/adiciones')
                .then((r) => setAdicionesDisponibles(r.data))
                .catch(() => { });
        }
    }, [abierto]);

    const recargoDomicilio = parseFloat(configuraciones.find(c => c.clave === 'recargo_domicilio')?.valor ?? 0);

    // Pre-cargar datos cuando se edita
    useEffect(() => {
        if (abierto && pedidoEditar) {
            setPedido({
                tipo: pedidoEditar.tipo,
                numero_mesa: pedidoEditar.numero_mesa ?? '',
                direccion: pedidoEditar.direccion ?? '',
                nombre_cliente: pedidoEditar.nombre_cliente ?? '',
            });
            const carritoInicial = (pedidoEditar.detalles ?? []).map((d) => ({
                id: d.producto_id,
                nombre: d.producto?.nombre ?? '',
                precio: parseFloat(d.precio_unitario),
                cantidad: d.cantidad,
                subtotal: parseFloat(d.precio_unitario) * d.cantidad,
                nota: d.observacion ?? '',
                adiciones: (d.adiciones ?? []),
            }));
            setCarrito(carritoInicial);
        } else if (abierto && !pedidoEditar) {
            setPedido(PEDIDO_VACIO);
            setCarrito([]);
        }
        setDireccionError('');
    }, [abierto, pedidoEditar]);

    const incrementar = (producto) => {
        setCarrito((prev) => {
            const existe = prev.find((i) => i.id === producto.id);
            if (existe) {
                return prev.map((i) =>
                    i.id === producto.id
                        ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio }
                        : i
                );
            }
            return [...prev, { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1, subtotal: producto.precio, nota: '', adiciones: [] }];
        });
    };

    const cambiarNota = (productoId, valor) => {
        setCarrito((prev) =>
            prev.map((i) => (i.id === productoId ? { ...i, nota: valor } : i))
        );
    };

    const adicionIncrementar = (productoId, adicion) => {
        setCarrito((prev) =>
            prev.map((item) => {
                if (item.id !== productoId) return item;
                const adiciones = item.adiciones ?? [];
                const existe = adiciones.find((a) => a.adicion_id === adicion.id);
                const nuevasAdiciones = existe
                    ? adiciones.map((a) =>
                        a.adicion_id === adicion.id
                            ? { ...a, cantidad: a.cantidad + 1, subtotal: (a.cantidad + 1) * a.precio }
                            : a
                    )
                    : [
                        ...adiciones,
                        {
                            adicion_id: adicion.id,
                            nombre: adicion.nombre,
                            precio: parseFloat(adicion.precio),
                            cantidad: 1,
                            subtotal: parseFloat(adicion.precio),
                        },
                    ];
                return { ...item, adiciones: nuevasAdiciones };
            })
        );
    };

    const adicionDecrementar = (productoId, adicion) => {
        setCarrito((prev) =>
            prev.map((item) => {
                if (item.id !== productoId) return item;
                const adiciones = item.adiciones ?? [];
                const existe = adiciones.find((a) => a.adicion_id === adicion.id);
                if (!existe || existe.cantidad === 0) return item;
                const nuevasAdiciones =
                    existe.cantidad === 1
                        ? adiciones.filter((a) => a.adicion_id !== adicion.id)
                        : adiciones.map((a) =>
                            a.adicion_id === adicion.id
                                ? { ...a, cantidad: a.cantidad - 1, subtotal: (a.cantidad - 1) * a.precio }
                                : a
                        );
                return { ...item, adiciones: nuevasAdiciones };
            })
        );
    };

    const decrementar = (producto) => {
        setCarrito((prev) => {
            const existe = prev.find((i) => i.id === producto.id);
            if (!existe || existe.cantidad === 0) return prev;
            if (existe.cantidad === 1) return prev.filter((i) => i.id !== producto.id);
            return prev.map((i) =>
                i.id === producto.id
                    ? { ...i, cantidad: i.cantidad - 1, subtotal: (i.cantidad - 1) * i.precio }
                    : i
            );
        });
    };

    const eliminarDelCarrito = (productoId) => {
        setCarrito((prev) => prev.filter((i) => i.id !== productoId));
    };

    const validarDireccion = (valor) => {
        if (pedido.tipo !== 'domicilio') { setDireccionError(''); return; }
        setDireccionError(
            valor.trim().length < 5
                ? 'Por favor ingresa una dirección más detallada'
                : ''
        );
    };

    const puedeCrear = () => {
        if (carrito.length === 0) return false;
        if (pedido.tipo === 'mesa') return String(pedido.numero_mesa).trim() !== '' && parseInt(pedido.numero_mesa) > 0;
        if (pedido.tipo === 'domicilio') return pedido.direccion.trim().length >= 5;
        if (pedido.tipo === 'recoger') return true;
        return false;
    };

    const cerrar = () => {
        setPedido(PEDIDO_VACIO);
        setCarrito([]);
        setDireccionError('');
        onCerrar();
    };

    const guardar = async () => {
        if (!puedeCrear()) {
            Swal.fire({ icon: 'warning', title: 'Completa todos los campos requeridos', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
            return;
        }

        if (pedido.tipo === 'mesa') {
            const n = parseInt(pedido.numero_mesa);
            if (isNaN(n) || n <= 0) {
                Swal.fire({ icon: 'error', title: 'El número de mesa debe ser mayor a 0', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                return;
            }
        }

        const perfilActivoRaw = localStorage.getItem('perfil_activo');
        let idPerfil = null;

        if (perfilActivoRaw) {
            try {
                const perfilObj = JSON.parse(perfilActivoRaw);
                idPerfil = perfilObj.id_perfil || perfilObj.id;
            } catch (e) {
                idPerfil = perfilActivoRaw;
            }
        }

        if (!idPerfil && !esEdicion) {
            Swal.fire({ icon: 'error', title: 'No se detectó un perfil activo. Por favor reingresa.', timer: 3000, showConfirmButton: false, toast: true, position: 'top-end' });
            return;
        }

        setEnviando(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        const url = esEdicion ? `/pedidos/${pedidoEditar.id}` : '/pedidos';
        const method = esEdicion ? 'put' : 'post';

        try {
            await axios({
                method,
                url,
                headers: { 'X-CSRF-TOKEN': csrfToken },
                data: {
                    tipo: pedido.tipo,
                    numero_mesa: pedido.numero_mesa || null,
                    direccion: pedido.direccion || null,
                    nombre_cliente: pedido.nombre_cliente?.trim() || null,
                    id_perfil: idPerfil,
                    productos: carrito.map((item) => ({
                        producto_id: item.id,
                        cantidad: item.cantidad,
                        precio: item.precio,
                        observacion: item.nota?.trim() || null,
                        adiciones: (item.adiciones ?? []).map((a) => ({
                            adicion_id: a.adicion_id,
                            nombre: a.nombre,
                            precio: a.precio,
                            cantidad: a.cantidad,
                        })),
                    })),
                },
            });

            Swal.fire({
                icon: 'success',
                title: esEdicion ? 'Pedido actualizado exitosamente' : 'Pedido creado exitosamente',
                timer: 1800, showConfirmButton: false, toast: true, position: 'top-end',
            });

            if (esEdicion) {
                setActualizado(!actualizado);
            }

            cerrar();
            onCreado();
        } catch (error) {
            if (error.response) {
                const data = error.response.data;

                // Stock insuficiente — mostrar detalle de insumos faltantes
                if (error.response.status === 422 && data.faltantes?.length) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Stock insuficiente',
                        html: `<ul class="text-left text-sm space-y-1 mt-2">${data.faltantes.map((f) => `<li>· ${f}</li>`).join('')}</ul>`,
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: DANGER,
                    });
                    return;
                }

                // Otro tipo de error controlado devuelto por el servidor
                Swal.fire({ icon: 'error', title: data.error || 'Error al guardar el pedido', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
                return;
            }

            // Error de red o conexión sin respuesta
            Swal.fire({ icon: 'error', title: 'Error al guardar el pedido', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        } finally {
            setEnviando(false);
        }
    };

    if (!abierto) return null;

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 4v16m8-8H4"></path>
                            </svg>
                            {esEdicion ? `Editar Pedido #${pedidoEditar.numero_dia || pedidoEditar.id}` : 'Crear Nuevo Pedido'}
                        </h2>
                        <IconButton onClick={cerrar} aria-label="Cerrar" variant="default">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </IconButton>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tipo de Pedido — card selectors */}
                        <div className="lg:col-span-1">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-500 dark:text-gray-400 mb-3 text-sm uppercase tracking-wide">Tipo de Pedido</h3>
                                <div className="space-y-2">

                                    {/* MESA */}
                                    <button
                                        type="button"
                                        onClick={() => setPedido((p) => ({ ...p, tipo: 'mesa', direccion: '', nombre_cliente: '' }))}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                            pedido.tipo === 'mesa'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                            pedido.tipo === 'mesa' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                        }`}>
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                                                <path d="M6 12v4m12-4v4M4 19h16"></path>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${pedido.tipo === 'mesa' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>Mesa</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Consumo en el local</p>
                                        </div>
                                        {pedido.tipo === 'mesa' && (
                                            <svg className="h-5 w-5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M20 6L9 17l-5-5"></path>
                                            </svg>
                                        )}
                                    </button>

                                    {pedido.tipo === 'mesa' && (
                                        <div className="px-1 pt-1">
                                            <label className="form-label">Número de mesa</label>
                                            <input
                                                type="number"
                                                value={pedido.numero_mesa}
                                                onChange={(e) => setPedido((p) => ({ ...p, numero_mesa: e.target.value }))}
                                                placeholder="Ej: 5"
                                                min="1"
                                                autoFocus
                                                className="form-input"
                                            />
                                        </div>
                                    )}

                                    {/* DOMICILIO */}
                                    <button
                                        type="button"
                                        onClick={() => setPedido((p) => ({ ...p, tipo: 'domicilio', numero_mesa: '', nombre_cliente: '' }))}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                            pedido.tipo === 'domicilio'
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                            pedido.tipo === 'domicilio' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                        }`}>
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${pedido.tipo === 'domicilio' ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>Domicilio</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Entrega a dirección</p>
                                        </div>
                                        {pedido.tipo === 'domicilio' && (
                                            <svg className="h-5 w-5 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M20 6L9 17l-5-5"></path>
                                            </svg>
                                        )}
                                    </button>

                                    {pedido.tipo === 'domicilio' && (
                                        <div className="px-1 pt-1">
                                            <label className="form-label">Dirección de entrega</label>
                                            <textarea
                                                value={pedido.direccion}
                                                onChange={(e) => {
                                                    setPedido((p) => ({ ...p, direccion: e.target.value }));
                                                    validarDireccion(e.target.value);
                                                }}
                                                placeholder="Ej: calle 23 #11-21 apto 101"
                                                rows="3"
                                                autoFocus
                                                className="form-input resize-none"
                                            />
                                            {direccionError && <p className="form-error">{direccionError}</p>}
                                        </div>
                                    )}

                                    {/* RECOGER */}
                                    <button
                                        type="button"
                                        onClick={() => setPedido((p) => ({ ...p, tipo: 'recoger', numero_mesa: '', direccion: '' }))}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                            pedido.tipo === 'recoger'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                            pedido.tipo === 'recoger' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                        }`}>
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
                                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                                <path d="M16 10a4 4 0 01-8 0"></path>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${pedido.tipo === 'recoger' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'}`}>Recoger</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">El cliente pasa a buscar</p>
                                        </div>
                                        {pedido.tipo === 'recoger' && (
                                            <svg className="h-5 w-5 text-orange-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M20 6L9 17l-5-5"></path>
                                            </svg>
                                        )}
                                    </button>

                                    {pedido.tipo === 'recoger' && (
                                        <div className="px-1 pt-1">
                                            <label className="form-label">
                                                Nombre del cliente <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={pedido.nombre_cliente}
                                                onChange={(e) => setPedido((p) => ({ ...p, nombre_cliente: e.target.value }))}
                                                placeholder="Ej: Juan Pérez"
                                                autoFocus
                                                className="form-input"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Productos + Carrito */}
                        <div className="lg:col-span-2">
                            <ListaProductos
                                productos={productos}
                                carrito={carrito}
                                onIncrementar={incrementar}
                                onDecrementar={decrementar}
                            />
                            <Carrito
                                carrito={carrito}
                                adicionesDisponibles={adicionesDisponibles}
                                onEliminar={eliminarDelCarrito}
                                onNotaChange={cambiarNota}
                                onAdicionIncrementar={adicionIncrementar}
                                onAdicionDecrementar={adicionDecrementar}
                                tipoPedido={pedido.tipo}
                                recargoDomicilio={recargoDomicilio}
                            />
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={cerrar} className="btn-secondary">
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={guardar}
                            disabled={!puedeCrear() || enviando}
                            className="btn-primary px-6"
                        >
                            {enviando ? 'Guardando...' : (esEdicion ? 'Guardar Cambios' : 'Crear Pedido')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

ModalNuevoPedido.propTypes = ModalNuevoPedidoPropTypes;

