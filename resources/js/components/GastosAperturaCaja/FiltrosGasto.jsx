import React from 'react';
import { TIPOS } from './constants';

export default function FiltrosGasto({ gastos, filtroTipo, onCambiar }) {
    return (
        <div className="flex gap-2 mb-4 flex-wrap">
            <button
                type="button"
                onClick={() => onCambiar('todos')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filtroTipo === 'todos'
                        ? 'bg-gray-800 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
                Todos ({gastos.length})
            </button>

            {TIPOS.map((t) => {
                const count = gastos.filter((g) => g.tipo === t.value).length;
                if (count === 0) return null;
                return (
                    <button
                        key={t.value}
                        type="button"
                        onClick={() => onCambiar(t.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            filtroTipo === t.value
                                ? 'bg-gray-800 text-white'
                                : `${t.color} border border-transparent hover:opacity-80`
                        }`}
                    >
                        {t.label} ({count})
                    </button>
                );
            })}
        </div>
    );
}
