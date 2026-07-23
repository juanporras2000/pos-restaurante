import { useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import ReciboImpresion from '../components/Pedidos/ReciboImpresion';
import axios from '../services/axios'

// ── Caché a nivel de módulo — se carga una vez por sesión de navegador ─────────
let _configCache = null;
let _configPending = null;

/**
 * Carga todas las configuraciones del tenant desde la API.
 * Reutiliza la promesa en vuelo si ya hay una en curso (evita doble fetch).
 */
function cargarConfiguracion() {
    if (_configCache) return Promise.resolve(_configCache);
    if (_configPending) return _configPending;

    _configPending = axios.get('/configuraciones')
        .then((r) => {
            const arr = r.data;
            const cfg = Object.fromEntries(arr.map((c) => [c.clave, c.valor]));
            _configCache   = cfg;
            _configPending = null;
            return cfg;
        })
        .catch(() => {
            _configPending = null;
            return {};
        });

    return _configPending;
}

/**
 * Inyecta en <head> una hoja de estilos que oculta todo el DOM salvo
 * #pos-print-root cuando el navegador envía a imprimir.
 * La función es idempotente: solo inserta el <style> una vez.
 */
function inyectarEstilosImpresion() {
    const STYLE_ID = 'pos-print-styles';
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        @media print {
            body > *:not(#pos-print-root) { display: none !important; }
            #pos-print-root { display: block !important; }
            @page { margin: 6mm; }
        }
        @media screen {
            #pos-print-root { display: none !important; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Obtiene (o crea) el contenedor DOM exclusivo para la impresión.
 */
function obtenerContenedorImpresion() {
    const ID = 'pos-print-root';
    let container = document.getElementById(ID);
    if (!container) {
        container = document.createElement('div');
        container.id = ID;
        document.body.appendChild(container);
    }
    return container;
}

/**
 * useImprimir
 * Responsabilidad única: exponer la función imprimir(pedido) que
 * renderiza ReciboImpresion de forma imperativa y dispara window.print().
 *
 * @returns {{ imprimir: (pedido: object) => Promise<void> }}
 */
export function useImprimir() {
    const imprimir = useCallback(async (pedido) => {
        inyectarEstilosImpresion();
        const configuracion = await cargarConfiguracion();

        const container = obtenerContenedorImpresion();
        const root = createRoot(container);

        root.render(
            <ReciboImpresion pedido={pedido} configuracion={configuracion} />
        );

        // Dos frames de animación garantizan que React terminó de pintar
        // antes de que el navegador abra el diálogo de impresión.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.print();
                // Limpiar el árbol React después de que cierre el diálogo
                setTimeout(() => root.unmount(), 800);
            });
        });
    }, []);

    return { imprimir };
}

/**
 * Invalida la caché de configuración.
 * Llamar después de guardar cambios en AjustesGenerales para que el
 * próximo recibo refleje la nueva información del negocio.
 */
export function invalidarCacheConfiguracion() {
    _configCache   = null;
    _configPending = null;
}
