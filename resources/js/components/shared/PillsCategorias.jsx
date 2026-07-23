import React from 'react';

/**
 * Barra de pills (botones redondeados) para filtrar por categoría.
 *
 * Props:
 *   - categorias: [{ id, nombre }]           — lista de categorías
 *   - activa: string | number | null          — id activo ('' o null = "Todos")
 *   - onChange: (id: string|null) => void     — callback al cambiar
 *   - size: 'sm' | 'md'                       — tamaño de texto/padding (default 'sm')
 */
export default function PillsCategorias({ categorias = [], activa = null, onChange, size = 'sm' }) {
    if (categorias.length === 0) return null;

    const esActiva = (id) => {
        if (activa === null || activa === '' || activa === undefined) return id === null;
        return String(activa) === String(id);
    };

    const cls = size === 'md'
        ? 'px-3 py-1.5 text-sm'
        : 'px-3 py-1 text-xs';

    const pill = (activo) =>
        activo
            ? `bg-primary text-white shadow-sm`
            : `bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600`;

    return (
        <div className="flex justify-center flex-wrap lg:justify-normal gap-2 lg:pb-1 ">
            <button
                type="button"
                onClick={() => onChange(null)}
                aria-pressed={esActiva(null)}
                className={`flex-shrink-0 ${cls} rounded-full font-medium transition-colors ${pill(esActiva(null))}`}
            >
                Todos
            </button>
            {categorias.map((cat) => (
                <button
                    key={cat.id}
                    type="button"
                    onClick={() => onChange(esActiva(cat.id) ? null : cat.id)}
                    aria-pressed={esActiva(cat.id)}
                    className={`flex-shrink-0 ${cls} rounded-full font-medium transition-colors ${pill(esActiva(cat.id))}`}
                >
                    {cat.nombre}
                </button>
            ))}
        </div>
    );
}
