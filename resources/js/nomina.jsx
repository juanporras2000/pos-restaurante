import React from 'react';
import { createRoot } from 'react-dom/client';
import Nomina from './components/Nomina/Nomina';

const container = document.getElementById('nomina-app');
if (container) {
    createRoot(container).render(<Nomina />);
}
