import { useEffect, useState } from 'react';
import { getPreferredTheme, toggleTheme } from '../theme';

/**
 * useTheme — hook chico para roots React standalone (perfiles.jsx) que
 * necesitan reflejar el tema activo en su propio ícono de toggle.
 * La lógica real (localStorage, prefers-color-scheme, clase en <html>)
 * vive en theme.js y ya corre desde app.js/el script anti-FOUC.
 */
export function useTheme() {
    const [theme, setThemeState] = useState(() => getPreferredTheme());

    useEffect(() => {
        const onChange = (e) => setThemeState(e.detail);
        window.addEventListener('themechange', onChange);
        return () => window.removeEventListener('themechange', onChange);
    }, []);

    return { theme, toggle: toggleTheme };
}
