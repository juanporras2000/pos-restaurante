import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Wrapper delgado sobre las clases .modal-overlay/.modal-panel* ya existentes
 * en app.css. Agrega lo que ningún modal del proyecto tenía: semántica de
 * diálogo, cierre con Escape, foco inicial y click-fuera-para-cerrar.
 */
export default function Modal({ abierto, onCerrar, size = 'md', children, className = '' }) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!abierto) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onCerrar();
        };
        document.addEventListener('keydown', onKeyDown);

        const primerFocusable = panelRef.current?.querySelector(FOCUSABLE);
        primerFocusable?.focus();

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [abierto, onCerrar]);

    if (!abierto) return null;

    return (
        <div
            className="modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onCerrar();
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                className={`${size === 'lg' ? 'modal-panel-lg' : 'modal-panel'} ${className}`}
            >
                {children}
            </div>
        </div>
    );
}

Modal.propTypes = {
    abierto: PropTypes.bool.isRequired,
    onCerrar: PropTypes.func.isRequired,
    size: PropTypes.oneOf(['md', 'lg']),
    children: PropTypes.node,
    className: PropTypes.string,
};
