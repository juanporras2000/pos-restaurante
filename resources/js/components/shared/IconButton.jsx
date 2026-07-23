import React from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
    default: 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
    danger: 'text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30',
    primary: 'text-gray-400 dark:text-gray-500 hover:text-primary hover:bg-primary/10',
};

/**
 * Botón de ícono con tamaño táctil mínimo (44px) y aria-label obligatorio.
 * Reemplaza los `<button><svg/></button>` sueltos sin nombre accesible ni
 * área de toque suficiente repartidos por todo el proyecto.
 */
export default function IconButton({
    children,
    onClick,
    variant = 'default',
    className = '',
    disabled = false,
    type = 'button',
    'aria-label': ariaLabel,
    title,
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            title={title ?? ariaLabel}
            className={`inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-40 disabled:pointer-events-none ${VARIANTS[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

IconButton.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['default', 'danger', 'primary']),
    className: PropTypes.string,
    disabled: PropTypes.bool,
    type: PropTypes.oneOf(['button', 'submit']),
    'aria-label': PropTypes.string.isRequired,
    title: PropTypes.string,
};
