import React from 'react';
import { createRoot } from 'react-dom/client';
import Insumos from './components/Insumos/Insumos';

const el = document.getElementById('insumos-app');
if (el) createRoot(el).render(<Insumos />);
