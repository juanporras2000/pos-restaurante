import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { METODO_ETIQUETA } from './historialUtils';
import IconButton from '../shared/IconButton';

const METODOS = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'nequi',    label: 'Nequi' },
    { value: 'tarjeta',  label: 'Tarjeta de crédito/débito' },
    { value: 'transferencia', label: 'Transferencia' },
];

export default function ModalEditarPago({ abierto, pedido, onActualizado, onCerrar }) {
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [guardando, setGuardando]   = useState(false);

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
            const res = await fetch(`/api/pagos/${pedido.pago.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ metodo_pago: metodoPago }),
            });

            const data = await res.json();

            if (!res.ok) {
                Swal.fire({
                    icon: 'error',
                    title: data.error || 'Error al actualizar el método de pago',
                    timer: 2500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                });
                return;
            }

            Swal.fire({
                icon: 'success',
                title: `Método actualizado a ${METODO_ETIQUETA[metodoPago] ?? metodoPago}`,
                timer: 1800,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });

            onActualizado(pedido.id, data.pago);
            onCerrar();
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión. Intenta de nuevo.',
                timer: 2000,
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
    const esMixto      = metodoActual === 'mixto';

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
            onKeyDown={(e) => { if (e.key === 'Escape') onCerrar(); }}
            tabIndex={-1}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            </svg>
                            Editar forma de pago
                        </h2>
                        <IconButton onClick={onCerrar} aria-label="Cerrar" variant="default">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </IconButton>
                    </div>

                    {/* Info del pedido */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-5 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-800 dark:text-gray-200">Pedido #{pedido.numero_dia || pedido.id}</span>
                        {metodoActual && (
                            <span className="ml-2 text-gray-400 dark:text-gray-500">
                                · Actual: <span className="text-gray-600 dark:text-gray-400">{METODO_ETIQUETA[metodoActual] ?? metodoActual}</span>
                            </span>
                        )}
                    </div>

                    {esMixto ? (
                        <div className="mb-5 flex items-start gap-2 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-sm text-orange-700 dark:text-orange-400">
                            <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            Este pedido fue pagado con múltiples métodos. No es posible cambiar el método de forma individual.
                        </div>
                    ) : (
                        <div className="mb-5">
                            <label htmlFor="metodo-pago-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nuevo método de pago
                            </label>
                            <select
                                id="metodo-pago-select"
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                            {esMixto ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {!esMixto && (
                            <button
                                type="button"
                                onClick={confirmar}
                                disabled={guardando || metodoPago === metodoActual}
                                className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
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
    abierto:       PropTypes.bool.isRequired,
    pedido:        PropTypes.shape({
        id:          PropTypes.number,
        numero_dia:  PropTypes.number,
        pago:        PropTypes.shape({
            id:          PropTypes.number,
            metodo_pago: PropTypes.string,
        }),
    }),
    onActualizado: PropTypes.func.isRequired,
    onCerrar:      PropTypes.func.isRequired,
};
