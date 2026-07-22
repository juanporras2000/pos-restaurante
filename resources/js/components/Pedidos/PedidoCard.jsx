import React, { useState } from 'react';
import Swal from 'sweetalert2';
import ModalNuevoPedido from './ModalNuevoPedido';
import ModalPago from './ModalPago';
import { useImprimir } from '../../hooks/useImprimir';
import { fmtCOP } from '../../utils/format';
import { PedidoCardPropTypes } from '../../propTypes';
import axios from '../../services/axios'

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function timeAgo(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}min`;
}

export default function PedidoCard({ pedido, productos, onActualizado, setEliminado, eliminado, setPagado, pagado, setActualizado, actualizado }) {
    const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const { imprimir } = useImprimir();




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
        await axios.delete(`/pedidos/${pedido.id}`, {
            headers: { 'X-CSRF-TOKEN': csrfToken },
            data: { razon_eliminacion: razon }, // El body de un DELETE en Axios se envía dentro de la propiedad 'data'
        });

        Swal.fire({ icon: 'success', title: 'Pedido eliminado correctamente', timer: 1800, showConfirmButton: false, toast: true, position: 'top-end' });
        onActualizado?.();
        setEliminado(!eliminado);
    } catch (error) {
        if (error.response && error.response.data) {
            Swal.fire({ icon: 'error', title: error.response.data.error || 'Error al eliminar', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
            return;
        }
        Swal.fire({ icon: 'error', title: 'Error al eliminar el pedido', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
    }
};

return (
    <>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all duration-200 min-h-[320px] md:min-h-[340px] w-full max-w-full md:max-w-[350px] mx-auto">

            {/* BLOQUE SUPERIOR */}
            <div>
                {/* Banner de tipo de pedido */}
                <div className={`px-4 py-1.5 flex justify-between items-center text-xs font-bold uppercase tracking-wider ${pedido.tipo === 'mesa' ? 'bg-blue-50 text-blue-700 border-b border-blue-100'
                    : pedido.tipo === 'domicilio' ? 'bg-green-50 text-green-700 border-b border-green-100'
                        : 'bg-orange-50 text-orange-700 border-b border-orange-100'
                    }`}>
                    <span>Pedido #{pedido.numero_dia || pedido.id}</span>
                    <span>{pedido.tipo === 'mesa' ? 'Mesa' : pedido.tipo === 'domicilio' ? 'Domicilio' : 'Recoger'}</span>
                </div>

                {/* Reduje el padding de p-5 a p-4 en PC para compactar */}
                <div className="p-4 md:p-4.5 pb-0">
                    {/* Ubicación Destacada */}
                    <div className="mb-3 min-h-[36px] flex items-center">
                        {pedido.tipo === 'mesa' && pedido.numero_mesa && (
                            <h4 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                Mesa {pedido.numero_mesa}
                            </h4>
                        )}
                        {pedido.tipo === 'domicilio' && pedido.direccion && (
                            <div className="w-full">
                                <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-tight">Entregar en:</span>
                                <p className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2">{pedido.direccion}</p>
                            </div>
                        )}
                        {pedido.tipo === 'recoger' && (
                            <div className="w-full">
                                <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-tight">Retira Cliente:</span>
                                <p className="text-xs md:text-sm font-bold text-gray-800 truncate">{pedido.nombre_cliente || 'Cliente General'}</p>
                            </div>
                        )}
                    </div>

                    {/* Lista de productos scrolleable */}
                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 border-t border-b border-gray-50 py-2">
                        {pedido.detalles?.map((detalle) => (
                            <div key={detalle.id} className="text-xs">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-700 font-medium flex-1 pr-2 truncate">{detalle.producto?.nombre}</span>
                                    <span className="text-gray-400 font-bold px-2">x{detalle.cantidad}</span>
                                    <span className="font-semibold text-gray-900">{fmtCOP(detalle.subtotal)}</span>
                                </div>
                                {detalle.adiciones?.length > 0 && (
                                    <div className="mt-0.5 ml-2 bg-purple-50 p-1 rounded text-[11px] text-purple-700 space-y-0.5">
                                        {detalle.adiciones.map((adic, i) => (
                                            <p key={i} className="flex justify-between">
                                                <span>+ {adic.nombre} (x{adic.cantidad})</span>
                                                <span>{fmtCOP(adic.subtotal)}</span>
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
            <div className="p-4 md:p-4.5 pt-0 mt-2">
                {/* Metadata: Tiempo transcurrido y perfil */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                    <span
                        title={formatDate(pedido.created_at)}
                        className="inline-flex items-center gap-1"
                    >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Hace {timeAgo(pedido.created_at)}
                    </span>
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
                <div className="bg-gray-50 p-2 rounded-lg mb-2.5 space-y-0.5">
                    {tieneRecargo && (
                        <div className="flex justify-between text-[11px] text-gray-500">
                            <span>Subtotal</span>
                            <span>{fmtCOP(subtotalItems)}</span>
                        </div>
                    )}
                    {tieneRecargo && (
                        <div className="flex justify-between text-[11px] text-green-600 font-medium">
                            <span>Domicilio</span>
                            <span>+{fmtCOP(valorRecargo)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Total</span>
                        <span className="text-base md:text-lg font-black text-gray-900">{fmtCOP(pedido.total)}</span>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-1.5">
                    <button
                        type="button"
                        onClick={() => setModalPagoAbierto(true)}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-1.5 md:py-2 rounded-lg transition-colors text-xs uppercase tracking-wider"
                    >
                        Pagar
                    </button>
                    <button
                        type="button"
                        onClick={() => imprimir(pedido)}
                        className="p-1.5 md:p-2 border border-gray-200 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Imprimir comanda"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"></path>
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => setModalEditarAbierto(true)}
                        className="p-1.5 md:p-2 border border-gray-200 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar pedido"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={eliminarPedido}
                        className="p-1.5 md:p-2 border border-gray-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar pedido"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <ModalNuevoPedido
            abierto={modalEditarAbierto}
            productos={productos}
            pedidoEditar={pedido}
            onCreado={() => {
                setModalEditarAbierto(false);
                onActualizado?.();
            }}
            onCerrar={() => setModalEditarAbierto(false)}
            actualizado={actualizado}
            setActualizado={setActualizado}
        />

        <ModalPago
            abierto={modalPagoAbierto}
            pedido={pedido}
            onPagado={() => {
                setModalPagoAbierto(false);
                onActualizado?.();
                setPagado(!pagado);
            }}
            onCerrar={() => setModalPagoAbierto(false)}
        />
    </>
);
}

PedidoCard.propTypes = PedidoCardPropTypes;

