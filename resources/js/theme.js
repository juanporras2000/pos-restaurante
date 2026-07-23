/**
 * theme.js — control de modo oscuro/claro. Vanilla JS sin dependencia de React
 * porque lo usa tanto el sidebar (Alpine.js en pos.blade.php/guest.blade.php)
 * como los roots React standalone (perfiles.jsx).
 */
const KEY = 'theme';

export function getPreferredTheme() {
    const stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function setTheme(theme) {
    localStorage.setItem(KEY, theme);
    applyTheme(theme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function toggleTheme() {
    setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
}

export function initTheme() {
    applyTheme(getPreferredTheme());

    // Si el usuario nunca eligió manualmente, seguir la preferencia del SO en vivo.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
}
