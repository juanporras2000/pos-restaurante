/**
 * historialUtils.js
 * Constantes y utilidades compartidas entre los sub-componentes del Historial del día.
 * Principio SRP: centraliza conocimiento de dominio (etiquetas, colores, formatos)
 * para que los componentes solo se ocupen de la presentación.
 */

export const TIPOS_GASTO = {
    insumos:   { label: 'Insumos',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    gasolina:  { label: 'Gasolina',  color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    servicios: { label: 'Servicios', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    otro:      { label: 'Otro',      color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
};

export const METODO_ETIQUETA = {
    efectivo:      'Efectivo',
    tarjeta:       'Tarjeta',
    nequi:         'Nequi',
    transferencia: 'Transferencia',
    mixto:         'Pago dividido',
};

export const METODO_COLOR = {
    efectivo:      { dot: 'bg-green-500',  text: 'text-green-700 dark:text-green-400',  badge: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800' },
    tarjeta:       { dot: 'bg-blue-500',   text: 'text-blue-700 dark:text-blue-400',   badge: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' },
    nequi:         { dot: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-400', badge: 'bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800' },
    transferencia: { dot: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400', badge: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800' },
    mixto:         { dot: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400', badge: 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800' },
};

/** Formatea una fecha/hora como HH:MM */
export function formatHora(dateString) {
    return new Date(dateString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** Formatea una fecha como DD/MM/YYYY HH:MM */
export function formatFecha(dateString) {
    return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Reduce una lista de pedidos a un mapa { metodo_pago -> total_acumulado }.
 * @param {Array} pedidos
 * @returns {Object}
 */
export function calcularVentasPorMetodo(pedidos) {
    return pedidos.reduce((acc, p) => {
        if (!p.pago) return acc;

        const detalles = p.pago.detalles ?? [];
        if (detalles.length > 0) {
            detalles.forEach((d) => {
                acc[d.metodo_pago] = (acc[d.metodo_pago] ?? 0) + Number.parseFloat(d.monto || 0);
            });
        } else {
            const m = p.pago.metodo_pago ?? 'otro';
            acc[m] = (acc[m] ?? 0) + Number.parseFloat(p.total || 0);
        }

        return acc;
    }, {});
}
