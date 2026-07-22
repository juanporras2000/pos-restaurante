import { useState, useEffect, useCallback } from 'react';
import axios from '../services/axios';
/**
 * useReporte
 * Responsabilidad única: gestionar el ciclo fetch → loading → data → error
 * de un endpoint de reportes, con soporte para recarga manual.
 *
 * @param {string} endpoint - Ej: 'reportes/ventas'
 * @param {object} params   - Query params que se convierten a ?key=value
 */
export function useReporte(endpoint, params = {}) {
    const [data,     setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const paramsKey = JSON.stringify(params);

    const cargar = useCallback(() => {
        setLoading(true);
        setError(null);

        // Axios se encarga automáticamente de serializar el objeto 'params' en la URL
        axios.get(`/${endpoint}`, { params })
            .then((res) => {
                setData(res.data);
            })
            .catch((e) => {
                // Captura el mensaje de error del servidor o el de Axios por defecto
                const msg = e.response?.data?.message || `Error ${e.response?.status || e.message}`;
                setError(msg);
            })
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, paramsKey]);

    useEffect(() => { cargar(); }, [cargar]);

    return { data, loading, error, recargar: cargar };
}
