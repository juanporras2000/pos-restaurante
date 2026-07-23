import { initTheme, toggleTheme } from './theme';

initTheme();
window.toggleTheme = toggleTheme;

// Import dinámico: si bootstrap/echo lanzan un error (ej: falta config de Reverb),
// no debe bloquear la inicialización del tema de arriba, que ya corrió.
import('./bootstrap').catch((e) => console.error('Error cargando bootstrap.js', e));
import('./echo').catch((e) => console.error('Error cargando echo.js', e));
import('./services/axios.js').catch((e) => console.error('Error cargando services/axios.js', e));
