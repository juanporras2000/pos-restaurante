import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import ModalNuevoPedido from './ModalNuevoPedido';
import ModalPago from './ModalPago';
import HistorialPedidos from '../Productos/HistorialPedidos';

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function PedidoCard({ pedido, onPago, onEditar, onEliminar }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Cabecera */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-gray-900">Pedido #{pedido.id}</h3>
                    <p className="text-sm text-gray-500">{formatDate(pedido.created_at)}</p>
                    {pedido.tipo === 'mesa' && pedido.numero_mesa && (
                        <p className="text-lg font-medium text-blue-700 mt-1 flex items-center gap-1">
                            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                                <path d="M6 12v4m12-4v4M4 19h16"></path>
                            </svg>
                            Mesa {pedido.numero_mesa}
                        </p>
                    )}
                    {pedido.tipo === 'domicilio' && pedido.direccion && (
                        <p className="text-sm text-green-700 mt-1 flex items-start gap-1 break-words">
                            <svg className="h-3.5 w-3.5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                                <circle cx="12" cy="9" r="2.5"></circle>
                            </svg>
                            {pedido.direccion}
                        </p>
                    )}
                </div>
                <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    pedido.tipo === 'mesa' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                    {pedido.tipo === 'mesa' ? 'Mesa' : 'Domicilio'}
                </span>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {pedido.detalles?.map((detalle) => (
                    <div key={detalle.id} className="text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">{detalle.producto?.nombre}</span>
                            <span className="text-gray-500">x{detalle.cantidad}</span>
                            <span className="font-medium text-gray-900">${parseFloat(detalle.subtotal).toFixed(2)}</span>
                        </div>
                        {detalle.observacion && (
                            <p className="text-xs text-amber-600 italic mt-0.5 ml-1">
                                📝 {detalle.observacion}
                            </p>
                        )}
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
                    onClick={onPago}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                >
                    Procesar Pago
                </button>
                <button
                    type="button"
                    onClick={onEditar}
                    className="px-3 py-2 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm"
                    title="Editar pedido"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={onEliminar}
                    className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm"
                    title="Eliminar pedido"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default function Pedidos() {
    const [tab, setTab] = useState('pedidos');
    const [productos, setProductos] = useState([]);
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
    const [pedidoEditar, setPedidoEditar] = useState(null);
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
        // Paso 1: pedir razón de eliminación
        const { value: razon, isConfirmed } = await Swal.fire({
            title: 'Eliminar pedido',
            html: `
                <p class="text-sm text-gray-600 mb-3">Indica la razón por la que se elimina este pedido:</p>
                <textarea id="swal-razon" class="swal2-textarea" placeholder="Ej: Cliente canceló, error en el pedido..." rows="3"resize:vertical;"></textarea>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            preConfirm: () => {
                const val = document.getElementById('swal-razon').value.trim();
                if (!val) {
                    Swal.showValidationMessage('La razón es obligatoria');
                    return false;
                }
                return val;
            },
        });

        if (!isConfirmed || !razon) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
        try {
            const res = await fetch(`/api/pedidos/${pedidoId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ razon_eliminacion: razon }),
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
            <div className="mb-6">
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
                    {tab === 'pedidos' && (
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
                    )}
                </div>

                {/* Tabs */}
                <div className="mt-6 flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                    <button
                        type="button"
                        onClick={() => setTab('pedidos')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            tab === 'pedidos'
                                ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="6" y="4" width="12" height="16" rx="2"></rect>
                            <path d="M9 8h6M9 12h6M9 16h4"></path>
                        </svg>
                        Pendientes
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('historial')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            tab === 'historial'
                                ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Historial del Día
                    </button>
                </div>
            </div>

            {/* Tab: Historial */}
            {tab === 'historial' && <HistorialPedidos />}

            {/* Tab: Pedidos pendientes */}
            {tab === 'pedidos' && pedidosPendientes.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-8">
                    <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos pendientes</h3>
                    <p className="text-gray-500">Crea un nuevo pedido para comenzar</p>
                </div>
            )}

            {tab === 'pedidos' && pedidosPendientes.some((p) => p.tipo === 'mesa') && (
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                            <path d="M6 12v4m12-4v4M4 19h16"></path>
                        </svg>
                        Pedidos para Mesa
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {pedidosPendientes.filter((p) => p.tipo === 'mesa').length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pedidosPendientes.filter((p) => p.tipo === 'mesa').map((pedido) => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                onPago={() => setPedidoPago(pedido)}
                                onEditar={() => setPedidoEditar(pedido)}
                                onEliminar={() => eliminarPedido(pedido.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {tab === 'pedidos' && pedidosPendientes.some((p) => p.tipo === 'domicilio') && (
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                            <circle cx="12" cy="9" r="2.5"></circle>
                        </svg>
                        Pedidos a Domicilio
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {pedidosPendientes.filter((p) => p.tipo === 'domicilio').length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pedidosPendientes.filter((p) => p.tipo === 'domicilio').map((pedido) => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                onPago={() => setPedidoPago(pedido)}
                                onEditar={() => setPedidoEditar(pedido)}
                                onEliminar={() => eliminarPedido(pedido.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Modal nuevo / editar pedido */}
            <ModalNuevoPedido
                abierto={modalNuevoAbierto || pedidoEditar !== null}
                productos={productos}
                pedidoEditar={pedidoEditar}
                onCreado={() => { setModalNuevoAbierto(false); setPedidoEditar(null); cargarPendientes(); }}
                onCerrar={() => { setModalNuevoAbierto(false); setPedidoEditar(null); }}
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
