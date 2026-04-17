import React from 'react';

export default function Carrito({ carrito, onEliminar }) {
    const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);

    if (carrito.length === 0) return null;

    return (
        <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-3">Resumen del Pedido</h4>
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                {carrito.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="flex-1 text-gray-700">{item.nombre}</span>
                        <span className="mx-2 text-gray-500">x{item.cantidad}</span>
                        <span className="font-medium text-gray-900 mr-2">${item.subtotal.toFixed(2)}</span>
                        <button
                            type="button"
                            onClick={() => onEliminar(item.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
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
