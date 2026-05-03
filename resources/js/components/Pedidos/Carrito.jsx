import React, { useState } from 'react';

export default function Carrito({ carrito, adicionesDisponibles = [], onEliminar, onNotaChange, onAdicionIncrementar, onAdicionDecrementar }) {
    const [notaAbierta, setNotaAbierta] = useState(null);
    const [adicionAbierta, setAdicionAbierta] = useState(null);

    const totalGeneral = carrito.reduce((sum, item) => {
        const baseSubtotal = item.subtotal;
        const adicionesSubtotal = (item.adiciones ?? []).reduce((s, a) => s + a.subtotal, 0);
        return sum + baseSubtotal + adicionesSubtotal;
    }, 0);

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
        <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-3">Resumen del Pedido</h4>
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
                {carrito.map((item) => {
                    const adicionesSubtotal = (item.adiciones ?? []).reduce((s, a) => s + a.subtotal, 0);
                    const totalItem = item.subtotal + adicionesSubtotal;

                    return (
                        <div key={item.id} className="text-sm">
                            {/* Fila principal */}
                            <div className="flex justify-between items-center">
                                <span className="flex-1 text-gray-700 font-medium truncate pr-1">{item.nombre}</span>
                                <span className="mx-1 text-gray-500 shrink-0">x{item.cantidad}</span>
                                <span className="font-medium text-gray-900 mr-1 shrink-0">${totalItem.toFixed(2)}</span>

                                {/* Botón adiciones */}
                                {adicionesDisponibles.length > 0 && (
                                    <button
                                        type="button"
                                        title="Agregar adiciones"
                                        onClick={() => toggleAdicion(item.id)}
                                        className={`mx-0.5 transition-colors shrink-0 ${
                                            (item.adiciones ?? []).length > 0
                                                ? 'text-purple-500 hover:text-purple-700'
                                                : 'text-gray-300 hover:text-purple-400'
                                        }`}
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 8v8M8 12h8"></path>
                                        </svg>
                                    </button>
                                )}

                                {/* Botón nota */}
                                <button
                                    type="button"
                                    title={item.nota ? 'Editar nota' : 'Agregar nota'}
                                    onClick={() => toggleNota(item.id)}
                                    className={`mx-0.5 transition-colors shrink-0 ${item.nota ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-gray-500'}`}
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"></path>
                                        <path d="M17.5 2.5a2.121 2.121 0 013 3L12 14l-4 1 1-4 7.5-7.5z"></path>
                                    </svg>
                                </button>

                                {/* Botón eliminar */}
                                <button
                                    type="button"
                                    onClick={() => onEliminar(item.id)}
                                    className="text-red-400 hover:text-red-600 transition-colors shrink-0 ml-0.5"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>

                            {/* Adiciones seleccionadas (resumen) */}
                            {(item.adiciones ?? []).length > 0 && adicionAbierta !== item.id && (
                                <div className="mt-0.5 ml-1 space-y-0.5">
                                    {item.adiciones.map((a) => (
                                        <p key={a.adicion_id} className="text-xs text-purple-600 italic">
                                            + {a.cantidad > 1 ? `${a.cantidad}x ` : ''}{a.nombre} <span className="not-italic font-medium">(+${a.subtotal.toFixed(2)})</span>
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Nota visible cuando cerrada */}
                            {item.nota && notaAbierta !== item.id && (
                                <p className="mt-0.5 ml-1 text-xs text-amber-600 italic truncate">
                                    📝 {item.nota}
                                </p>
                            )}

                            {/* Panel de adiciones */}
                            {adicionAbierta === item.id && (
                                <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
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
                                                    <span className="text-gray-700 flex-1">
                                                        {adicion.nombre}
                                                        <span className="text-purple-500 ml-1">+${parseFloat(adicion.precio).toFixed(2)}</span>
                                                    </span>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => onAdicionDecrementar(item.id, adicion)}
                                                            disabled={cantidad === 0}
                                                            className="w-6 h-6 rounded-full bg-purple-200 hover:bg-purple-300 disabled:opacity-30 flex items-center justify-center font-bold text-purple-700"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-5 text-center font-medium text-gray-800">{cantidad}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => onAdicionIncrementar(item.id, adicion)}
                                                            className="w-6 h-6 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center font-bold text-white"
                                                        >
                                                            +
                                                        </button>
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
                                        className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none bg-amber-50 placeholder-gray-400"
                                    />
                                    <p className="text-right text-xs text-gray-400 mt-0.5">
                                        {(item.nota ?? '').length}/200
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-200 pt-3">
                <span>Total</span>
                <span>${totalGeneral.toFixed(2)}</span>
            </div>
        </div>
    );
}
