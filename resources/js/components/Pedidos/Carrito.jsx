import React, { useState } from 'react';

export default function Carrito({ carrito, onEliminar, onNotaChange }) {
    const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    // Controla qué ítem tiene el textarea de nota abierto
    const [notaAbierta, setNotaAbierta] = useState(null);

    if (carrito.length === 0) return null;

    const toggleNota = (id) => setNotaAbierta((prev) => (prev === id ? null : id));

    return (
        <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-3">Resumen del Pedido</h4>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {carrito.map((item) => (
                    <div key={item.id} className="text-sm">
                        {/* Fila principal */}
                        <div className="flex justify-between items-center">
                            <span className="flex-1 text-gray-700 font-medium">{item.nombre}</span>
                            <span className="mx-2 text-gray-500">x{item.cantidad}</span>
                            <span className="font-medium text-gray-900 mr-1">${item.subtotal.toFixed(2)}</span>

                            {/* Botón nota */}
                            <button
                                type="button"
                                title={item.nota ? 'Editar nota' : 'Agregar nota'}
                                onClick={() => toggleNota(item.id)}
                                className={`mx-1 transition-colors ${item.nota ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-gray-500'}`}
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
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Nota visible cuando tiene contenido y está cerrada */}
                        {item.nota && notaAbierta !== item.id && (
                            <p className="mt-0.5 ml-1 text-xs text-amber-600 italic truncate">
                                📝 {item.nota}
                            </p>
                        )}

                        {/* Textarea expandible */}
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
                ))}
            </div>
            <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>
    );
}
