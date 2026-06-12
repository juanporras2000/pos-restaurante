import React from 'react';
import { createRoot } from 'react-dom/client';
import { Landing } from './components/Landing/Landing';

const container = document.getElementById('landing-app');
if (container) {
    createRoot(container).render(<Landing />);
}
