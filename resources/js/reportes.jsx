import React from 'react';
import { createRoot } from 'react-dom/client';
import Reportes from './components/Reportes/Reportes';

const el = document.getElementById('reportes-app');
if (el) createRoot(el).render(<Reportes />);
