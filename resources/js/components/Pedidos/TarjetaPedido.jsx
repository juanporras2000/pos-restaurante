import React, { useState } from 'react';
import { PrinterIcon, ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { fmtCOP } from '../../utils/format';
import { METODO_ETIQUETA, formatFecha } from './historialUtils';
import { useImprimir } from '../../hooks/useImprimir';
import ModalEditarPago from './ModalEditarPago';

export default function TarjetaPedido({ pedido, onPagoActualizado }) {
    const [expandido, setExpandido]           = useState(false);
    const [modalEditarAbierto, setModalEditar] = useState(false);
    const [imprimiendo, setImprimiendo]        = useState(false);
    const { imprimir } = useImprimir();

    const pago        = pedido.pago;
    const metodoLabel = METODO_ETIQUETA[pago?.metodo_pago] ?? pago?.metodo_pago ?? '—';
    const esMesa      = pedido.tipo === 'mesa';

    const handleImprimir = async () => {
        setImprimiendo(true);
        try {
            await imprimir(pedido);
        } finally {
            setImprimiendo(false);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">

                {/* ── Cabecera clicable ── */}
                <button
                    type="button"
                    onClick={() => setExpandido((v) => !v)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full ${
                            esMesa ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}>
                            {esMesa ? (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="8" width="18" height="4" rx="1" />
                                    <path d="M6 12v4m12-4v4M4 19h16" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                    <circle cx="12" cy="9" r="2.5" />
                                </svg>
                            )}
                        </span>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    Pedido #{pedido.numero_dia || pedido.id}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    esMesa ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                }`}>
                                    {esMesa ? `Mesa ${pedido.numero_mesa}` : 'Domicilio'}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {metodoLabel}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-200 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                    Atendido por: {pedido.perfil.nombre}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                {!esMesa && pedido.direccion && <span>{pedido.direccion} · </span>}
                                {formatFecha(pedido.updated_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{fmtCOP(pedido.total)}</span>
                        <ChevronDownIcon className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {/* ── Detalle expandible ── */}
                {expandido && (
                    <div className="border-t border-gray-100 dark:border-gray-700 px-4 pb-4 pt-3">

                        {/* Items */}
                        <div className="space-y-2 mb-4">
                            {pedido.detalles?.map((detalle) => (
                                <div key={detalle.id} className="flex justify-between items-start text-sm">
                                    <div className="flex-1 min-w-0">
                                        <span className="text-gray-700 dark:text-gray-300">{detalle.producto?.nombre ?? '—'}</span>
                                        {detalle.observacion && (
                                            <p className="flex items-center gap-1 text-xs text-amber-600 italic mt-0.5">
                                                <PencilSquareIcon className="h-3 w-3 shrink-0" />
                                                {detalle.observacion}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                        <span className="text-gray-400 dark:text-gray-500 text-xs">×{detalle.cantidad}</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{fmtCOP(detalle.subtotal)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Info del pago */}
                        {pago && (parseFloat(pago.recibido) > 0 || parseFloat(pago.cambio) > 0) && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-1.5 text-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Recibido</span>
                                    <span className="font-medium">{fmtCOP(pago.recibido)}</span>
                                </div>
                                {parseFloat(pago.cambio) > 0 && (
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Cambio</span>
                                        <span className="font-medium text-blue-600">{fmtCOP(pago.cambio)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Acciones */}
                        <div className="mt-3 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setModalEditar(true)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm font-medium"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                </svg>
                                Editar forma de pago
                            </button>
                            <button
                                type="button"
                                onClick={handleImprimir}
                                disabled={imprimiendo}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 rounded-lg transition-colors text-sm font-medium"
                            >
                                <PrinterIcon className="h-4 w-4" />
                                Imprimir recibo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ModalEditarPago
                abierto={modalEditarAbierto}
                pedido={pedido}
                onActualizado={onPagoActualizado}
                onCerrar={() => setModalEditar(false)}
            />
        </>
    );
}
