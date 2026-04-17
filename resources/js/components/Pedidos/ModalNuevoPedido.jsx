import React, { useState } from 'react';
import Swal from 'sweetalert2';
import ListaProductos from './ListaProductos';
import Carrito from './Carrito';

const DIRECCION_REGEX = /^(carrera|calle) \d+ #\d+-\d+( .*)?$/i;

const PEDIDO_VACIO = {
    tipo: 'mesa',
    numero_mesa: '',
    direccion: '',
};

export default function ModalNuevoPedido({ abierto, productos, onCreado, onCerrar }) {
    const [pedido, setPedido] = useState(PEDIDO_VACIO);
    const [carrito, setCarrito] = useState([]);
    const [direccionError, setDireccionError] = useState('');
    const [enviando, setEnviando] = useState(false);

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
            return [...prev, { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1, subtotal: producto.precio }];
        });
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
            !DIRECCION_REGEX.test(valor)
                ? 'Formato: carrera/calle 23 #11-21 (opcional texto adicional)'
                : ''
        );
    };

    const puedeCrear = () => {
        if (carrito.length === 0) return false;
        if (pedido.tipo === 'mesa') return String(pedido.numero_mesa).trim() !== '' && parseInt(pedido.numero_mesa) > 0;
        if (pedido.tipo === 'domicilio') return DIRECCION_REGEX.test(pedido.direccion);
        return false;
    };

    const cerrar = () => {
        setPedido(PEDIDO_VACIO);
        setCarrito([]);
        setDireccionError('');
        onCerrar();
    };

    const crear = async () => {
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

        setEnviando(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        try {
            const res = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({
                    tipo: pedido.tipo,
                    numero_mesa: pedido.numero_mesa || null,
                    direccion: pedido.direccion || null,
                    productos: carrito.map((item) => ({
                        producto_id: item.id,
                        cantidad: item.cantidad,
                        precio: item.precio,
                    })),
                }),
            });

            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Pedido creado exitosamente', timer: 1800, showConfirmButton: false, toast: true, position: 'top-end' });
                cerrar();
                onCreado();
            } else {
                Swal.fire({ icon: 'error', title: 'Error al crear el pedido', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al crear el pedido', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        } finally {
            setEnviando(false);
        }
    };

    if (!abierto) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}
        >
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 4v16m8-8H4"></path>
                            </svg>
                            Crear Nuevo Pedido
                        </h2>
                        <button type="button" onClick={cerrar} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tipo de Pedido */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-4">Tipo de Pedido</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tipo"
                                            value="mesa"
                                            checked={pedido.tipo === 'mesa'}
                                            onChange={() => setPedido((p) => ({ ...p, tipo: 'mesa', direccion: '' }))}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-700">Para llevar a mesa</span>
                                    </label>

                                    {pedido.tipo === 'mesa' && (
                                        <div className="ml-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de mesa</label>
                                            <input
                                                type="number"
                                                value={pedido.numero_mesa}
                                                onChange={(e) => setPedido((p) => ({ ...p, numero_mesa: e.target.value }))}
                                                placeholder="Ej: 5"
                                                min="1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    )}

                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tipo"
                                            value="domicilio"
                                            checked={pedido.tipo === 'domicilio'}
                                            onChange={() => setPedido((p) => ({ ...p, tipo: 'domicilio', numero_mesa: '' }))}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-700">Para domicilio</span>
                                    </label>

                                    {pedido.tipo === 'domicilio' && (
                                        <div className="ml-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega</label>
                                            <textarea
                                                value={pedido.direccion}
                                                onChange={(e) => {
                                                    setPedido((p) => ({ ...p, direccion: e.target.value }));
                                                    validarDireccion(e.target.value);
                                                }}
                                                placeholder="Ej: calle 23 #11-21 apto 101"
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {direccionError && (
                                                <p className="mt-1 text-sm text-red-600">{direccionError}</p>
                                            )}
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
                            <Carrito carrito={carrito} onEliminar={eliminarDelCarrito} />
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={cerrar}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={crear}
                            disabled={!puedeCrear() || enviando}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                        >
                            {enviando ? 'Creando...' : 'Crear Pedido'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
