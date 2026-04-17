import React from 'react';
import { createRoot } from 'react-dom/client';
import Pedidos from './components/Pedidos/Pedidos';

const container = document.getElementById('pedidos-app');
if (container) {
    createRoot(container).render(<Pedidos />);
}
