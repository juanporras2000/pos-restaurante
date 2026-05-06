import React from 'react';
import { createRoot } from 'react-dom/client';
import Gastos from './components/Gastos/Gastos';

const container = document.getElementById('gastos-app');
if (container) {
    createRoot(container).render(<Gastos />);
}
