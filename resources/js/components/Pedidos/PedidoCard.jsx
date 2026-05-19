import React, { useState } from 'react';
import Swal from 'sweetalert2';
import ModalNuevoPedido from './ModalNuevoPedido';
import ModalPago from './ModalPago';
import { useImprimir } from '../../hooks/useImprimir';
import { PedidoCardPropTypes } from '../../propTypes';

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function PedidoCard({ pedido, productos, onActualizado }) {
    const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const { imprimir } = useImprimir();

    // Calcular subtotal (suma de items) para ver si hay recargo
    const subtotalItems = pedido.detalles?.reduce((acc, d) => acc + parseFloat(d.subtotal), 0) || 0;
    const tieneRecargo = pedido.tipo === 'domicilio' && parseFloat(pedido.total) > subtotalItems;
    const valorRecargo = parseFloat(pedido.total) - subtotalItems;

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
        <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all duration-200 min-h-[380px]">

            {/* BLOQUE SUPERIOR */}
            <div>
                {/* Banner de tipo de pedido */}
                <div className={`px-4 py-2 flex justify-between items-center text-xs font-bold uppercase tracking-wider ${
                    pedido.tipo === 'mesa' ? 'bg-blue-50 text-blue-700 border-b border-blue-100'
                    : pedido.tipo === 'domicilio' ? 'bg-green-50 text-green-700 border-b border-green-100'
                    : 'bg-orange-50 text-orange-700 border-b border-orange-100'
                }`}>
                    <span>Pedido #{pedido.numero_dia || pedido.id}</span>
                    <span>{pedido.tipo === 'mesa' ? 'Mesa' : pedido.tipo === 'domicilio' ? 'Domicilio' : 'Recoger'}</span>
                </div>

                <div className="p-5 pb-0">
                    {/* Ubicación Destacada */}
                    <div className="mb-4 min-h-[40px] flex items-center">
                        {pedido.tipo === 'mesa' && pedido.numero_mesa && (
                            <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                Mesa {pedido.numero_mesa}
                            </h4>
                        )}
                        {pedido.tipo === 'domicilio' && pedido.direccion && (
                            <div className="w-full">
                                <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-tight">Entregar en:</span>
                                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{pedido.direccion}</p>
                            </div>
                        )}
                        {pedido.tipo === 'recoger' && (
                            <div className="w-full">
                                <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-tight">Retira Cliente:</span>
                                <p className="text-sm font-bold text-gray-800 truncate">{pedido.nombre_cliente || 'Cliente General'}</p>
                            </div>
                        )}
                    </div>

                    {/* Lista de productos scrolleable */}
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1 border-t border-b border-gray-50 py-3">
                        {pedido.detalles?.map((detalle) => (
                            <div key={detalle.id} className="text-xs">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-700 font-medium flex-1 pr-2 truncate">{detalle.producto?.nombre}</span>
                                    <span className="text-gray-400 font-bold px-2">x{detalle.cantidad}</span>
                                    <span className="font-semibold text-gray-900">${parseFloat(detalle.subtotal).toFixed(2)}</span>
                                </div>
                                {detalle.adiciones?.length > 0 && (
                                    <div className="mt-0.5 ml-2 bg-purple-50 p-1 rounded text-[11px] text-purple-700 space-y-0.5">
                                        {detalle.adiciones.map((adic, i) => (
                                            <p key={i} className="flex justify-between">
                                                <span>+ {adic.nombre} (x{adic.cantidad})</span>
                                                <span>${parseFloat(adic.subtotal).toFixed(2)}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                                {detalle.observacion && (
                                    <p className="text-[11px] text-amber-600 italic mt-0.5 ml-2">
                                        💡 {detalle.observacion}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BLOQUE INFERIOR */}
            <div className="p-5 pt-0">
                {/* Metadata: Fecha e inyección limpia de la relación Perfil */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-3">
                    <span>{formatDate(pedido.created_at)}</span>
                    {pedido.perfil?.nombre && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium border border-gray-200">
                            <svg className="h-2.5 w-2.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            {pedido.perfil.nombre}
                        </span>
                    )}
                </div>

                {/* Totales */}
                <div className="bg-gray-50 p-2.5 rounded-lg mb-3 space-y-1">
                    {tieneRecargo && (
                        <div className="flex justify-between text-[11px] text-gray-500">
                            <span>Subtotal</span>
                            <span>${subtotalItems.toFixed(2)}</span>
                        </div>
                    )}
                    {tieneRecargo && (
                        <div className="flex justify-between text-[11px] text-green-600 font-medium">
                            <span>Domicilio</span>
                            <span>+${valorRecargo.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Total</span>
                        <span className="text-lg font-black text-gray-900">${parseFloat(pedido.total).toFixed(2)}</span>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-1.5">
                    <button
                        type="button"
                        onClick={() => setModalPagoAbierto(true)}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-2 rounded-lg transition-colors text-xs uppercase tracking-wider"
                    >
                        Pagar
                    </button>
                    <button
                        type="button"
                        onClick={() => imprimir(pedido)}
                        className="p-2 border border-gray-200 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Imprimir comanda"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"></path>
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => setModalEditarAbierto(true)}
                        className="p-2 border border-gray-200 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar pedido"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={eliminarPedido}
                        className="p-2 border border-gray-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar pedido"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <ModalNuevoPedido abierto={modalEditarAbierto} productos={productos} pedidoEditar={pedido} onCreado={() => { setModalEditarAbierto(false); onActualizado?.(); }} onCerrar={() => setModalEditarAbierto(false)} />
        <ModalPago abierto={modalPagoAbierto} pedido={pedido} onPagado={() => { setModalPagoAbierto(false); onActualizado?.(); }} onCerrar={() => setModalPagoAbierto(false)} />
        </>
    );



    // return (
    //     <>
    //         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    //             {/* Cabecera */}
    //             <div className="flex items-start justify-between mb-4">
    //                 <div className="flex-1 min-w-0 pr-2">


    //                     <h3 className="font-semibold text-gray-900">Pedido #{pedido.numero_dia || pedido.id}</h3>
    //                     <p className="text-sm text-gray-500">{formatDate(pedido.created_at)}</p>

    //                     {pedido.perfil?.nombre && (
    //                         <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
    //                             <svg className="h-3 w-3 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    //                                 <circle cx="12" cy="7" r="4"></circle>
    //                             </svg>
    //                             Atendido por: <span className="font-medium text-gray-500">{pedido.perfil.nombre}</span>
    //                         </p>
    //                     )}

    //                     {pedido.tipo === 'mesa' && pedido.numero_mesa && (
    //                         <p className="text-lg font-medium text-blue-700 mt-1 flex items-center gap-1">
    //                             <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                                 <rect x="3" y="8" width="18" height="4" rx="1"></rect>
    //                                 <path d="M6 12v4m12-4v4M4 19h16"></path>
    //                             </svg>
    //                             Mesa {pedido.numero_mesa}
    //                         </p>
    //                     )}
    //                     {pedido.tipo === 'domicilio' && pedido.direccion && (
    //                         <p className="text-sm text-green-700 mt-1 flex items-start gap-1 break-words">
    //                             <svg className="h-3.5 w-3.5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                                 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
    //                                 <circle cx="12" cy="9" r="2.5"></circle>
    //                             </svg>
    //                             {pedido.direccion}
    //                         </p>
    //                     )}
    //                     {pedido.tipo === 'recoger' && (
    //                         <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
    //                             <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                                 <path d="M20 12V22H4V12"></path>
    //                                 <path d="M22 7H2v5h20V7z"></path>
    //                                 <path d="M12 22V7"></path>
    //                                 <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"></path>
    //                                 <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"></path>
    //                             </svg>
    //                             {pedido.nombre_cliente ? `Recoger — ${pedido.nombre_cliente}` : 'Para recoger'}
    //                         </p>
    //                     )}
    //                 </div>
    //                 <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pedido.tipo === 'mesa' ? 'bg-blue-100 text-blue-800'
    //                     : pedido.tipo === 'domicilio' ? 'bg-green-100 text-green-800'
    //                         : 'bg-orange-100 text-orange-800'
    //                     }`}>
    //                     {pedido.tipo === 'mesa' ? 'Mesa' : pedido.tipo === 'domicilio' ? 'Domicilio' : 'Recoger'}
    //                 </span>
    //             </div>

    //             {/* Items */}
    //             <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
    //                 {pedido.detalles?.map((detalle) => (
    //                     <div key={detalle.id} className="text-sm">
    //                         <div className="flex justify-between items-center">
    //                             <span className="text-gray-700">{detalle.producto?.nombre}</span>
    //                             <span className="text-gray-500">x{detalle.cantidad}</span>
    //                             <span className="font-medium text-gray-900">${parseFloat(detalle.subtotal).toFixed(2)}</span>
    //                         </div>
    //                         {detalle.adiciones?.length > 0 && (
    //                             <div className="mt-0.5 ml-1 space-y-0.5">
    //                                 {detalle.adiciones.map((adic, i) => (
    //                                     <p key={i} className="text-xs text-purple-600 flex justify-between">
    //                                         <span>+ {adic.nombre} x{adic.cantidad}</span>
    //                                         <span>${parseFloat(adic.subtotal).toFixed(2)}</span>
    //                                     </p>
    //                                 ))}
    //                             </div>
    //                         )}
    //                         {detalle.observacion && (
    //                             <p className="text-xs text-amber-600 italic mt-0.5 ml-1">
    //                                 📝 {detalle.observacion}
    //                             </p>
    //                         )}
    //                     </div>
    //                 ))}
    //             </div>

    //             {/* Total */}
    //             <div className="border-t border-gray-100 pt-3 mb-4 space-y-1">
    //                 {tieneRecargo && (
    //                     <div className="flex justify-between items-center text-xs text-gray-500">
    //                         <span>Subtotal items</span>
    //                         <span>${subtotalItems.toFixed(2)}</span>
    //                     </div>
    //                 )}
    //                 {tieneRecargo && (
    //                     <div className="flex justify-between items-center text-xs text-blue-600">
    //                         <span className="flex items-center gap-1">
    //                             <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                                 <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
    //                             </svg>
    //                             Recargo domicilio
    //                         </span>
    //                         <span>+${valorRecargo.toFixed(2)}</span>
    //                     </div>
    //                 )}
    //                 <div className="flex justify-between items-center pt-1">
    //                     <span className="font-semibold text-gray-900">Total</span>
    //                     <span className="text-xl font-bold text-gray-900">${parseFloat(pedido.total).toFixed(2)}</span>
    //                 </div>
    //             </div>

    //             {/* Acciones */}
    //             <div className="flex gap-2">
    //                 <button
    //                     type="button"
    //                     onClick={() => setModalPagoAbierto(true)}
    //                     className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
    //                 >
    //                     Procesar Pago
    //                 </button>
    //                 {/* Imprimir comanda (sin pago) */}
    //                 <button
    //                     type="button"
    //                     onClick={() => imprimir(pedido)}
    //                     className="px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-sm"
    //                     title="Imprimir comanda"
    //                 >
    //                     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                         <path d="M6 9V2h12v7"></path>
    //                         <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    //                         <rect x="6" y="14" width="12" height="8"></rect>
    //                     </svg>
    //                 </button>
    //                 <button
    //                     type="button"
    //                     onClick={() => setModalEditarAbierto(true)}
    //                     className="px-3 py-2 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm"
    //                     title="Editar pedido"
    //                 >
    //                     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                         <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    //                         <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    //                     </svg>
    //                 </button>
    //                 <button
    //                     type="button"
    //                     onClick={eliminarPedido}
    //                     className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm"
    //                     title="Eliminar pedido"
    //                 >
    //                     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                         <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    //                     </svg>
    //                 </button>
    //             </div>
    //         </div>

    //         <ModalNuevoPedido
    //             abierto={modalEditarAbierto}
    //             productos={productos}
    //             pedidoEditar={pedido}
    //             onCreado={() => { setModalEditarAbierto(false); onActualizado?.(); }}
    //             onCerrar={() => setModalEditarAbierto(false)}
    //         />

    //         <ModalPago
    //             abierto={modalPagoAbierto}
    //             pedido={pedido}
    //             onPagado={() => { setModalPagoAbierto(false); onActualizado?.(); }}
    //             onCerrar={() => setModalPagoAbierto(false)}
    //         />
    //     </>
    // );
}

PedidoCard.propTypes = PedidoCardPropTypes;

