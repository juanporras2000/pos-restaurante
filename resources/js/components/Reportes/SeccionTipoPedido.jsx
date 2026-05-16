import React from 'react';
import PropTypes from 'prop-types';
import { ShoppingBagIcon, TruckIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { CHART_PALETTE } from '../../constants';

const TIPO_CONFIG = {
    mesa:      { label: 'Mesa',      Icon: BuildingStorefrontIcon, color: CHART_PALETTE[0] },
    domicilio: { label: 'Domicilio', Icon: TruckIcon,              color: CHART_PALETTE[1] },
    recoger:   { label: 'Para llevar', Icon: ShoppingBagIcon,      color: CHART_PALETTE[2] },
};

const fmtQ = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0);

/**
 * Barra de progreso simple para cada tipo de pedido.
 * Responsabilidad única: visualizar un tipo con su porcentaje.
 */
function FilaTipo({ tipo, cantidad, total_ventas, porcentaje }) {
    const cfg   = TIPO_CONFIG[tipo] ?? { label: tipo, Icon: ShoppingBagIcon, color: '#6b7280' };
    const { Icon, label, color } = cfg;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-gray-700">
                    <Icon className="h-4 w-4" style={{ color }} />
                    {label}
                </span>
                <span className="text-gray-500">
                    <span className="font-semibold text-gray-800">{cantidad}</span> pedidos · {fmtQ(total_ventas)}
                </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${porcentaje}%`, backgroundColor: color }}
                />
            </div>
            <p className="text-xs text-gray-400 text-right">{porcentaje}% del total</p>
        </div>
    );
}

FilaTipo.propTypes = {
    tipo: PropTypes.string.isRequired,
    cantidad: PropTypes.number.isRequired,
    total_ventas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    porcentaje: PropTypes.number.isRequired,
};

/**
 * SeccionTipoPedido
 * Recibe los datos ya cargados desde el padre (Reportes.jsx) para no duplicar fetching.
 */
export default function SeccionTipoPedido({ tipos = [], totalPedidos = 0, loading, error, onRetry }) {
    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-2 py-8 text-sm text-red-500">
                <p>{error}</p>
                {onRetry && (
                    <button onClick={onRetry} className="text-xs px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100">
                        Reintentar
                    </button>
                )}
            </div>
        );
    }

    if (!tipos.length) {
        return <p className="text-center py-8 text-sm text-gray-400">Sin pedidos en este período</p>;
    }

    return (
        <div className="space-y-5">
            <p className="text-xs text-gray-400 font-medium">{totalPedidos} pedidos en total</p>
            {tipos.map((t) => (
                <FilaTipo key={t.tipo} {...t} />
            ))}
        </div>
    );
}

SeccionTipoPedido.propTypes = {
    tipos: PropTypes.array,
    totalPedidos: PropTypes.number,
    loading: PropTypes.bool,
    error: PropTypes.string,
    onRetry: PropTypes.func,
};
