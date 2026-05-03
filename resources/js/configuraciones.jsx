import React from 'react';
import { createRoot } from 'react-dom/client';
import Configuraciones from './components/Configuraciones/Configuraciones';

const container = document.getElementById('configuraciones-app');
if (container) {
    createRoot(container).render(<Configuraciones />);
}
