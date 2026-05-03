import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function ModalPago({ abierto, pedido, onPagado, onCerrar }) {
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [recibido, setRecibido] = useState('');
    const [procesando, setProcesando] = useState(false);

    const total = pedido ? parseFloat(pedido.total) : 0;
    const recibidoNum = (parseFloat(recibido) || 0) * 1000;
    const cambio = recibidoNum - total;

    const cerrar = () => {
        setMetodoPago('efectivo');
        setRecibido('');
        onCerrar();
    };

    const confirmar = async () => {
        if (!pedido) return;

        if (metodoPago === 'efectivo' && recibidoNum < total) {
            Swal.fire({
                icon: 'error',
                title: 'El dinero recibido es insuficiente',
                timer: 2500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
            return;
        }

        setProcesando(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        try {
            const res = await fetch('/api/pagos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({
                    pedido_id: pedido.id,
                    recibido: metodoPago === 'efectivo' ? recibidoNum : total,
                    metodo_pago: metodoPago,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                Swal.fire({
                    icon: 'error',
                    title: data.error || 'Error al procesar el pago',
                    timer: 2500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                });
                return;
            }

            if (metodoPago === 'efectivo') {
                Swal.fire({
                    icon: 'success',
                    title: `Pago procesado. Cambio: $${parseFloat(data.cambio).toLocaleString('es-CO')}`,  
                    timer: 2500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Pago procesado exitosamente',
                    timer: 1800,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                });
            }

            cerrar();
            onPagado();
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error al procesar el pago',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
        } finally {
            setProcesando(false);
        }
    };

    if (!abierto || !pedido) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}
        >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                            </svg>
                            Procesar Pago - Pedido #{pedido.id}
                        </h2>
                        <button type="button" onClick={cerrar} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Total */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Total a pagar</span>
                                <span className="text-lg font-semibold text-gray-900">${total.toLocaleString('es-CO')}</span>
                            </div>
                        </div>

                        {/* Método de pago */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
                            <select
                                value={metodoPago}
                                onChange={(e) => { setMetodoPago(e.target.value); setRecibido(''); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="efectivo">💵 Efectivo</option>
                                <option value="nequi">📱 Nequi</option>
                                <option value="tarjeta">💳 Tarjeta de crédito/débito</option>
                            </select>
                        </div>

                        {/* Dinero recibido (solo efectivo) */}
                        {metodoPago === 'efectivo' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dinero recibido</label>
                                <input
                                    type="number"
                                    value={recibido}
                                    onChange={(e) => setRecibido(e.target.value)}
                                    placeholder="Ej: 25"
                                    step="0.001"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {recibido !== '' && !isNaN(parseFloat(recibido)) && (
                                    <p className="mt-0.5 text-xs text-gray-400">= ${(parseFloat(recibido) * 1000).toLocaleString('es-CO')}</p>
                                )}
                                {recibidoNum > 0 && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-700">Cambio:</span>
                                            <span className="font-medium text-green-700">
                                                ${cambio.toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={cerrar}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={confirmar}
                            disabled={procesando}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            {procesando ? 'Procesando...' : 'Confirmar Pago'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
