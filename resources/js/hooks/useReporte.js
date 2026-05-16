import { useState, useEffect, useCallback } from 'react';

/**
 * useReporte
 * Responsabilidad única: gestionar el ciclo fetch → loading → data → error
 * de un endpoint de reportes, con soporte para recarga manual.
 *
 * @param {string} endpoint - Ej: 'reportes/ventas'
 * @param {object} params   - Query params que se convierten a ?key=value
 */
export function useReporte(endpoint, params = {}) {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const paramsKey = JSON.stringify(params);

    const cargar = useCallback(() => {
        setLoading(true);
        setError(null);

        const qs  = new URLSearchParams(params).toString();
        const url = `/api/${endpoint}${qs ? '?' + qs : ''}`;

        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error(`Error ${res.status}`);
                return res.json();
            })
            .then(setData)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, paramsKey]);

    useEffect(() => { cargar(); }, [cargar]);

    return { data, loading, error, recargar: cargar };
}
