import React from 'react';
import PropTypes from 'prop-types';

const SIZES = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-4',
    lg: 'h-8 w-8 border-4',
};

/**
 * Spinner de carga canónico del proyecto. Reemplaza los SVG/div copy-pasteados
 * en cada módulo (Productos, Configuraciones, Reportes, Pedidos...).
 */
export default function Spinner({ size = 'md', className = 'text-blue-500' }) {
    return (
        <div
            role="status"
            aria-label="Cargando"
            className={`inline-block ${SIZES[size]} border-current border-t-transparent rounded-full animate-spin ${className}`}
        />
    );
}

Spinner.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
};
