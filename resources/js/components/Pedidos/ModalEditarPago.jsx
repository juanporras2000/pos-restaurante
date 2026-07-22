import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { METODO_ETIQUETA } from './historialUtils';
import axios from '../../services/axios'

const METODOS = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'nequi', label: 'Nequi' },
    { value: 'tarjeta', label: 'Tarjeta de crédito/débito' },
    { value: 'transferencia', label: 'Transferencia' },
];

export default function ModalEditarPago({ abierto, pedido, onActualizado, onCerrar }) {
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (abierto && pedido?.pago?.metodo_pago) {
            setMetodoPago(pedido.pago.metodo_pago);
        }
    }, [abierto, pedido]);

    const confirmar = async () => {
        if (!pedido?.pago?.id) return;

        const metodoActual = pedido.pago.metodo_pago;
        if (metodoPago === metodoActual) {
            onCerrar();
            return;
        }

        setGuardando(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

        try {
            const res = await axios.patch(`/pagos/${pedido.pago.id}`, {
                metodo_pago: metodoPago
            }, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });

            Swal.fire({
                icon: 'success',
                title: `Método actualizado a ${METODO_ETIQUETA[metodoPago] ?? metodoPago}`,
                timer: 1800,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });

            onActualizado(pedido.id, res.data.pago);
            onCerrar();
        } catch (error) {
            let msgError = 'Error de conexión. Intenta de nuevo.';

            if (error.response && error.response.data) {
                msgError = error.response.data.error || 'Error al actualizar el método de pago';
            }

            Swal.fire({
                icon: 'error',
                title: msgError,
                timer: 2500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
        } finally {
            setGuardando(false);
        }
    };

    if (!abierto || !pedido) return null;

    const metodoActual = pedido.pago?.metodo_pago;
    const esMixto = metodoActual === 'mixto';

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
            onKeyDown={(e) => { if (e.key === 'Escape') onCerrar(); }}
            tabIndex={-1}
        >
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            </svg>
                            Editar forma de pago
                        </h2>
                        <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Info del pedido */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm text-gray-600">
                        <span className="font-medium text-gray-800">Pedido #{pedido.numero_dia || pedido.id}</span>
                        {metodoActual && (
                            <span className="ml-2 text-gray-400">
                                · Actual: <span className="text-gray-600">{METODO_ETIQUETA[metodoActual] ?? metodoActual}</span>
                            </span>
                        )}
                    </div>

                    {esMixto ? (
                        <div className="mb-5 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                            <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            Este pedido fue pagado con múltiples métodos. No es posible cambiar el método de forma individual.
                        </div>
                    ) : (
                        <div className="mb-5">
                            <label htmlFor="metodo-pago-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Nuevo método de pago
                            </label>
                            <select
                                id="metodo-pago-select"
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {METODOS.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                            {esMixto ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {!esMixto && (
                            <button
                                type="button"
                                onClick={confirmar}
                                disabled={guardando || metodoPago === metodoActual}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
                            >
                                {guardando ? 'Guardando...' : 'Guardar cambio'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

ModalEditarPago.propTypes = {
    abierto: PropTypes.bool.isRequired,
    pedido: PropTypes.shape({
        id: PropTypes.number,
        numero_dia: PropTypes.number,
        pago: PropTypes.shape({
            id: PropTypes.number,
            metodo_pago: PropTypes.string,
        }),
    }),
    onActualizado: PropTypes.func.isRequired,
    onCerrar: PropTypes.func.isRequired,
};
