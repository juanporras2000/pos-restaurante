import React from 'react';
import PropTypes from 'prop-types';

export function Spinner() {
    return (
        <div className="flex items-center justify-center h-48">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export function ErrorCard({ msg, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-sm text-red-500">
            <p>{msg}</p>
            {onRetry && (
                <button onClick={onRetry} className="px-3 py-1.5 text-xs font-medium bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100">
                    Reintentar
                </button>
            )}
        </div>
    );
}

ErrorCard.propTypes = {
    msg: PropTypes.string.isRequired,
    onRetry: PropTypes.func,
};
