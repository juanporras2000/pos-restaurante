import React from 'react';
import PropTypes from 'prop-types';
import { fmtCOP } from '../../utils/format';
import Spinner from '../shared/Spinner';

// ── Sub-componentes ───────────────────────────────────────────────────────────

function FilaBalance({ label, valor, colorClase, negrita = false }) {
    return (
        <div className={`flex justify-between items-center py-2 ${negrita ? 'border-t border-gray-200 dark:border-gray-700 mt-1 pt-3' : ''}`}>
            <span className={`text-sm ${negrita ? 'font-bold text-gray-800' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
            <span className={`text-sm font-semibold ${colorClase}`}>{valor}</span>
        </div>
    );
}

FilaBalance.propTypes = {
    label:      PropTypes.string.isRequired,
    valor:      PropTypes.string.isRequired,
    colorClase: PropTypes.string.isRequired,
    negrita:    PropTypes.bool,
};

function ErrorRetry({ msg, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-sm text-red-500">
            <p>{msg}</p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100"
                >
                    Reintentar
                </button>
            )}
        </div>
    );
}

ErrorRetry.propTypes = {
    msg:     PropTypes.string.isRequired,
    onRetry: PropTypes.func,
};

// ── Componente principal ──────────────────────────────────────────────────────

/**
 * SeccionGastosIngresos
 * Responsabilidad única: mostrar el balance ingresos vs gastos del período.
 *
 * Props:
 *  - totalVentas : number  — suma de ventas del período
 *  - gastos      : object  — { total, tipos: [{ tipo, total }], comparativa? }
 *  - loading     : bool
 *  - error       : string | null
 *  - onRetry     : fn
 */
export default function SeccionGastosIngresos({ totalVentas, gastos, loading, error, onRetry }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Spinner />
            </div>
        );
    }

    if (error) return <ErrorRetry msg={error} onRetry={onRetry} />;

    const totalGastos = parseFloat(gastos?.total ?? 0);
    const utilidad    = totalVentas - totalGastos;
    const margen      = totalVentas > 0 ? ((utilidad / totalVentas) * 100).toFixed(1) : null;
    const tipos       = gastos?.tipos ?? [];

    return (
        <div className="space-y-1">
            {/* Filas principales */}
            <FilaBalance
                label="Ingresos (ventas)"
                valor={fmtCOP(totalVentas)}
                colorClase="text-green-600"
            />
            <FilaBalance
                label="Gastos del período"
                valor={`−${fmtCOP(totalGastos)}`}
                colorClase="text-red-500"
            />
            <FilaBalance
                label="Utilidad estimada"
                valor={`${fmtCOP(utilidad)}${margen !== null ? ` (${margen}%)` : ''}`}
                colorClase={utilidad >= 0 ? 'text-blue-600' : 'text-red-600'}
                negrita
            />

            {/* Desglose por tipo de gasto */}
            {tipos.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                        Desglose de gastos
                    </p>
                    <div className="space-y-1.5">
                        {tipos.map((t) => {
                            const pct = totalGastos > 0
                                ? ((parseFloat(t.total) / totalGastos) * 100).toFixed(0)
                                : 0;
                            return (
                                <div key={t.tipo} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 truncate capitalize">{t.tipo}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-red-400 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-20 text-right">
                                        {fmtCOP(t.total)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tipos.length === 0 && totalGastos === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-4">
                    Sin gastos registrados en este período
                </p>
            )}
        </div>
    );
}

SeccionGastosIngresos.propTypes = {
    totalVentas: PropTypes.number,
    gastos:      PropTypes.shape({
        total:       PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        tipos:       PropTypes.arrayOf(PropTypes.shape({
            tipo:  PropTypes.string,
            total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })),
        comparativa: PropTypes.object,
    }),
    loading:  PropTypes.bool,
    error:    PropTypes.string,
    onRetry:  PropTypes.func,
};

SeccionGastosIngresos.defaultProps = {
    totalVentas: 0,
    gastos:      {},
    loading:     false,
    error:       null,
};
