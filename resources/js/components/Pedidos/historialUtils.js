/**
 * historialUtils.js
 * Constantes y utilidades compartidas entre los sub-componentes del Historial del día.
 * Principio SRP: centraliza conocimiento de dominio (etiquetas, colores, formatos)
 * para que los componentes solo se ocupen de la presentación.
 */

export const TIPOS_GASTO = {
    insumos:   { label: 'Insumos',   color: 'bg-blue-100 text-blue-700' },
    gasolina:  { label: 'Gasolina',  color: 'bg-yellow-100 text-yellow-700' },
    servicios: { label: 'Servicios', color: 'bg-purple-100 text-purple-700' },
    otro:      { label: 'Otro',      color: 'bg-gray-100 text-gray-600' },
};

export const METODO_ETIQUETA = {
    efectivo:      'Efectivo',
    tarjeta:       'Tarjeta',
    transferencia: 'Transferencia',
};

export const METODO_COLOR = {
    efectivo:      { dot: 'bg-green-500',  text: 'text-green-700',  badge: 'bg-green-50 border-green-200' },
    tarjeta:       { dot: 'bg-blue-500',   text: 'text-blue-700',   badge: 'bg-blue-50 border-blue-200' },
    transferencia: { dot: 'bg-purple-500', text: 'text-purple-700', badge: 'bg-purple-50 border-purple-200' },
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
        const m = p.pago?.metodo_pago ?? 'otro';
        acc[m] = (acc[m] ?? 0) + Number.parseFloat(p.total || 0);
        return acc;
    }, {});
}
