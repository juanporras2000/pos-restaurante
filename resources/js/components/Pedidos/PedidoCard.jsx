import React, { useState } from 'react';
import Swal from 'sweetalert2';
import ModalNuevoPedido from './ModalNuevoPedido';
import ModalPago from './ModalPago';

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function PedidoCard({ pedido, productos, onActualizado }) {
    const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

    const eliminarPedido = async () => {
        const { value: razon, isConfirmed } = await Swal.fire({
            title: 'Eliminar pedido',
            html: `
                <p class="text-sm text-gray-600 mb-3">Indica la razón por la que se elimina este pedido:</p>
                <textarea id="swal-razon" class="swal2-textarea" placeholder="Ej: Cliente canceló, error en el pedido..." rows="3"></textarea>
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
            const res = await fetch(`/api/pedidos/${pedido.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ razon_eliminacion: razon }),
            });
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Pedido eliminado correctamente', timer: 1800, showConfirmButton: false, toast: true, position: 'top-end' });
                onActualizado?.();
            } else {
                const data = await res.json();
                Swal.fire({ icon: 'error', title: data.error || 'Error al eliminar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error al eliminar el pedido', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        }
    };
    return (
        <>
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
                    {pedido.tipo === 'recoger' && (
                        <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 12V22H4V12"></path>
                                <path d="M22 7H2v5h20V7z"></path>
                                <path d="M12 22V7"></path>
                                <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"></path>
                                <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"></path>
                            </svg>
                            {pedido.nombre_cliente ? `Recoger — ${pedido.nombre_cliente}` : 'Para recoger'}
                        </p>
                    )}
                </div>
                <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    pedido.tipo === 'mesa' ? 'bg-blue-100 text-blue-800'
                    : pedido.tipo === 'domicilio' ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                    {pedido.tipo === 'mesa' ? 'Mesa' : pedido.tipo === 'domicilio' ? 'Domicilio' : 'Recoger'}
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
                        {detalle.adiciones?.length > 0 && (
                            <div className="mt-0.5 ml-1 space-y-0.5">
                                {detalle.adiciones.map((adic, i) => (
                                    <p key={i} className="text-xs text-purple-600 flex justify-between">
                                        <span>+ {adic.nombre} x{adic.cantidad}</span>
                                        <span>${parseFloat(adic.subtotal).toFixed(2)}</span>
                                    </p>
                                ))}
                            </div>
                        )}
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
                    onClick={() => setModalPagoAbierto(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                >
                    Procesar Pago
                </button>
                <button
                    type="button"
                    onClick={() => setModalEditarAbierto(true)}
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
                    onClick={eliminarPedido}
                    className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm"
                    title="Eliminar pedido"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>

        <ModalNuevoPedido
                abierto={modalEditarAbierto}
                productos={productos}
                pedidoEditar={pedido}
                onCreado={() => { setModalEditarAbierto(false); onActualizado?.(); }}
                onCerrar={() => setModalEditarAbierto(false)}
            />

            <ModalPago
                abierto={modalPagoAbierto}
                pedido={pedido}
                onPagado={() => { setModalPagoAbierto(false); onActualizado?.(); }}
                onCerrar={() => setModalPagoAbierto(false)}
            />
        </>
    );
}
