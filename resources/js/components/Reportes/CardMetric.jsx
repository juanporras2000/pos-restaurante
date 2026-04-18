import React from 'react';

const VARIANTS = {
    blue: {
        wrap:  'bg-white border border-blue-100',
        icon:  'bg-blue-100 text-blue-600',
        label: 'text-gray-500',
        value: 'text-gray-900',
        trend: 'text-blue-600',
    },
    green: {
        wrap:  'bg-white border border-green-100',
        icon:  'bg-green-100 text-green-600',
        label: 'text-gray-500',
        value: 'text-gray-900',
        trend: 'text-green-600',
    },
    amber: {
        wrap:  'bg-white border border-amber-100',
        icon:  'bg-amber-100 text-amber-600',
        label: 'text-gray-500',
        value: 'text-gray-900',
        trend: 'text-amber-600',
    },
    red: {
        wrap:  'bg-white border border-red-100',
        icon:  'bg-red-100 text-red-600',
        label: 'text-gray-500',
        value: 'text-gray-900',
        trend: 'text-red-600',
    },
    purple: {
        wrap:  'bg-white border border-purple-100',
        icon:  'bg-purple-100 text-purple-600',
        label: 'text-gray-500',
        value: 'text-gray-900',
        trend: 'text-purple-600',
    },
};

/**
 * CardMetric
 * @param {string}  label    - Texto descriptivo
 * @param {string}  value    - Valor principal formateado
 * @param {string}  [sub]    - Subtexto opcional
 * @param {string}  [icon]   - Emoji o texto para el ícono
 * @param {string}  [variant] - blue | green | amber | red | purple
 * @param {number}  [trend]  - Porcentaje de cambio (positivo/negativo)
 */
export default function CardMetric({ label, value, sub, icon = '📊', variant = 'blue', trend }) {
    const v = VARIANTS[variant] ?? VARIANTS.blue;
    const trendPositive = trend > 0;

    return (
        <div className={`rounded-2xl p-5 shadow-sm flex items-start gap-4 ${v.wrap}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${v.icon}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium uppercase tracking-wide truncate ${v.label}`}>{label}</p>
                <p className={`text-2xl font-bold mt-0.5 leading-tight ${v.value}`}>{value}</p>
                <div className="flex items-center gap-2 mt-1">
                    {trend !== undefined && (
                        <span className={`text-xs font-semibold ${trendPositive ? 'text-green-600' : 'text-red-500'}`}>
                            {trendPositive ? '▲' : '▼'} {Math.abs(trend)}%
                        </span>
                    )}
                    {sub && <span className={`text-xs truncate ${v.label}`}>{sub}</span>}
                </div>
            </div>
        </div>
    );
}
