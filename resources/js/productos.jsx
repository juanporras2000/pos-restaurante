import React from 'react';
import { createRoot } from 'react-dom/client';
import Productos from './components/Productos/Productos';

const container = document.getElementById('productos-app');
if (container) {
    createRoot(container).render(<Productos />);
}
