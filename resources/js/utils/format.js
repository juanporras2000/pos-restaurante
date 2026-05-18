/**
 * format.js — Utilidades de formato para toda la aplicación.
 */

// Instancia reutilizable (se crea una vez por módulo)
const _copFormatter = new Intl.NumberFormat('es-CO', {
    style:                'currency',
    currency:             'COP',
    maximumFractionDigits: 0,
});

/**
 * Formatea un número como peso colombiano.
 * @example fmtCOP(20000) → "$20.000"
 */
export const fmtCOP = (n) => _copFormatter.format(n ?? 0);
