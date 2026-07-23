import React from 'react';
import {
    BanknotesIcon,
    ClipboardDocumentListIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { CardMetricPropTypes } from '../../propTypes';

const VARIANTS = {
    blue: {
        wrap: 'bg-white dark:bg-gray-800 border border-primary/20',
        icon: 'bg-primary/10 text-primary',
        label: 'text-gray-500 dark:text-gray-400',
        value: 'text-gray-900 dark:text-gray-100',
        trend: 'text-primary',
    },
    green: {
        wrap: 'bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900',
        icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        label: 'text-gray-500 dark:text-gray-400',
        value: 'text-gray-900 dark:text-gray-100',
        trend: 'text-green-600 dark:text-green-400',
    },
    amber: {
        wrap: 'bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-900',
        icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        label: 'text-gray-500 dark:text-gray-400',
        value: 'text-gray-900 dark:text-gray-100',
        trend: 'text-amber-600 dark:text-amber-400',
    },
    red: {
        wrap: 'bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900',
        icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        label: 'text-gray-500 dark:text-gray-400',
        value: 'text-gray-900 dark:text-gray-100',
        trend: 'text-red-600 dark:text-red-400',
    },
    purple: {
        wrap: 'bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900',
        icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        label: 'text-gray-500 dark:text-gray-400',
        value: 'text-gray-900 dark:text-gray-100',
        trend: 'text-purple-600 dark:text-purple-400',
    },
};

const ICONS = {
    coins: BanknotesIcon,
    receipt: ClipboardDocumentListIcon,
    chart: ArrowTrendingUpIcon,
    check: CheckCircleIcon,
    default: ChartBarIcon,
};

/**
 * CardMetric
 * @param {string}  label    - Texto descriptivo
 * @param {string}  value    - Valor principal formateado
 * @param {string}  [sub]    - Subtexto opcional
 * @param {string}  [icon]   - Key de ICONS (coins, receipt, chart, check) o emoji directo
 * @param {string}  [variant] - blue | green | amber | red | purple
 * @param {number}  [trend]  - Porcentaje de cambio (positivo/negativo)
 */
export default function CardMetric({ label, value, sub, icon = 'default', variant = 'blue', trend }) {
    const v = VARIANTS[variant] ?? VARIANTS.blue;
    const trendPositive = trend > 0;
    const IconComponent = ICONS[icon] ?? ChartBarIcon;

    return (
        <div className={`rounded-2xl p-4 md:p-5 shadow-sm flex items-start gap-3 md:gap-4 min-w-0 ${v.wrap}`}>

            {/* El icono disminuye sutilmente a w-10 h-10 en móvil para otorgar más espacio al texto */}
            <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${v.icon}`}>
                <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
            </div>

            {/* Bloque de textos con control estricto de desborde (min-w-0) */}
            <div className="flex-1 min-w-0">
                <p className={`text-[11px] md:text-xs font-medium uppercase tracking-wide truncate ${v.label}`} title={label}>
                    {label}
                </p>

                {/* El valor numérico se adapta: text-xl en móvil para evitar rupturas y text-2xl en PC */}
                <p className={`text-xl md:text-2xl font-black md:font-bold mt-0.5 leading-none md:leading-tight truncate ${v.value}`} title={value}>
                    {value}
                </p>

                {/* Contenedor inferior adaptativo: flex-wrap por si la tendencia y el sub no caben en una sola línea en pantallas muy angostas */}
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1.5 md:mt-1">
                    {trend !== undefined && (
                        <span className={`text-[11px] md:text-xs font-bold md:font-semibold flex-shrink-0 ${trendPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                            {trendPositive ? '▲' : '▼'} {Math.abs(trend)}%
                        </span>
                    )}
                    {sub && (
                        <span className={`text-[11px] md:text-xs truncate max-w-full text-gray-500 ${v.label}`} title={sub}>
                            {sub}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

CardMetric.propTypes = CardMetricPropTypes;

