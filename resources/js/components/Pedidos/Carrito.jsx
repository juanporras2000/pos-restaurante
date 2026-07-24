import React, { useState } from 'react';
import { fmtCOP } from '../../utils/format';
import IconButton from '../shared/IconButton';
import { CarritoPropTypes } from '../../propTypes';

export default function Carrito({
    carrito,
    adicionesDisponibles = [],
    onEliminar,
    onNotaChange,
    onAdicionIncrementar,
    onAdicionDecrementar,
    tipoPedido,
    recargoDomicilio = 0
}) {
    const [notaAbierta, setNotaAbierta] = useState(null);
    const [adicionAbierta, setAdicionAbierta] = useState(null);

    const subtotalProductos = carrito.reduce((sum, item) => {
        const baseSubtotal = item.subtotal;
        const adicionesSubtotal = (item.adiciones ?? []).reduce((s, a) => s + a.subtotal, 0);
        return sum + baseSubtotal + adicionesSubtotal;
    }, 0);

    const aplicaRecargo = tipoPedido === 'domicilio' && recargoDomicilio > 0;
    const totalGeneral = subtotalProductos + (aplicaRecargo ? recargoDomicilio : 0);

    if (carrito.length === 0) return null;

    const toggleNota = (id) => {
        setNotaAbierta((prev) => (prev === id ? null : id));
        setAdicionAbierta(null);
    };

    const toggleAdicion = (id) => {
        setAdicionAbierta((prev) => (prev === id ? null : id));
        setNotaAbierta(null);
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-center">Resumen del Pedido</h4>
            <div className="space-y-3 mb-2 max-h-[210px] overflow-y-auto pr-1">
                {carrito.map((item) => {
                    const adicionesSubtotal = (item.adiciones ?? []).reduce((s, a) => s + a.subtotal, 0);
                    const totalItem = item.subtotal + adicionesSubtotal;

                    return (
                        <div key={item.id} className="text-sm">
                            {/* Fila principal */}
                            <div className="flex justify-between items-center">
                                <span className="flex-1 text-gray-700 dark:text-gray-300 font-medium truncate pr-1">{item.nombre}</span>
                                <span className="mx-1 text-gray-500 dark:text-gray-400 shrink-0">x{item.cantidad}</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 mr-8 shrink-0">{fmtCOP(totalItem)}</span>

                                {/* Botón adiciones */}
                                {adicionesDisponibles.length > 0 && (
                                    <IconButton
                                        aria-label="Agregar adiciones"
                                        onClick={() => toggleAdicion(item.id)}
                                        variant="default"
                                        className={`mx-0.5 shrink-0 ${
                                            (item.adiciones ?? []).length > 0
                                                ? 'text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300'
                                                : 'text-gray-300 dark:text-gray-600 hover:text-purple-400'
                                        }`}
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 8v8M8 12h8"></path>
                                        </svg>
                                    </IconButton>
                                )}

                                {/* Botón nota */}
                                <IconButton
                                    aria-label={item.nota ? 'Editar nota' : 'Agregar nota'}
                                    onClick={() => toggleNota(item.id)}
                                    variant="default"
                                    className={`mx-0.5 shrink-0 ${item.nota ? 'text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'}`}
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"></path>
                                        <path d="M17.5 2.5a2.121 2.121 0 013 3L12 14l-4 1 1-4 7.5-7.5z"></path>
                                    </svg>
                                </IconButton>

                                {/* Botón eliminar */}
                                <IconButton
                                    aria-label="Eliminar producto del carrito"
                                    onClick={() => onEliminar(item.id)}
                                    variant="danger"
                                    className="shrink-0 ml-0.5"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </IconButton>
                            </div>

                            {/* Adiciones seleccionadas (resumen) */}
                            {(item.adiciones ?? []).length > 0 && adicionAbierta !== item.id && (
                                <div className="mt-0.5 ml-1 space-y-0.5">
                                    {item.adiciones.map((a) => (
                                        <p key={a.adicion_id} className="text-xs text-purple-600 dark:text-purple-400 italic">
                                            + {a.cantidad > 1 ? `${a.cantidad}x ` : ''}{a.nombre} <span className="not-italic font-medium">(+{fmtCOP(a.subtotal)})</span>
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Nota visible cuando cerrada */}
                            {item.nota && notaAbierta !== item.id && (
                                <p className="mt-0.5 ml-1 text-xs text-amber-600 dark:text-amber-400 italic truncate flex items-center gap-1">
                                    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"></path>
                                        <path d="M17.5 2.5a2.121 2.121 0 013 3L12 14l-4 1 1-4 7.5-7.5z"></path>
                                    </svg>
                                    <span className="truncate">{item.nota}</span>
                                </p>
                            )}

                            {/* Panel de adiciones */}
                            {adicionAbierta === item.id && (
                                <div className="mt-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-1">
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 8v8M8 12h8"></path>
                                        </svg>
                                        Adiciones para {item.nombre}
                                    </p>
                                    <div className="space-y-1.5">
                                        {adicionesDisponibles.map((adicion) => {
                                            const seleccionada = (item.adiciones ?? []).find((a) => a.adicion_id === adicion.id);
                                            const cantidad = seleccionada?.cantidad ?? 0;
                                            return (
                                                <div key={adicion.id} className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-700 dark:text-gray-300 flex-1">
                                                        {adicion.nombre}
                                                        <span className="text-purple-500 dark:text-purple-400 ml-1">+{fmtCOP(Number.parseFloat(adicion.precio))}</span>
                                                    </span>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <IconButton
                                                            aria-label="Quitar adición"
                                                            onClick={() => onAdicionDecrementar(item.id, adicion)}
                                                            disabled={cantidad === 0}
                                                            variant="default"
                                                            className="!rounded-full font-bold !bg-purple-200 dark:!bg-purple-900/40 hover:!bg-purple-300 dark:hover:!bg-purple-900/60 !text-purple-700 dark:!text-purple-300"
                                                        >
                                                            −
                                                        </IconButton>
                                                        <span className="w-5 text-center font-medium text-gray-800 dark:text-gray-200">{cantidad}</span>
                                                        <IconButton
                                                            aria-label="Aumentar cantidad de adición"
                                                            onClick={() => onAdicionIncrementar(item.id, adicion)}
                                                            variant="default"
                                                            className="!rounded-full font-bold !bg-purple-500 hover:!bg-purple-600 !text-white"
                                                        >
                                                            +
                                                        </IconButton>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Textarea nota */}
                            {notaAbierta === item.id && (
                                <div className="mt-1.5">
                                    <textarea
                                        autoFocus
                                        rows={2}
                                        maxLength={200}
                                        placeholder="Ej: sin salsa de ajo, término 3/4..."
                                        value={item.nota ?? ''}
                                        onChange={(e) => onNotaChange(item.id, e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none bg-amber-50 dark:bg-amber-900/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                    <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {(item.nota ?? '').length}/200
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {aplicaRecargo && (
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-1 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <span>Subtotal</span>
                    <span>{fmtCOP(subtotalProductos)}</span>
                </div>
            )}
            {aplicaRecargo && (
                <div className="flex justify-between items-center text-sm text-blue-600 mb-2">
                    <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Recargo domicilio
                    </span>
                    <span>+{fmtCOP(recargoDomicilio)}</span>
                </div>
            )}

            <div className={`flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-gray-100 ${aplicaRecargo ? 'border-t border-gray-200 dark:border-gray-700 pt-2' : 'border-t border-gray-200 dark:border-gray-700 pt-3'}`}>
                <span>Total</span>
                <span>{fmtCOP(totalGeneral)}</span>
            </div>
        </div>
    );
}

Carrito.propTypes = CarritoPropTypes;
