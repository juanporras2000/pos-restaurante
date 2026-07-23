import React from 'react';
import { createRoot } from 'react-dom/client';
import { Perfiles } from './components/pefiles/Perfiles';
import { initTheme } from './theme';

initTheme();

const container = document.getElementById('perfiles-app');
if (container) {
    createRoot(container).render(<Perfiles />);
}
