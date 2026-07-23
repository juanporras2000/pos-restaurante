import React from 'react';
import PropTypes from 'prop-types';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const PERIODOS = [
    { value: 'dia',    label: 'Hoy' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes',    label: 'Este mes' },
];

/**
 * SelectorPeriodo
 * Responsabilidad única: gestionar la selección de período y/o rango de fechas.
 * El padre recibe el estado a través de onChange({ periodo, desde, hasta }).
 *
 * Props:
 *  - periodo   : string  — 'dia' | 'semana' | 'mes' | 'custom'
 *  - desde     : string  — YYYY-MM-DD, solo activo cuando periodo === 'custom'
 *  - hasta     : string  — YYYY-MM-DD, solo activo cuando periodo === 'custom'
 *  - onChange  : fn({ periodo, desde, hasta })
 */
export default function SelectorPeriodo({ periodo, desde, hasta, onChange }) {
    const hoy = new Date().toISOString().split('T')[0];

    const seleccionarPeriodo = (value) => {
        onChange({ periodo: value, desde: '', hasta: '' });
    };

    const actualizarFecha = (campo, value) => {
        const nuevoDesde = campo === 'desde' ? value : desde;
        const nuevoHasta = campo === 'hasta' ? value : hasta;
        onChange({ periodo: 'custom', desde: nuevoDesde, hasta: nuevoHasta });
    };

    return (
        <div className="flex flex-col items-center 2xl:flex-row justify-center lg:justify-between lg:items-end 2xl:items-center gap-2 flex-1 w-fit">
            {/* Botones de período rápido */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
                {PERIODOS.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => seleccionarPeriodo(p.value)}
                        className={`px-2 py-1 lg:px-4 lg:py-2 text-sm font-medium rounded-lg transition-all ${
                            periodo === p.value
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Separador visual */}
            <span className="text-gray-300 select-none hidden 2xl:block">|</span>

            {/* Rango personalizado */}
            <div className={`flex items-center gap-1.5 bg-white dark:bg-gray-800 border rounded-xl px-1 lg:px-3 py-1.5 shadow-sm transition-colors ${
                periodo === 'custom' ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
            }`}>
                <CalendarDaysIcon className={`h-4 w-4 flex-shrink-0 ${periodo === 'custom' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
                <input
                    type="date"
                    value={desde}
                    max={hasta || hoy}
                    onChange={(e) => actualizarFecha('desde', e.target.value)}
                    aria-label="Fecha desde"
                    className="text-sm text-gray-700 dark:text-gray-300 bg-transparent border-none outline-none p-0 cursor-pointer"
                />
                <span className="text-gray-300 text-xs">→</span>
                <input
                    type="date"
                    value={hasta}
                    min={desde}
                    max={hoy}
                    onChange={(e) => actualizarFecha('hasta', e.target.value)}
                    aria-label="Fecha hasta"
                    className="text-sm text-gray-700 dark:text-gray-300 bg-transparent border-none outline-none p-0 cursor-pointer"
                />
            </div>
        </div>
    );
}

SelectorPeriodo.propTypes = {
    periodo: PropTypes.string.isRequired,
    desde: PropTypes.string.isRequired,
    hasta: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};
