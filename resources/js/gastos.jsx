import React from 'react';
import { createRoot } from 'react-dom/client';
import Gastos from './components/GastosAperturaCaja/Gastos';

const container = document.getElementById('gastos-app');
if (container) {
    createRoot(container).render(<Gastos />);
}
