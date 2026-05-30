import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useImprimir } from '../../hooks/useImprimir';
import { ModalPagoPropTypes } from '../../propTypes';

const MILES = 1000;

export default function ModalPago({ abierto, pedido, onPagado, onCerrar }) {
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [recibido, setRecibido] = useState('');
    const [procesando, setProcesando] = useState(false);
    const { imprimir } = useImprimir();

    const total = pedido ? parseFloat(pedido.total) : 0;
    const recibidoNum = (parseFloat(recibido) || 0) * MILES;
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

            Swal.fire({
                icon: 'success',
                title: metodoPago === 'efectivo'
                    ? `Pago procesado. Cambio: $${parseFloat(data.cambio).toLocaleString('es-CO')}`
                    : 'Pago procesado exitosamente',
                timer: metodoPago === 'efectivo' ? 2500 : 1800,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });

            // Construir pedido enriquecido con los datos del pago recién creado
            // para que el recibo incluya método, recibido y cambio.
            const pedidoPagado = { ...pedido, pago: data.pago };

            cerrar();
            onPagado();

            // Ofrecer imprimir recibo sin bloquear el flujo principal
            const { isConfirmed } = await Swal.fire({
                icon: 'question',
                title: '¿Imprimir recibo?',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Imprimir',
                cancelButtonText: 'No, gracias',
                confirmButtonColor: '#2563eb',
                cancelButtonColor: '#6b7280',
                timer: 6000,
                timerProgressBar: true,
            });

            if (isConfirmed) {
                imprimir(pedidoPagado);
            }
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
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}
        >
            <div className="modal-panel">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                            </svg>
                            Cobrar Pedido #{pedido.numero_dia || pedido.id}
                        </h2>
                        <button type="button" onClick={cerrar} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Total — prominent dark card */}
                        <div className="bg-gray-900 text-white p-4 rounded-xl">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total a cobrar</p>
                            <p className="text-3xl font-black">${total.toLocaleString('es-CO')}</p>
                        </div>

                        {/* Método de pago — card buttons */}
                        <div>
                            <label className="form-label">Método de pago</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    {
                                        value: 'efectivo',
                                        label: 'Efectivo',
                                        icon: (
                                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                                <circle cx="12" cy="12" r="3"></circle>
                                                <path d="M6 12h.01M18 12h.01"></path>
                                            </svg>
                                        ),
                                    },
                                    {
                                        value: 'nequi',
                                        label: 'Nequi',
                                        icon: (
                                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="5" y="2" width="14" height="20" rx="2"></rect>
                                                <circle cx="12" cy="17" r="1" fill="currentColor"></circle>
                                                <path d="M9 7h6M9 11h4"></path>
                                            </svg>
                                        ),
                                    },
                                    {
                                        value: 'tarjeta',
                                        label: 'Tarjeta',
                                        icon: (
                                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="1" y="4" width="22" height="16" rx="2"></rect>
                                                <line x1="1" y1="10" x2="23" y2="10"></line>
                                                <path d="M5 15h2m4 0h4"></path>
                                            </svg>
                                        ),
                                    },
                                ].map(({ value, label, icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => { setMetodoPago(value); setRecibido(''); }}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                                            metodoPago === value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {icon}
                                        <span className="text-xs font-semibold">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dinero recibido (solo efectivo) */}
                        {metodoPago === 'efectivo' && (
                            <div>
                                <label className="form-label">Dinero recibido</label>
                                <input
                                    type="number"
                                    value={recibido}
                                    onChange={(e) => setRecibido(e.target.value)}
                                    placeholder="Ej: 25"
                                    step="0.001"
                                    min="0"
                                    autoFocus
                                    className="form-input"
                                />
                                {recibido !== '' && !isNaN(parseFloat(recibido)) && (
                                    <p className="mt-0.5 text-xs text-gray-400">= ${(parseFloat(recibido) * MILES).toLocaleString('es-CO')}</p>
                                )}
                                {recibidoNum > 0 && (
                                    <div className={`mt-2 p-3 rounded-xl border ${cambio >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm font-medium ${cambio >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                {cambio >= 0 ? 'Cambio' : 'Falta'}
                                            </span>
                                            <span className={`text-xl font-black ${cambio >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                ${Math.abs(cambio).toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={cerrar} className="btn-secondary flex-1">
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={confirmar}
                            disabled={procesando}
                            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                        >
                            {procesando ? 'Procesando...' : 'Confirmar Pago'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

ModalPago.propTypes = ModalPagoPropTypes;

