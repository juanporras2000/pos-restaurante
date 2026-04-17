import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import ModalNuevoPedido from './ModalNuevoPedido';
import ModalPago from './ModalPago';

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function Pedidos() {
    const [productos, setProductos] = useState([]);
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
    const [pedidoPago, setPedidoPago] = useState(null);

    const cargarProductos = useCallback(() => {
        fetch('/api/productos?todos=1')
            .then((r) => r.json())
            .then((data) => setProductos(data.map((p) => ({ ...p, precio: parseFloat(p.precio) }))))
            .catch(() => {});
    }, []);

    const cargarPendientes = useCallback(() => {
        fetch('/api/pedidos/pendientes')
            .then((r) => r.json())
            .then(setPedidosPendientes)
            .catch(() => {});
    }, []);

    useEffect(() => {
        cargarProductos();
        cargarPendientes();
    }, [cargarProductos, cargarPendientes]);

    const eliminarPedido = async (pedidoId) => {
        const result = await Swal.fire({
            title: '¿Eliminar pedido?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
        });
        if (!result.isConfirmed) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await fetch(`/api/pedidos/${pedidoId}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Pedido eliminado correctamente', timer: 1800, showConfirmButton: false, toast: true, position: 'top-end' });
                cargarPendientes();
            } else {
                const data = await res.json();
                Swal.fire({ icon: 'error', title: data.error || 'Error al eliminar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al eliminar el pedido', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"></path>
                                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                            </svg>
                            Gestión de Pedidos
                        </h1>
                        <p className="text-gray-600 mt-1">Administra pedidos pendientes y crea nuevos</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setModalNuevoAbierto(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 4v16m8-8H4"></path>
                        </svg>
                        Nuevo Pedido
                    </button>
                </div>
            </div>

            {/* Pedidos Pendientes */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                    Pedidos Pendientes
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {pedidosPendientes.length}
                    </span>
                </h2>

                {/* Estado vacío */}
                {pedidosPendientes.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos pendientes</h3>
                        <p className="text-gray-500">Crea un nuevo pedido para comenzar</p>
                    </div>
                )}

                {/* Grid de pedidos */}
                {pedidosPendientes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pedidosPendientes.map((pedido) => (
                            <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                {/* Cabecera */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Pedido #{pedido.id}</h3>
                                        <p className="text-sm text-gray-500">{formatDate(pedido.created_at)}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        pedido.tipo === 'mesa'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {pedido.tipo === 'mesa' ? `Mesa ${pedido.numero_mesa}` : 'Domicilio'}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                                    {pedido.detalles?.map((detalle) => (
                                        <div key={detalle.id} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700">{detalle.producto?.nombre}</span>
                                            <span className="text-gray-500">x{detalle.cantidad}</span>
                                            <span className="font-medium text-gray-900">${parseFloat(detalle.subtotal).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="border-t border-gray-200 pt-4 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">Total</span>
                                        <span className="text-lg font-bold text-gray-900">${parseFloat(pedido.total).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPedidoPago(pedido)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                                    >
                                        Procesar Pago
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => eliminarPedido(pedido.id)}
                                        className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal nuevo pedido */}
            <ModalNuevoPedido
                abierto={modalNuevoAbierto}
                productos={productos}
                onCreado={() => { setModalNuevoAbierto(false); cargarPendientes(); }}
                onCerrar={() => setModalNuevoAbierto(false)}
            />

            {/* Modal pago */}
            <ModalPago
                abierto={pedidoPago !== null}
                pedido={pedidoPago}
                onPagado={() => { setPedidoPago(null); cargarPendientes(); }}
                onCerrar={() => setPedidoPago(null)}
            />
        </div>
    );
}
